import logging
from qdrant_client import QdrantClient, models
from tenacity import retry, stop_after_attempt, wait_fixed

@retry(stop=stop_after_attempt(10), wait=wait_fixed(3))
def _wait_for_qdrant(client):
    try:
        client.info()
        logging.info("Qdrant is online.")
    except Exception as e:
        logging.warning(f"Waiting for Qdrant... ({e})")
        raise


class QdrantManager:
    client: QdrantClient = None

    async def connect_to_database(self, path: str):
        logging.info("Connecting to MongoDB.")
        self.client = QdrantClient(url=path)
        _wait_for_qdrant(self.client)
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