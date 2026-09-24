// Pre-flight check before deploying a client site:
//   yarn client:check [--env-file .env.local] [--strict] [--config-only]
// Validates client.config.ts and content/*.json, and lists missing env vars
// for the enabled modules. --strict turns warnings into a failing exit code.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import clientConfig from '@/client.config';
import { parseClientConfig } from '@/src/lib/config';
import { SiteContentSchema } from '@/src/lib/content';
import { MODULE_ENV } from '@/src/lib/answers';

const root = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');
const configOnly = process.argv.includes('--config-only');
const envIdx = process.argv.indexOf('--env-file');
const envFile = path.join(root, envIdx >= 0 ? process.argv[envIdx + 1] : '.env.local');

const errors: string[] = [];
const warnings: string[] = [];

// 1. Config
let cfg: ReturnType<typeof parseClientConfig> | null = null;
try {
  cfg = parseClientConfig(clientConfig);
  console.log(`✓ client.config.ts (theme ${cfg.theme}, locales ${cfg.locales.join('/')})`);
} catch (error) {
  errors.push(error instanceof Error ? error.message : String(error));
}

// 2. Content for every enabled locale
if (cfg) {
  for (const locale of cfg.locales) {
    const file = path.join(root, 'content', `${locale}.json`);
    if (!existsSync(file)) {
      errors.push(`content/${locale}.json is missing`);
      continue;
    }
    const result = SiteContentSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
    if (!result.success) errors.push(`content/${locale}.json: ${result.error.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; ')}`);
    else console.log(`✓ content/${locale}.json`);
  }
  if (cfg.business.email.endsWith('example.com')) warnings.push('business.email is still a placeholder');
  if (!cfg.notify.email.length) warnings.push('notify.email is empty — nobody will be told about new enquiries');
}

// 3. Environment
const env: Record<string, string> = { ...(process.env as Record<string, string>) };
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && m[2] !== '' && env[m[1]] === undefined) env[m[1]] = m[2];
  }
}
if (cfg && !configOnly) {
  const groups = ['core', 'email', ...(cfg.modules.stripe ? ['stripe'] : []), ...(cfg.modules.gcal ? ['gcal'] : [])];
  for (const g of groups) {
    const missing = MODULE_ENV[g].filter((k) => !env[k]);
    if (!missing.length) console.log(`✓ env: ${g}`);
    else (g === 'core' ? errors : warnings).push(`env ${g}: missing ${missing.join(', ')}`);
  }
  if (env.DEFAULT_ADMIN === 'true') warnings.push('DEFAULT_ADMIN=true (ignored in production, but remove it before handover)');
}

for (const w of warnings) console.log(`! ${w}`);
for (const e of errors) console.error(`✗ ${e}`);
const failed = errors.length > 0 || (strict && warnings.length > 0);
console.log(failed ? '\nclient:check FAILED' : '\nclient:check passed');
process.exit(failed ? 1 : 0);
