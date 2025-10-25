from fastapi import APIRouter, File, Form, UploadFile
import logging
from ..models.images import ImageModel
from ..services import image_service

logging.basicConfig(level=logging.INFO)

router = APIRouter(
    prefix="/images",
    tags=["images"],
    responses={404: {"description": "Not found"}},
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
    return await image_service.get_first_k(1000)

@router.get(
    "/{image_id}",
    response_description="List a single image in the database",
    response_model=ImageModel
)
async def read_single(image_id: str):
    return await image_service.get_from_id(image_id)

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
    return await image_service.handle_image_creation(image_data, file)