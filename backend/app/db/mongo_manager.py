import logging
from pymongo import AsyncMongoClient
from pymongo.database import Database

class MongoManager:
    client: AsyncMongoClient = None
    db: Database = None

    async def connect_to_database(self, path: str):
        logging.info("Connecting to MongoDB.")
        self.client = AsyncMongoClient(path)
        self.db = self.client.main_db
        logging.info("✅ Sucessfully connected to MongoDB")

    async def close_database_connection(self):
        logging.info("Closing connection with MongoDB.")
        await self.client.close()
        logging.info("✅ Closed connection with MongoDB.")