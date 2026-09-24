// Creates a new client repo from this template.
//   node scripts/new-client.mjs --answers answers.json [--dest ../clients/<slug>] [--skip-install] [--skip-verify]
// Steps: copy template → git init + commit → yarn install → yarn client:init
// → yarn verify --skip-build → commit. Prints a JSON summary on the last line
// (used by the agency order pipeline).
import { cp, mkdir, readFile, rm, writeFile, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const template = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const answersPath = flag('answers');
if (!answersPath) {
  console.error('Usage: node scripts/new-client.mjs --answers answers.json [--dest dir] [--skip-install] [--skip-verify]');
  process.exit(1);
}
const answers = JSON.parse(await readFile(path.resolve(answersPath), 'utf8'));
if (typeof answers.slug !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(answers.slug)) {
  console.error('answers.slug must be lowercase letters, numbers and dashes');
  process.exit(1);
}
const dest = path.resolve(flag('dest') ?? path.join(template, '..', 'clients', answers.slug));

const exists = async (p) => access(p).then(() => true, () => false);
if (await exists(dest)) {
  console.error(`Destination already exists: ${dest}`);
  process.exit(1);
}

const SKIP = new Set(['node_modules', '.git', '.next', 'test-results', 'playwright-report', '.env.local', '.owner.json', '.yarn']);
const run = (label, cmd, cmdArgs, opts = {}) => {
  console.log(`\n▶ ${label}`);
  // Only corepack needs a shell on Windows (it is a .cmd shim); git must not get one or messages split on spaces.
  const r = spawnSync(cmd, cmdArgs, { cwd: dest, stdio: 'inherit', shell: process.platform === 'win32' && cmd === 'corepack', ...opts });
  if (r.status !== 0) {
    console.error(`✗ ${label} failed (exit ${r.status})`);
    console.log(JSON.stringify({ ok: false, step: label, dest }));
    process.exit(r.status ?? 1);
  }
};

// 1. Copy the template
await mkdir(path.dirname(dest), { recursive: true });
await cp(template, dest, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(template, src);
    const top = rel.split(path.sep)[0];
    if (SKIP.has(top) || top.startsWith('.next-')) return false;
    if (rel.startsWith(path.join('docs', 'superpowers'))) return false;
    if (rel.startsWith(path.join('scripts', 'demo-src'))) return false;
    return true;
  },
});
await writeFile(path.join(dest, 'answers.json'), JSON.stringify(answers, null, 2) + '\n');
console.log(`✓ copied template to ${dest}`);

const templateSha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: template, encoding: 'utf8' }).stdout.trim() || 'unknown';

// 2. Git
run('git init', 'git', ['init', '-q', '-b', 'main']);
run('git add', 'git', ['add', '-A']);
run('git commit (template)', 'git', ['commit', '-q', '-m', `chore: scaffold from client-starter@${templateSha}`]);

// 3. Install + configure
if (!args.includes('--skip-install')) run('yarn install', 'corepack', ['yarn', 'install']);
run('client:init', 'corepack', ['yarn', 'client:init', '--answers', 'answers.json']);

// 4. Verify (build is left to Vercel / the delivery step)
if (!args.includes('--skip-verify') && !args.includes('--skip-install')) run('verify', 'corepack', ['yarn', 'verify', '--skip-build', '--template']);

// 5. Commit the configuration
run('git add', 'git', ['add', '-A']);
run('git commit (config)', 'git', ['commit', '-q', '-m', `feat: configure ${answers.slug} (theme ${answers.theme})`]);

await rm(path.join(dest, '.owner.json'), { force: true });
console.log(`\n✓ ${answers.slug} ready at ${dest}`);
console.log('Next: fill .env.local, replace demo copy in content/*.json, then see docs/SETUP.md');
console.log(JSON.stringify({ ok: true, slug: answers.slug, dest, templateSha }));
