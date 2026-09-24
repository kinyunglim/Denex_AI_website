'use client';

import { useEffect } from 'react';

/**
 * Adds the Google Fonts stylesheet after first paint so an unreachable font
 * host (e.g. from mainland China) never blocks rendering; system fonts show
 * until the web fonts arrive.
 */
export function FontLoader({ href }: { href: string }) {
  useEffect(() => {
    if (document.querySelector(`link[data-fonts="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.fonts = href;
    document.head.appendChild(link);
  }, [href]);
  return null;
}
