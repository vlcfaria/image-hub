from typing import Annotated, Literal
from fastapi import APIRouter, Depends, File, Query, UploadFile
import logging
from fastembed import SparseTextEmbedding
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
async def text_search(
    query: str,
    type: Literal['semantic', 'keyword', 'hybrid'] = 'semantic',
    n: Annotated[int, Query(description="Number of results to display")] = 20,
    page: Annotated[int, Query(description="Current page to display. 1-indexed")] = 1,
    model: SiglipModel = Depends(dependencies.get_sglip_model),
    tokenizer: SiglipTokenizer = Depends(dependencies.get_sglip_tokenizer),
    bm25_model: SparseTextEmbedding = Depends(dependencies.get_bm25_model)
):
    """
    Perform a search on the indexed database, from a text query. Defaults to semantic search, but hybrid and keyword searches are also available
    """

    if type == 'semantic':
        return await search_service.semantic_search(query, n, page, model, tokenizer)
    if type == 'keyword':
        return await search_service.keyword_search(query, n, page, bm25_model)
    if type == 'hybrid':
        return await search_service.hybrid_search(query, n, page, model, tokenizer, bm25_model)

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
