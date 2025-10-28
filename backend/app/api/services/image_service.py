import pathlib
import uuid
from bson import ObjectId
from fastapi import HTTPException, UploadFile
from transformers import SiglipModel, SiglipProcessor
from ..models.images import ImageModel
from ...db import db, vector_db
import logging
import os
import magic
from . import exceptions
import torch
from transformers.image_utils import load_image
from qdrant_client.http.models import PointStruct

IMAGES_DIR = os.environ.get('IMAGES_DIR')
IMAGES_URL_PATH = os.environ.get('IMAGES_URL_PATH')
UPLOAD_DIR = pathlib.Path(IMAGES_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
IMAGE_COLLECTION_NAME = 'image_hub'

def get_mongo_images_collection():
    try:
        return db.db.get_collection("images")
    except RuntimeError as e:
        logging.error(f"Error getting collection: {e}")
        raise HTTPException(
            status_code=503,
            detail="Database connection is not available."
        )

async def get_first_k(k = 1_000):
    col = get_mongo_images_collection()

    return await col.find().to_list(k)

async def get_from_id(id: str):
    col = get_mongo_images_collection()

    if not ObjectId.is_valid(id):
        raise exceptions.InvalidIDError(f"Invalid image ID format: {id}")

    item = await col.find_one({'_id': ObjectId(id)})

    if item is None:
        raise exceptions.ItemNotFoundError(f"Image with id {id} not found.")

    return item

async def save_image_to_disk(file: UploadFile):
    """Saves an image file to disk, generating an unique uuid for it. Returns the image url to be returned, and the actual path on disk"""
    file_extension = pathlib.Path(file.filename).suffix

    if file_extension != '.jpg':
        raise exceptions.InvalidMediaType(f"Invalid file extension: {file_extension}. Only .jpeg is supported")
    

    uuid_val = uuid.uuid4()
    unique_filename = f"{uuid_val}{file_extension}"
    save_path = UPLOAD_DIR / unique_filename
    contents = await file.read()

    #Check the mimetype before saving!
    mime = magic.from_buffer(contents, mime=True)
    if mime != 'image/jpeg':
        raise exceptions.InvalidMediaType(f"Invalid MIME type: {mime}. Only image/jpeg is supported")
    
    with open(save_path, "wb") as f:
        f.write(contents)

    return f'{IMAGES_URL_PATH}/{unique_filename}', save_path

async def save_metadata_to_db(image: ImageModel):
    """Saves image database to MongoDB. Returns the newly created object in the database"""
    col = get_mongo_images_collection()

    new_image = image.model_dump(exclude=['id'], by_alias=True)
    result = await col.insert_one(new_image)
    
    created_image = await col.find_one(
        {"_id": result.inserted_id}
    )

    if created_image is None:
        raise exceptions.DatabaseError("An error ocurred while creating the image in the database")
    
    return created_image

async def save_image_to_vector_db(path: pathlib.Path, model: SiglipModel, processor: SiglipProcessor, id: str | int):
    image = load_image(str(path))
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        image_vector = model.get_image_features(**inputs).squeeze().tolist()

    logging.info(f"Inserting {path.stem} with mongo_id {id} and vector {image_vector}")
    point = PointStruct(
        id=path.stem,
        vector=image_vector,
        payload={
            "mongo_id": id,
        }
    )
    
    #In traffic-heavy application, upload this in batches
    return vector_db.client.upsert(
        collection_name=IMAGE_COLLECTION_NAME,
        points=[point],
        wait=False
    )

async def handle_image_creation(image_data: str, file: UploadFile, model: SiglipModel, processor: SiglipProcessor):
    image = ImageModel.model_validate_json(image_data)
    
    #Save file to disk
    image.url, disk_path = await save_image_to_disk(file)

    #Save metadata to mongoDB
    try:
        created_image = await save_metadata_to_db(image)
    except Exception as e: #rollback
        os.unlink(str(disk_path))
        raise e

    #Save to vector database
    try:
        await save_image_to_vector_db(disk_path, model, processor, str(created_image['_id']))
    except Exception as e: #rollback
        col = get_mongo_images_collection()
        col.delete_one({'_id': created_image['_id']})
        os.unlink(str(disk_path))

        raise e


    return created_image