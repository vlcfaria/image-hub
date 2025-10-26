FROM python:3.12

WORKDIR /seeder

COPY ./requirements.txt /seeder/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /seeder/requirements.txt

COPY ./seed.py /seeder/seed.py

COPY ./metadata.csv* /seeder/data/metadata.csv
COPY ./vectors.npy* /seeder/data/vectors.npy
COPY ./ids.json* /seeder/data/ids.json

CMD ["python", "seed.py"]