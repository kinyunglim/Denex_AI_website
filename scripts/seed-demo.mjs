// Loads a theme's demo data into MongoDB (services, staff, products, contacts)
// and makes sure an owner admin exists.
//   yarn seed:demo --theme warm [--reset]
// Uses MONGODB_URI / MONGODB_DB from the environment (or .env.local via your shell).
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import { MongoClient } from 'mongodb';

const args = process.argv.slice(2);
const i = args.indexOf('--theme');
const theme = i >= 0 ? args[i + 1] : 'warm';
const reset = args.includes('--reset');
if (!['corporate', 'warm', 'product', 'bold'].includes(theme)) {
  console.error(`Unknown theme "${theme}"`);
  process.exit(1);
}

const demo = JSON.parse(await readFile(new URL(`../demo/${theme}.json`, import.meta.url), 'utf8'));
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/client_starter';
const client = new MongoClient(uri, { runtimeAdapters: { os } });
await client.connect();
const db = client.db(process.env.MONGODB_DB || 'client_starter');
const now = new Date();
const audit = { createdAt: now, updatedAt: now, createdBy: 'seed' };

const collections = ['booking_services', 'booking_staff', 'catalog_products', 'crm_contacts'];
if (reset) for (const c of collections) await db.collection(c).deleteMany({});

const serviceIds = {};
if ((await db.collection('booking_services').countDocuments()) === 0) {
  for (const [order, s] of demo.booking.services.entries()) {
    const r = await db.collection('booking_services').insertOne({ name: s.name, durationMin: s.durationMin, price: s.price, active: true, order, ...audit });
    serviceIds[s.key] = r.insertedId;
  }
  for (const st of demo.booking.staff) {
    await db.collection('booking_staff').insertOne({
      name: st.name,
      serviceIds: st.services.map((k) => serviceIds[k]).filter(Boolean),
      hours: st.hours,
      active: true,
      ...audit,
    });
  }
}

if ((await db.collection('catalog_products').countDocuments()) === 0) {
  for (const [order, p] of demo.products.entries()) {
    await db.collection('catalog_products').insertOne({ ...p, active: true, order, ...audit });
  }
}

if ((await db.collection('crm_contacts').countDocuments()) === 0) {
  for (const c of demo.contacts) {
    await db.collection('crm_contacts').insertOne({
      name: c.name,
      phone: c.phone ?? null,
      email: c.email ?? null,
      whatsapp: null,
      tags: c.tags,
      source: 'import',
      status: c.status,
      locale: null,
      ...audit,
    });
  }
}

await db.collection('crm_contacts').createIndex({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });
await db.collection('crm_contacts').createIndex({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
await db.collection('booking_appointments').createIndex({ staffId: 1, start: 1 });

console.log(`[seed] ${theme} demo data loaded into ${db.databaseName}`);
await client.close();
