from typing import Union
from fastapi import FastAPI
import os
from contextlib import asynccontextmanager
from app.db import db
import logging
from .api.routers import images

logging.basicConfig(level=logging.INFO)

qdrant_url = os.environ.get("QDRANT_URL")

#Function below runs on startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_uri = os.environ.get('DATABASE_URL')
    await db.connect_to_database(mongo_uri)
    yield
    await db.close_database_connection()

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(images.router)