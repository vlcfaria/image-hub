import uuid
from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError
from ...db import db
import logging
from ..models.images import ImageModel
import os
import pathlib
import magic

logging.basicConfig(level=logging.INFO)

router = APIRouter(
    prefix="/images",
    tags=["images"],
    responses={404: {"description": "Not found"}},
)

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

@router.get(
    '/',
    response_description="Lists the first 1000 images in the database",
    response_model=list[ImageModel]
)
async def read_all():
    """
    Lists the first 1000 images in the database
    """
    col = get_images_collection()

    return await col.find().to_list(1000)

@router.get(
    "/{image_id}",
    response_description="List a single image in the database",
    response_model=ImageModel
)
async def read_single(image_id: str):
    col = get_images_collection()

    if not ObjectId.is_valid(image_id):
        raise HTTPException(status_code=400, detail=f"Invalid image ID format: {image_id}")

    item = await col.find_one({'_id': ObjectId(image_id)})

    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item

@router.post(
    '/',
    response_description="Creates an image",
    response_model=ImageModel
)
async def create_single(
    image_data: str = Form(..., description="JSON that can be parsed into an ImageModel"), 
    file: UploadFile = File(..., description=".jpg image")
):
    """
    Creates an image in the database along with relevant metadata.
    """
    try:
        image = ImageModel.model_validate_json(image_data)
    except ValidationError as e:
        raise HTTPException(
            status_code=422, detail=f"Invalid image metadata: {e}"
        )
    
    #Save the actual file to disk
    file_extension = pathlib.Path(file.filename).suffix

    if file_extension != '.jpg':
        raise HTTPException(
            status_code=415, detail=f"Invalid image extension: Only .jpg images are supported"
        )

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    save_path = UPLOAD_DIR / unique_filename

    try:
        contents = await file.read()

        #Check the mimetype before saving!
        mime = magic.from_buffer(contents, mime=True)

        if mime != 'image/jpeg':
            raise ValueError(f"Invalid MIME type: {mime}. Only image/jpeg is supported")
        
        with open(save_path, "wb") as f:
            f.write(contents)
    except ValueError as e:
        raise HTTPException(
            status_code=415, detail=f"{e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="There was an error uploading the file."
        )
    finally:
        await file.close()

    #Save metadata for mongoDB
    image.url = f'{IMAGES_URL_PATH}/{unique_filename}'

    col = get_images_collection()

    new_image = image.model_dump(exclude=['id'], by_alias=True)
    result = await col.insert_one(new_image)

    logging.info(result)
    
    created_image = await col.find_one(
        {"_id": result.inserted_id}
    )

    if created_image is None:
        raise HTTPException(status_code=500, detail="Image created but not found.")

    return created_image