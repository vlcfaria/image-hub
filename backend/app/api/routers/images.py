from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException
from ...db import db
import logging
from ..models.images import ImageModel

router = APIRouter(
    prefix="/images",
    tags=["images"],
    responses={404: {"description": "Not found"}},
)

def get_images_collection():
    try:
        return db.db.get_collection("images")
    except RuntimeError as e:
        logging.error(f"Error getting collection: {e}")
        raise HTTPException(
            status_code=503,
            detail="Database connection is not available."
        )

fake_items_db = {"plumbus": {"name": "Plumbus"}, "gun": {"name": "Portal Gun"}}

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
async def create_single(image: ImageModel = Body(...)):
    col = get_images_collection()
    new_image = image.model_dump(exclude=['id'])
    logging.info(new_image)
    result = await col.insert_one(new_image)

    logging.info(result)
    
    created_image = await col.find_one(
        {"_id": result.inserted_id}
    )

    if created_image is None:
        raise HTTPException(status_code=500, detail="Image created but not found.")

    return created_image