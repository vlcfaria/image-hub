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
from ..utils import database

COLLECTION_NAME = 'image_hub'

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
        query_vector = image_vector,
        limit=n,
        offset=(page - 1)*n,
    )

    return await database.hydrate_from_qdrant(hits)
