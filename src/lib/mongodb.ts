import os from 'node:os';
import { MongoClient, Db } from 'mongodb';

/**
 * MongoDB connection utility.
 * Approach: one cached client per process (important for dev hot-reload and
 * serverless). Env is read at connect time so tests can point it elsewhere.
 */
interface MongoConnection {
  client: MongoClient;
  db: Db;
}

const globalForMongo = globalThis as unknown as { __mongo?: Promise<MongoConnection> };

async function connect(): Promise<MongoConnection> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/client_starter';
  const dbName = process.env.MONGODB_DB || 'client_starter';
  // Explicit os adapter: the driver otherwise uses a dynamic import() that Jest cannot run.
  const client = new MongoClient(uri, { runtimeAdapters: { os } });
  await client.connect();
  return { client, db: client.db(dbName) };
}

/**
 * Connects to MongoDB and returns the client and database instance.
 * Uses a cached connection if available.
 */
export async function connectToDatabase(): Promise<MongoConnection> {
  if (!globalForMongo.__mongo) {
    globalForMongo.__mongo = connect().catch((error) => {
      globalForMongo.__mongo = undefined;
      console.error('[MongoDB] Connection error:', error);
      throw new Error('Failed to connect to MongoDB');
    });
  }
  return globalForMongo.__mongo;
}

/** The MongoDB database instance — always use this from DAOs. */
export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

/** The MongoClient instance (needed for transactions). */
export async function getClient(): Promise<MongoClient> {
  const { client } = await connectToDatabase();
  return client;
}

/** Closes the cached connection (tests and scripts). */
export async function closeDatabase(): Promise<void> {
  const pending = globalForMongo.__mongo;
  globalForMongo.__mongo = undefined;
  if (pending) {
    const { client } = await pending;
    await client.close();
  }
}
