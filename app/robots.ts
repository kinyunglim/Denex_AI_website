import type { MetadataRoute } from 'next';

/** Preview deployments are never indexed; real sites hide only admin and API. */
export default function robots(): MetadataRoute.Robots {
  if (process.env.PREVIEW_MODE === '1') return { rules: { userAgent: '*', disallow: '/' } };
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
