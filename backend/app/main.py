from typing import Union
from fastapi import FastAPI
import os
from contextlib import asynccontextmanager
from app.db import db
import logging

logging.basicConfig(level=logging.INFO)

qdrant_url = os.environ.get("QDRANT_URL")

#Function below runs on startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_uri = os.environ.get('DATABASE_URL')
    db.connect_to_database(mongo_uri)
    yield
    await db.close_database_connection()

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}