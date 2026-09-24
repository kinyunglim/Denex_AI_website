'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/src/i18n/navigation';

const LABELS: Record<string, string> = { en: 'EN', 'zh-Hant': '繁', 'zh-Hans': '简' };

/**
 * Locale toggle (from OceanLink). Hidden when the site has only one language.
 * Locales come from the server so preview/real sites render identically on both sides.
 */
export function LanguageSwitcher({ locales }: { locales: readonly string[] }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  if (locales.length < 2) return null;

  return (
    <div className="inline-flex items-center rounded-button border border-line bg-surface p-0.5" role="group" aria-label="Language">
      {locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            disabled={isPending}
            aria-current={active ? 'true' : undefined}
            onClick={() => !active && startTransition(() => router.replace(pathname, { locale: loc }))}
            className={`rounded-button px-2.5 py-1 text-xs font-semibold transition-colors ${
              active ? 'bg-primary text-on-primary' : 'text-muted hover:text-ink'
            }`}
          >
            {LABELS[loc] ?? loc}
          </button>
        );
      })}
    </div>
  );
}
