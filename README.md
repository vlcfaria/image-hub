# image-hub

## Running the project

To run the project, clone the repository and run `docker compose up`. This setup all relevant information, including databases. You can then check api docs in `localhost:80/docs`.

## Starting from a image database checkpoint (Seed the initial database state)

If you have an initial database that you would like to index with pre-computed vectors, you can do so using the `qdrant-seeder` service. You will need the files `vectors.npy` which contains the vectors, `metadata.csv` for image metadata and `ids.json` which maps the vector index in `vectors.npy` to an `ID` field in `metadata.csv`. The script was built around the `Art500k` dataset using the `google/siglip-base-patch16-224` CLIP model, so you might need to manually adjust your parameters on the `seeder/seed.py` script. 