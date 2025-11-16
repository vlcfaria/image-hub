from fastapi import UploadFile
from fastembed import SparseTextEmbedding
from transformers import SiglipModel, SiglipProcessor, SiglipTokenizer
from qdrant_client import models
import torch
from ..models.images import RetrievedImageModel
from ...db import vector_db
import magic
from . import exceptions
from transformers.image_utils import load_image
from PIL import Image
import io
from ..utils import database

#TODO push these constants up, as they need to match the seeder
DENSE_VECTOR_NAME="image_embedding"
SPARSE_VECTOR_NAME="text_bm25"

COLLECTION_NAME = 'image_hub'

def get_text_query_dense_embeddings(
    query: str,
    model: SiglipModel,
    tokenizer: SiglipTokenizer
):
    """
    Get the dense embeddings from a text query
    """
    inputs = tokenizer(query, padding='max_length', return_tensors='pt')
    with torch.no_grad():
        text_features = model.get_text_features(**inputs)[0]
    
    return text_features.tolist()

def get_text_query_sparse_vector(
    query: str,
    bm25_model: SparseTextEmbedding
):
    """
    Get the sparse vector from a text query
    """
    sparse_vector = list(bm25_model.query_embed(query))[0]

    return models.SparseVector(
        indices=sparse_vector.indices.tolist(),
        values=sparse_vector.values.tolist()
    )

async def semantic_search(
    query: str,
    n: int,
    page: int,
    model: SiglipModel,
    tokenizer: SiglipTokenizer
) -> list[RetrievedImageModel]:
    "Applies semantic search over a query"

    text_features = get_text_query_dense_embeddings(query, model, tokenizer)
    
    hits = vector_db.client.search(
        collection_name=COLLECTION_NAME,
        query_vector = (DENSE_VECTOR_NAME, text_features),
        limit=n,
        offset=(page - 1)*n,
    )

    return await database.hydrate_from_qdrant(hits)

async def semantic_search_from_image(
    file: UploadFile,
    n: int,
    page: int,
    model: SiglipModel,
    processor: SiglipProcessor,
) -> list[RetrievedImageModel]:
    "Applies semantic search over an image query"

    contents = await file.read()

    mime = magic.from_buffer(contents, mime=True)
    if mime != 'image/jpeg':
        raise exceptions.InvalidMediaType(f"Invalid MIME type: {mime}. Only image/jpeg is supported")
    
    image = load_image(Image.open(io.BytesIO(contents)))
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        image_vector = model.get_image_features(**inputs).squeeze().tolist()

    hits = vector_db.client.search(
        collection_name=COLLECTION_NAME,
        query_vector=(DENSE_VECTOR_NAME, image_vector),
        limit=n,
        offset=(page - 1)*n,
    )

    return await database.hydrate_from_qdrant(hits)

async def keyword_search(
    query: str,
    n: int,
    page: int,
    bm25_model: SparseTextEmbedding,
):
    """
    Perform traditional keyword search on metadata using BM25
    """

    query_sparse_vector = get_text_query_sparse_vector(query, bm25_model)

    hits = vector_db.client.search(
        collection_name=COLLECTION_NAME,
        query_vector=models.NamedSparseVector(name=SPARSE_VECTOR_NAME, vector=query_sparse_vector),
        limit=n,
        offset=(page - 1) * n,
    )
    
    return await database.hydrate_from_qdrant(hits)

async def hybrid_search(
    query: str,
    n: int,
    page: int,
    model: SiglipModel,
    tokenizer: SiglipTokenizer,
    bm25_model: SparseTextEmbedding
):
    """
    Perform hybrid search from a text query. Does BM25 and dense retrieval, combining both with RRF
    """

    query_dense = get_text_query_dense_embeddings(query, model, tokenizer)
    query_sparse = get_text_query_sparse_vector(query, bm25_model)
    num_to_fetch = page * n * 2 #Fetch twice as much, to allow RRF to kick in

    hybrid_hits = vector_db.client.query_points(
        collection_name=COLLECTION_NAME,
        prefetch=[
            models.Prefetch(
                query=query_dense,
                using=DENSE_VECTOR_NAME,
                limit=num_to_fetch
            ),
            models.Prefetch(
                query=query_sparse,
                using=SPARSE_VECTOR_NAME,
                limit=num_to_fetch
            )
        ],
        query=models.FusionQuery(
            fusion=models.Fusion.RRF
        ),
        limit=n,
        with_payload=True,
        offset=(page - 1) * n,
    )

    return await database.hydrate_from_qdrant(hybrid_hits.points)

