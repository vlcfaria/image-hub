from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
import logging
from transformers import SiglipModel, SiglipProcessor
from ... import dependencies
from ..models.images import ImageModel, RetrievedImageModel
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
    file: UploadFile = File(..., description=".jpg image"),
    model: SiglipModel = Depends(dependencies.get_sglip_model),
    processor: SiglipProcessor = Depends(dependencies.get_sglip_processor),
):
    """
    Creates an image in the database along with relevant metadata.
    """
    return await image_service.handle_image_creation(image_data, file, model, processor)

@router.get(
    '/related/{image_id}',
    response_description="Lists semantically related images",
    response_model=list[RetrievedImageModel]
)
async def get_related(
    image_id: str,
    n: Annotated[int, Query(description="Number of results to display")] = 5,
    page: Annotated[int, Query(description="Current page to display. 1-indexed")] = 1,
):
    """
    Gets semantically related image, starting from an image in the database
    """

    return await image_service.get_related(image_id, n, page)