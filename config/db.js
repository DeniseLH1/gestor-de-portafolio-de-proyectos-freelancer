import { MongoClient } from "mongodb";

try {
  process.loadEnvFile();
} catch {
  
}

const { MONGODB_URI, DB_NAME } = process.env;

if (!MONGODB_URI) {
  throw new Error("Falta la variable de entorno MONGODB_URI");
}

if (!DB_NAME) {
  throw new Error("Falta la variable de entorno DB_NAME");
}

const client = new MongoClient(MONGODB_URI);

let db;

export async function connectDB() {
  if (db) return db;

  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Conectado a MongoDB Atlas: base de datos "${DB_NAME}"`);

  return db;
}

export function getClient() {
  return client;
}

export async function closeDB() {
  await client.close();
  db = undefined;
}

export default connectDB;