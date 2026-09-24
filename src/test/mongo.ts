import { afterAll, beforeAll, beforeEach } from '@jest/globals';
import { randomBytes } from 'node:crypto';
import { closeDatabase, getDb } from '@/src/lib/mongodb';

/**
 * Real MongoDB for integration tests. Jest's globalSetup starts one in-memory
 * replica set (so transactions work); each test file gets its own database
 * and every test starts with empty collections. Call at the top of a file.
 */
export function setupTestDb(): void {
  beforeAll(async () => {
    if (!process.env.MONGODB_URI?.includes('127.0.0.1')) {
      throw new Error('setupTestDb: MONGODB_URI is not the in-memory test server (check jest globalSetup)');
    }
    process.env.MONGODB_DB = `test_${randomBytes(4).toString('hex')}`;
    await getDb();
  });

  beforeEach(async () => {
    const db = await getDb();
    const collections = await db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  });

  afterAll(async () => {
    const db = await getDb();
    await db.dropDatabase();
    await closeDatabase();
  });
}
