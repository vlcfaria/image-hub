from typing import Union
from fastapi import FastAPI, Request
import os
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.db import db
import logging
from .api.routers import images
from .api.services import exceptions

logging.basicConfig(level=logging.INFO)

qdrant_url = os.environ.get("QDRANT_URL")
static_root = os.environ.get("STATIC_ROOT")

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

#Serve the static files TODO move this to nginx static file serving
app.mount("/static", StaticFiles(directory=static_root), name="static")

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