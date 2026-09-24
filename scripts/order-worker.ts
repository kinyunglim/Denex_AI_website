// Production worker: run on the machine that has client-starter checked out.
//   yarn order:worker            # keep polling every 30 s
//   yarn order:worker --once     # build at most one approved order, then exit
// Needs MONGODB_URI/MONGODB_DB of the agency site (e.g. in .env.local) plus:
//   CLIENT_STARTER_DIR  (default ../client-starter)
//   CLIENTS_DIR         (default ../clients)
import os from 'node:os';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { closeDatabase } from '@/src/lib/mongodb';
import { processNext } from '@/src/modules/orders/production';

const root = path.resolve(__dirname, '..');

// Load .env.local without overriding real env vars.
const envFile = path.join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && m[2] !== '' && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
}

const paths = {
  starterDir: path.resolve(root, process.env.CLIENT_STARTER_DIR || '../client-starter'),
  clientsDir: path.resolve(root, process.env.CLIENTS_DIR || '../clients'),
  workDir: path.join(root, '.orders'),
};
const worker = `worker@${os.hostname()}`;
const once = process.argv.includes('--once');

async function main() {
  if (!existsSync(path.join(paths.starterDir, 'scripts', 'new-client.mjs'))) {
    throw new Error(`client-starter not found at ${paths.starterDir} (set CLIENT_STARTER_DIR)`);
  }
  console.log(`[worker] ${worker} · starter ${paths.starterDir} · clients ${paths.clientsDir}`);
  do {
    const did = await processNext(paths, worker);
    if (did) {
      console.log(`[worker] finished one order at ${new Date().toISOString()}`);
      continue;
    }
    if (once) break;
    await new Promise((r) => setTimeout(r, 30_000));
  } while (!once || false);
}

let stopping = false;
process.on('SIGINT', () => {
  if (stopping) process.exit(1);
  stopping = true;
  console.log('[worker] stopping after the current step…');
  closeDatabase().finally(() => process.exit(0));
});

main()
  .catch((error) => {
    console.error('[worker]', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
