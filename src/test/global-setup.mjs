// Jest globalSetup: one in-memory MongoDB replica set for the whole run.
// Test files each use their own database on it (see src/test/mongo.ts).
import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async function globalSetup() {
  const server = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  globalThis.__MONGO_SERVER__ = server;
  process.env.MONGODB_URI = server.getUri();
}
