// Local dev without installing MongoDB: starts an in-memory replica set,
// seeds the demo data for a theme, then runs `next dev` against it.
//   yarn dev:memory [--theme warm] [--port 3000] [--preview] [--dist .next-other]
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Run from the project root even when launched from elsewhere.
const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);

// Pin the MongoDB binary (shared cache in ~/.cache/mongodb-binaries) before the library loads.
process.env.MONGOMS_VERSION ||= '8.0.12';
const { MongoMemoryReplSet } = await import('mongodb-memory-server');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const theme = flag('theme', 'warm');
const port = flag('port', '3000');
const preview = args.includes('--preview');
const distDir = flag('dist', undefined);

const env = { ...process.env, DEFAULT_ADMIN: 'true', NODE_ENV: 'development', ...(distDir ? { NEXT_DIST_DIR: distDir } : {}) };
let server = null;

if (preview) {
  env.PREVIEW_MODE = '1';
  env.PREVIEW_THEME = theme;
} else {
  server = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  env.MONGODB_URI = server.getUri();
  env.MONGODB_DB = 'dev';
  await new Promise((resolve, reject) => {
    const seed = spawn(process.execPath, ['scripts/seed-demo.mjs', '--theme', theme], { env, stdio: 'inherit' });
    seed.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`seed failed (${code})`))));
  });
  console.log(`\n[dev-memory] In-memory MongoDB ready (${theme} demo data). Admin login: admin / admin`);
  console.log(`[dev-memory] MONGODB_URI=${env.MONGODB_URI} MONGODB_DB=${env.MONGODB_DB}\n`);
}

const nextBin = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const child = spawn(process.execPath, [nextBin, 'dev', '--webpack', '-p', port], { env, stdio: 'inherit', cwd: root });

const stop = async () => {
  child.kill();
  await server?.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', async (code) => {
  await server?.stop();
  process.exit(code ?? 0);
});
