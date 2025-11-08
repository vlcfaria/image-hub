from fastapi import HTTPException
from ...db import vector_db, db
from qdrant_client import models
from ..models.images import RetrievedImageModel
from bson import ObjectId
import logging

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