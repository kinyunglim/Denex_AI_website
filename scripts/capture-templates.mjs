#!/usr/bin/env node
/**
 * Captures full-page screenshots of every client-starter theme for the
 * template gallery (public/templates/<theme>-desktop.jpg / -mobile.jpg).
 *
 * Needs client-starter's preview running first:
 *   cd ../client-starter && corepack yarn dev:preview --port 3100
 * Then:
 *   corepack yarn templates:capture [--base http://localhost:3100] [--locale zh-Hant]
 * Re-run whenever a theme or the demo content changes.
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const base = arg('base', process.env.NEXT_PUBLIC_PREVIEW_BASE_URL || 'http://localhost:3100');
const locale = arg('locale', 'zh-Hant');
const themes = ['corporate', 'warm', 'product', 'bold'];
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, '..', 'public', 'templates');
const channel = process.env.PW_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined);

const views = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel });
try {
  for (const view of views) {
    const context = await browser.newContext({ viewport: view.viewport, deviceScaleFactor: view.deviceScaleFactor, isMobile: view.isMobile, hasTouch: view.hasTouch });
    const page = await context.newPage();
    for (const theme of themes) {
      await page.goto(`${base}/${locale}?theme=${theme}`, { waitUntil: 'networkidle' });
      // Hide preview-only chrome (theme switcher bar, dev indicator, floating buttons).
      await page.addStyleTag({ content: 'nextjs-portal,[data-preview-bar],.no-print{display:none!important}' });
      await page.evaluate(async () => {
        // Scroll through so lazy images load, then wait for every image.
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
      });
      await page.waitForTimeout(500);
      const file = path.join(outDir, `${theme}-${view.name}.jpg`);
      await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 72 });
      console.log(`✓ ${path.relative(process.cwd(), file)}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
