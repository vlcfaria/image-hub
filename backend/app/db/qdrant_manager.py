import logging
from qdrant_client import QdrantClient

class QdrantManager:
    client: QdrantClient = None

    async def connect_to_database(self, path: str):
        logging.info("Connecting to MongoDB.")
        self.client = QdrantClient(url=path)
        logging.info("✅ Sucessfully connected to Qdrant")

    async def close_database_connection(self):
        logging.info("Closing connection with Qdrant.")
        await self.client.close()
        logging.info("✅ Closed connection with Qdrant.")