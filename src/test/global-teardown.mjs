// Jest globalTeardown: stop the shared in-memory MongoDB.
export default async function globalTeardown() {
  await globalThis.__MONGO_SERVER__?.stop();
}
