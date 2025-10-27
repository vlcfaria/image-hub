from fastapi import APIRouter
from .routers import images, search

router = APIRouter(
    prefix="/api",
    tags=["api"],
    responses={404: {"description": "Not found"}},
)

router.include_router(images.router)
router.include_router(search.router)