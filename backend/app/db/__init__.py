from .mongo_manager import MongoManager
from .qdrant_manager import QdrantManager

db: MongoManager = MongoManager()
vector_db: QdrantManager = QdrantManager()