import os
from bson import ObjectId
from fastapi import HTTPException, UploadFile
from transformers import SiglipModel, SiglipProcessor, SiglipTokenizer
from qdrant_client import models
import logging
import torch
from ..models.images import RetrievedImageModel
from ...db import vector_db, db
import magic
from . import exceptions
from transformers.image_utils import load_image
from PIL import Image
import io

MODEL = os.environ.get('ENCODER_MODEL')
COLLECTION_NAME = 'image_hub'

#TODO This needs to be moved elsewhere, but ok for now
def get_images_collection():
    try:
        return db.db.get_collection("images")
    except RuntimeError as e:
        logging.error(f"Error getting collection: {e}")
        raise HTTPException(
            status_code=503,
            detail="Database connection is not available."
        )

async def hydrate_from_qdrant(retrieved: list[models.ScoredPoint]) -> list[RetrievedImageModel]:
    """Get mongo data from qdrant response"""
    col = get_images_collection()

    metadata = await col.find({
        "_id": {
            "$in": [ObjectId(x.payload['mongo_id']) for x in retrieved]
        }
    }).to_list(None)

    metadata_map = {str(doc['_id']): doc for doc in metadata}

    #Build the Model
    ordered_metadata = [
        metadata_map[hit.payload['mongo_id']] | {'score': hit.score} 
        for hit in retrieved 
        if hit.payload['mongo_id'] in metadata_map
    ]

    return ordered_metadata
    
async def semantic_search(
    query: str,
    n: int,
    page: int,
    model: SiglipModel,
    tokenizer: SiglipTokenizer
) -> list[RetrievedImageModel]:
    "Applies semantic search over a query"

    inputs = tokenizer(query, padding='max_length', return_tensors='pt')
    with torch.no_grad():
        text_features = model.get_text_features(**inputs)[0]
    
    hits = vector_db.client.search(
        collection_name=COLLECTION_NAME,
        query_vector = text_features.tolist(),
        limit=n,
        offset=(page - 1)*n,
    )

    return await hydrate_from_qdrant(hits)

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
        query_vector = image_vector,
        limit=n,
        offset=(page - 1)*n,
    )

    return await hydrate_from_qdrant(hits)
