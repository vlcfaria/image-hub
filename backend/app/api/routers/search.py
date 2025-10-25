from fastapi import APIRouter, Depends
import logging
from ... import dependencies
from transformers import SiglipModel, SiglipTokenizer
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
async def read_all(
    query: str,
    model: SiglipModel = Depends(dependencies.get_sglip_model),
    tokenizer: SiglipTokenizer = Depends(dependencies.get_sglip_tokenizer)
):
    """
    Perform semantic search on the indexed database
    """
    return await search_service.semantic_search(query, 10, model, tokenizer)