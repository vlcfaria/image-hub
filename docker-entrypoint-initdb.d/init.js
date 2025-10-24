const appDb = process.env.MONGO_INITDB_DATABASE;
const appUser = process.env.MONGO_INITDB_USERNAME;
const appPass = process.env.MONGO_INITDB_PASSWORD;

print(`Creating database: ${appDb}`);

db = db.getSiblingDB(appDb);

console.log("Creating the user...")
db.createUser({
    user: appUser,
    pwd: appPass,
    roles: [{ role: 'readWrite', db: appDb }]
});

print('Creating collections for the image hub...');
db.createCollection('images');
db.createCollection('users');

print('MongoDB initialization complete. ✅');