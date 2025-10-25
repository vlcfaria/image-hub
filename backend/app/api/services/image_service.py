import pathlib
import uuid
from bson import ObjectId
from fastapi import HTTPException, UploadFile
from ..models.images import ImageModel
from ...db import db
import logging
import os
import magic
from . import exceptions

IMAGES_DIR = os.environ.get('IMAGES_DIR')
IMAGES_URL_PATH = os.environ.get('IMAGES_URL_PATH')
UPLOAD_DIR = pathlib.Path(IMAGES_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_images_collection():
    try:
        return db.db.get_collection("images")
    except RuntimeError as e:
        logging.error(f"Error getting collection: {e}")
        raise HTTPException(
            status_code=503,
            detail="Database connection is not available."
        )

async def get_first_k(k = 1_000):
    col = get_images_collection()

    return await col.find().to_list(k)

async def get_from_id(id: str):
    col = get_images_collection()

    if not ObjectId.is_valid(id):
        raise exceptions.InvalidIDError(f"Invalid image ID format: {id}")

    item = await col.find_one({'_id': ObjectId(id)})

    if item is None:
        raise exceptions.ItemNotFoundError(f"Image with id {id} not found.")

async def save_image_to_disk(file: UploadFile):
    """Saves an image file to disk, generating an unique uuid for it. Returns the image path"""
    file_extension = pathlib.Path(file.filename).suffix

    if file_extension != '.jpg':
        raise exceptions.InvalidMediaType(f"Invalid file extension: {file_extension}. Only .jpeg is supported")

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    save_path = UPLOAD_DIR / unique_filename
    contents = await file.read()

    #Check the mimetype before saving!
    mime = magic.from_buffer(contents, mime=True)
    if mime != 'image/jpeg':
        raise exceptions.InvalidMediaType(f"Invalid MIME type: {mime}. Only image/jpeg is supported")
    
    with open(save_path, "wb") as f:
        f.write(contents)

    return f'{IMAGES_URL_PATH}/{unique_filename}'

async def save_metadata_to_db(image: ImageModel):
    """Saves image database to MongoDB. Returns the newly created object in the database"""
    col = get_images_collection()

    new_image = image.model_dump(exclude=['id'], by_alias=True)
    result = await col.insert_one(new_image)
    
    created_image = await col.find_one(
        {"_id": result.inserted_id}
    )

    if created_image is None:
        raise exceptions.DatabaseError("An error ocurred while creating the image in the database")
    
    return created_image

async def handle_image_creation(image_data: str, file: UploadFile):
    image = ImageModel.model_validate_json(image_data)
    
    #Save file to disk
    image.url = await save_image_to_disk(file)

    #Save metadata to mongoDB
    try:
        created_image = await save_metadata_to_db(image)
    except Exception as e:
        #TODO delete static image from disk

        raise e

    #Save to vector database


    
    return created_image