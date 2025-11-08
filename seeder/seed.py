import asyncio
import pandas as pd
import numpy as np
from qdrant_client import QdrantClient, models
from qdrant_client.http.models import PointStruct
from pathlib import Path
import os
import logging
import json
from tenacity import retry, stop_after_attempt, wait_fixed
import pymongo

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

# Configuration --
MONGO_URI = os.getenv("DATABASE_URL")
MONGO_COLLECTION = "images"

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_COLLECTION = "image_hub"
VECTOR_SIZE = 768 #SET THE SAME AS YOUR MODEL -> SigLIP-base-patch16-224 uses 768
QDRANT_UPSERT_BATCH_SIZE = 2048 # Upsert to Qdrant in batches

DATA_DIR = Path("/seeder/data")
IMAGES_URL_DIR = os.getenv("IMAGES_URL_PATH")
METADATA_CSV = DATA_DIR / "metadata.csv"
VECTOR_FILE = DATA_DIR / "vectors.npy"
ID_FILE = DATA_DIR / "ids.json"

DENSE_VECTOR_NAME="image_embedding"
SPARSE_VECTOR_NAME="text_bm25"

#Wait services to start
@retry(stop=stop_after_attempt(10), wait=wait_fixed(3))
async def wait_for_mongo(client):
    try:
        await client.admin.command('ping')
        log.info("MongoDB is online.")
    except Exception as e:
        log.warning(f"Waiting for MongoDB... ({e})")
        raise

@retry(stop=stop_after_attempt(10), wait=wait_fixed(3))
def wait_for_qdrant(client):
    try:
        client.info()
        log.info("Qdrant is online.")
    except Exception as e:
        log.warning(f"Waiting for Qdrant... ({e})")
        raise

async def main():
    #Check if we should run seeder
    if os.getenv("RUN_SEEDER", "false").lower() != "true":
        log.info("RUN_SEEDER is not 'true', skipping database seeding.")
        return
        
    log.info("RUN_SEEDER=true. Seeder script started. Waiting for databases...")

    # setup DBs
    mongo_client = pymongo.AsyncMongoClient(MONGO_URI)
    qdrant_client = QdrantClient(url=QDRANT_URL)
    
    await wait_for_mongo(mongo_client)
    wait_for_qdrant(qdrant_client)
    
    col = mongo_client.main_db.get_collection(MONGO_COLLECTION)
    
    # Setup collection for qdrant
    try:
        qdrant_client.recreate_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config={
                DENSE_VECTOR_NAME: models.VectorParams(size=VECTOR_SIZE, distance=models.Distance.COSINE),
            },
            sparse_vectors_config= {
                SPARSE_VECTOR_NAME: models.SparseVectorParams(modifier=models.Modifier.IDF,)
            }
        )
        qdrant_client.create_payload_index(
            collection_name=QDRANT_COLLECTION,
            field_name='mongo_id',
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        log.info(f"Qdrant collection '{QDRANT_COLLECTION}' created.")
    except Exception as e:
        log.warning(f"Qdrant collection already exists or error: {e}")

    # Load metadata
    try:
        log.info(f"Loading metadata from {METADATA_CSV}...")
        df = pd.read_csv(METADATA_CSV, sep='\t').fillna("")
        df.columns = df.columns.str.lower().str.replace('-', '_')
        if 'id' not in df.columns:
            raise ValueError("CSV must contain an 'id' column.")
            
        log.info(f"Loading vectors from {VECTOR_FILE}...")
        all_vectors = np.load(VECTOR_FILE)
        
        log.info(f"Loading vector IDs from {ID_FILE}...")
        with open(ID_FILE, 'r') as f:
            all_ids = json.load(f)

    except FileNotFoundError as e:
        log.error(f"FATAL: Missing required data file: {e}. Stopping seeder.")
        return
    except Exception as e:
        log.error(f"FATAL: Error loading data: {e}. Stopping seeder.")
        return

    if len(all_ids) != len(all_vectors):
        log.error("FATAL: Mismatch between number of IDs and vectors. Check your pre-computation script.")
        return

    # Map id -> vector
    log.info("Creating vector lookup map...")
    vector_map = dict(zip(all_ids, all_vectors))
    log.info("Lookup map created.")

    # Insert into index
    log.info(f"Starting to seed {len(df)} images from metadata CSV...")
    qdrant_points_batch = []
    
    for _, row in df.iterrows():
        image_id = str(row['id'])
        
        # Get vector
        vector = vector_map.get(image_id)
        
        if vector is None:
            log.warning(f"Skipping {image_id}: Vector not found in pre-computed files.")
            continue
            
        # 2. Check if already seeded (by imageId) to make script idempotent
        try:
            existing = await col.find_one({"url": f"{IMAGES_URL_DIR}/{image_id}.jpg"})
            if existing:
                log.info(f"Skipping {image_id}: Already found in MongoDB.")
                continue
        except Exception as e:
            log.error(f"Error checking MongoDB for {image_id}: {e}")
            continue

        # 3. Create Mongo document
        mongo_doc = row.to_dict()
        mongo_doc['url'] = f'{IMAGES_URL_DIR}/{image_id}.jpg' 
        
        # 4. Insert into Mongo
        try:
            result = await col.insert_one(mongo_doc)
            mongo_id = str(result.inserted_id)
            
            # 5. Create Qdrant payload
            payload = {
                "mongo_id": mongo_id,
                "tags": mongo_doc.get("tags", []), # Example filterable field
            }

            #Index sparse data
            text = ' '.join(row.drop(['id', 'file', 'url']))
            sparse_vector_data = models.Document(
                text=text, 
                model="Qdrant/bm25"
            )
            
            # 6. Create Qdrant point
            qdrant_points_batch.append(
                PointStruct(
                    id=int(image_id),
                    vector={
                        DENSE_VECTOR_NAME: vector.tolist(),
                        SPARSE_VECTOR_NAME: sparse_vector_data
                    },
                    payload=payload
                )
            )
            
            # 7. Upsert to Qdrant in batches
            if len(qdrant_points_batch) >= QDRANT_UPSERT_BATCH_SIZE:
                qdrant_client.upsert(
                    collection_name=QDRANT_COLLECTION,
                    points=qdrant_points_batch,
                    wait=False
                )
                log.info(f"Upserted batch of {len(qdrant_points_batch)} points to Qdrant.")
                qdrant_points_batch.clear()

        except Exception as e:
            log.error(f"Failed to process {image_id}: {e}")
            
            #TODO ROLL BACK
            
    # 6. Upsert any remaining points in the last batch
    if qdrant_points_batch:
        qdrant_client.upsert(
            collection_name=QDRANT_COLLECTION,
            points=qdrant_points_batch,
            wait=True
        )
        log.info(f"Upserted final batch of {len(qdrant_points_batch)} points to Qdrant.")
        
    log.info("Seeding finished successfully.")
    mongo_client.close()

if __name__ == "__main__":
    asyncio.run(main())