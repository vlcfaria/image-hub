import os
from bson import ObjectId
from fastapi import HTTPException
from transformers import SiglipModel, SiglipTokenizer
from qdrant_client import models
import logging
import torch
from ..models.images import RetrievedImageModel
from ...db import vector_db, db

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
    k: int,
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
        limit=k
    )

    return await hydrate_from_qdrant(hits)
    