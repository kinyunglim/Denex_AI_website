import type { MetadataRoute } from 'next';
import { getConfig } from '@/src/lib/site';

/** One entry per locale for home and each enabled public module page. */
export default function sitemap(): MetadataRoute.Sitemap {
  const cfg = getConfig();
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const paths = ['', ...(cfg.modules.booking ? ['/book'] : []), ...(cfg.modules.catalog ? ['/products'] : [])];
  return cfg.locales.flatMap((l) => paths.map((p) => ({ url: `${base}/${l}${p}`, lastModified: new Date() })));
}
