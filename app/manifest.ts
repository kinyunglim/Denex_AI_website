import type { MetadataRoute } from 'next';
import { themes } from '@/themes';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';

/** PWA manifest generated from client.config.ts (served at /manifest.webmanifest). */
export default function manifest(): MetadataRoute.Manifest {
  const cfg = getConfig();
  const theme = themes[cfg.theme];
  const name = pickLocalized(cfg.business.name, cfg.locales[0]);
  return {
    name,
    short_name: name.slice(0, 12),
    start_url: `/${cfg.locales[0]}`,
    display: 'standalone',
    background_color: theme.colors.bg,
    theme_color: theme.colors.primary,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
