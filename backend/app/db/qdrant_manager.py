import logging
from qdrant_client import QdrantClient, models

class QdrantManager:
    client: QdrantClient = None

    async def connect_to_database(self, path: str):
        logging.info("Connecting to MongoDB.")
        self.client = QdrantClient(url=path)
        #Idempotent call to create an index in the id field
        self.client.create_payload_index(
            collection_name='image_hub',
            field_name='mongo_id',
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        logging.info("✅ Sucessfully connected to Qdrant")

    async def close_database_connection(self):
        logging.info("Closing connection with Qdrant.")
        await self.client.close()
        logging.info("✅ Closed connection with Qdrant.")