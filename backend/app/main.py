from typing import Union
from fastapi import FastAPI, Request
import os
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.db import db, vector_db
import logging
from .api.routers import images, search
from .api.services import exceptions
from . import dependencies
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)

qdrant_url = os.environ.get("QDRANT_URL")
static_root = os.environ.get("STATIC_ROOT")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")

#Function below runs on startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    mongo_uri = os.environ.get('DATABASE_URL')
    qdrant_url = os.environ.get('QDRANT_URL')
    await db.connect_to_database(mongo_uri)
    await vector_db.connect_to_database(qdrant_url)

    #Get model and processor to load the cache
    dependencies.get_sglip_model()
    dependencies.get_sglip_processor()
    dependencies.get_sglip_tokenizer()

    yield
    await db.close_database_connection()
    await vector_db.close_database_connection()

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(images.router)
app.include_router(search.router)

#Serve the static files TODO move this to nginx static file serving
app.mount("/static", StaticFiles(directory=static_root), name="static")

#Handle CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Use the list from above
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Exception handling
@app.exception_handler(exceptions.ItemNotFoundError)
async def item_not_found_handler(request: Request, exc: exceptions.ItemNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)},
    )

@app.exception_handler(exceptions.InvalidIDError)
async def invalid_id_handler(request: Request, exc: exceptions.InvalidIDError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )

@app.exception_handler(exceptions.ItemNotFoundError)
async def item_not_found_handler(request: Request, exc: exceptions.ItemNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)}
    )

@app.exception_handler(exceptions.InvalidMediaType)
async def item_not_found_handler(request: Request, exc: exceptions.InvalidMediaType):
    return JSONResponse(
        status_code=415,
        content={"detail": str(exc)}
    )

@app.exception_handler(exceptions.DatabaseError)
async def item_not_found_handler(request: Request, exc: exceptions.DatabaseError):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )