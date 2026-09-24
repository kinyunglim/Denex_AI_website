import { defineConfig } from '@playwright/test';

/**
 * Smoke tests (yarn test:e2e). Two servers:
 *  - :3301 preview mode (no database) — every theme's public pages
 *  - :3302 full app on in-memory MongoDB with demo data — booking + admin
 * Uses the machine's Edge/Chrome when available (PW_CHANNEL=msedge|chrome),
 * otherwise Playwright's Chromium (`npx playwright install chromium`).
 */
const channel = process.env.PW_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined);

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 0,
  workers: 1,
  use: { channel, trace: 'retain-on-failure' },
  webServer: [
    { command: 'node scripts/dev-memory.mjs --preview --port 3301 --dist .next-e2e-preview', url: 'http://localhost:3301/zh-Hant', timeout: 180_000, reuseExistingServer: true },
    { command: 'node scripts/dev-memory.mjs --port 3302 --dist .next-e2e-app', url: 'http://localhost:3302/zh-Hant', timeout: 180_000, reuseExistingServer: true },
  ],
});
