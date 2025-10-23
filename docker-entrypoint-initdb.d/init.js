//TODO initialize database here
db = db.getSiblingDB('image_hub_db');

db.createCollection('images');
db.images.createIndex({ filename: 1 });