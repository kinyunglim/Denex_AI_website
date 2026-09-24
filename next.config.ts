import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // This repo is its own workspace root (ignore lockfiles in parent folders).
  outputFileTracingRoot: path.join(__dirname),
  // Separate build folders let several dev servers run side by side (e2e).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Allow the agency site to embed preview deployments in an iframe.
  async headers() {
    if (process.env.PREVIEW_MODE !== '1') return [];
    return [{ source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: 'frame-ancestors *' }] }];
  },
};

export default withNextIntl(nextConfig);
