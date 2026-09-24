// Full pre-delivery check: lint → typecheck → unit/integration tests →
// client:check → production build. Stops at the first failure.
//   yarn verify [--skip-build] [--template]
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const skipBuild = process.argv.includes('--skip-build');
// --template: verifying client-starter itself (no client env to check).
const template = process.argv.includes('--template');

const steps = [
  ['lint', ['eslint', '.']],
  ['typecheck', ['tsc', '--noEmit']],
  ['tests', ['jest']],
  ['client:check', ['tsx', 'scripts/client-check.ts', ...(template ? ['--config-only'] : [])]],
  ...(skipBuild ? [] : [['build', ['next', 'build']]]),
];

for (const [label, args] of steps) {
  console.log(`\n▶ ${label}`);
  const started = Date.now();
  const r = spawnSync('corepack', ['yarn', ...args], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed`);
    process.exit(r.status ?? 1);
  }
  console.log(`✓ ${label} (${Math.round((Date.now() - started) / 1000)}s)`);
}
console.log('\n✓ verify passed');
