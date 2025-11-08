from typing import Annotated
from fastapi import APIRouter, Depends, File, Query, UploadFile
import logging
from ... import dependencies
from transformers import SiglipModel, SiglipProcessor, SiglipTokenizer
from ..models.images import ImageModel, RetrievedImageModel
from ..services import search_service

logging.basicConfig(level=logging.INFO)

router = APIRouter(
    prefix="/search",
    tags=["images"],
    responses={404: {"description": "Not found"}},
)

@router.get(
    '/',
    response_description="Searches",
    response_model=list[RetrievedImageModel]
)
async def text_semantic_search(
    query: str,
    n: Annotated[int, Query(description="Number of results to display")] = 20,
    page: Annotated[int, Query(description="Current page to display. 1-indexed")] = 1,
    model: SiglipModel = Depends(dependencies.get_sglip_model),
    tokenizer: SiglipTokenizer = Depends(dependencies.get_sglip_tokenizer)
):
    """
    Perform semantic search on the indexed database, from a text query
    """
    return await search_service.semantic_search(query, n, page, model, tokenizer)

@router.post(
    '/by-image',
    response_description="",
    response_model=list[RetrievedImageModel]
)
async def image_semantic_search(
    file: UploadFile = File(..., description=".jpg image"),
    n: Annotated[int, Query(description="Number of results to display")] = 20,
    page: Annotated[int, Query(description="Current page to display. 1-indexed")] = 1,
    model: SiglipModel = Depends(dependencies.get_sglip_model),
    processor: SiglipProcessor = Depends(dependencies.get_sglip_processor),
):
    """
    Perform semantic search on the indexed database, from an image query
    """
    
    return await search_service.semantic_search_from_image(file, n, page, model, processor)
