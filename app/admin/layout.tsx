import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { themes } from '@/themes';
import { getConfig } from '@/src/lib/site';
import { pickLocalized } from '@/src/lib/config';
import '../globals.css';

export function generateMetadata(): Metadata {
  const cfg = getConfig();
  return { title: `Admin · ${pickLocalized(cfg.business.name, cfg.locales[0])}`, robots: { index: false, follow: false } };
}

/**
 * Admin root layout (separate from the localised public layout). Neutral
 * palette from `.admin` in globals.css, tinted with the client's primary colour.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const theme = themes[getConfig().theme];
  const style = {
    '--c-primary': theme.colors.primary,
    '--c-primary-hover': theme.colors.primaryHover,
    '--c-accent': theme.colors.accent,
  } as CSSProperties;
  return (
    <html lang="zh-Hant" className="admin" style={style}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
