// Jest globalSetup: one in-memory MongoDB replica set for the whole run.
// Test files each use their own database on it (see src/test/mongo.ts).

export default async function globalSetup() {
  // Same pinned binary as scripts/dev-memory.mjs (shared ~/.cache/mongodb-binaries).
  process.env.MONGOMS_VERSION ||= '8.0.12';
  const { MongoMemoryReplSet } = await import('mongodb-memory-server');
  const server = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  globalThis.__MONGO_SERVER__ = server;
  process.env.MONGODB_URI = server.getUri();
}
