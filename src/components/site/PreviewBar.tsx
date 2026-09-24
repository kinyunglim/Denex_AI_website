'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const THEMES: { key: string; label: string }[] = [
  { key: 'corporate', label: 'Corporate 企業' },
  { key: 'warm', label: 'Warm 溫暖' },
  { key: 'product', label: 'Product 產品' },
  { key: 'bold', label: 'Bold 大膽' },
];

function Bar({ current }: { current: string }) {
  const t = useTranslations('preview');
  const params = useSearchParams();
  const orderUrl = params.get('order') ?? process.env.NEXT_PUBLIC_AGENCY_ORDER_URL;

  return (
    <div className="no-print sticky top-0 z-40 flex flex-wrap items-center justify-center gap-3 bg-ink px-4 py-2 text-xs text-bg">
      <span>{t('banner')}</span>
      <label className="flex items-center gap-2">
        {t('theme')}
        <select
          value={current}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set('theme', e.target.value);
            window.location.href = url.toString();
          }}
          className="rounded bg-bg px-2 py-1 text-ink"
        >
          {THEMES.map((th) => (
            <option key={th.key} value={th.key}>
              {th.label}
            </option>
          ))}
        </select>
      </label>
      {orderUrl && (
        <a href={`${orderUrl}${orderUrl.includes('?') ? '&' : '?'}theme=${current}`} target="_top" className="rounded bg-primary px-3 py-1 font-semibold text-on-primary">
          {t('getThis')}
        </a>
      )}
    </div>
  );
}

/** Shown only on preview deployments: demo notice + live theme switcher. */
export function PreviewBar({ current }: { current: string }) {
  return (
    <Suspense fallback={null}>
      <Bar current={current} />
    </Suspense>
  );
}
