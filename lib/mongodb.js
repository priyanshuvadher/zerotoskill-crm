import { MongoClient } from 'mongodb';

const uri = process.env.mongodb+srv:zerotoskill_db_user:2qZCyQEqUfBEII3y@zerotoskilladmin.quicdf2.mongodb.net/?appName=zerotoskilladmin;
const dbName = process.env.zerotoskill_db_user || 'zerotoskill';

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const c = await clientPromise;
  return c.db(dbName);
}
