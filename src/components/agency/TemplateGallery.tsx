'use client';

import { useState } from 'react';
import { Link } from '@/src/i18n/navigation';
import type { Theme } from '@/themes';
import { MiniSite } from './visuals';

export type GalleryItem = { key: string; name: string; fit: string; theme: Theme; previewUrl: string };

/** Filter tabs (with counts) over portrait template cards; hover reveals Preview / Choose. */
export function TemplateGallery({ items, labels }: { items: GalleryItem[]; labels: { all: string; preview: string; choose: string } }) {
  const [filter, setFilter] = useState<string>('all');
  const tabs = [{ key: 'all', name: labels.all, count: items.length }, ...items.map((i) => ({ key: i.key, name: i.name, count: 1 }))];
  const shown = filter === 'all' ? items : items.filter((i) => i.key === filter);

  return (
    <>
      <div className="mt-10 flex flex-wrap justify-center gap-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-button px-5 py-2 text-sm transition-colors ${
              filter === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-alt text-ink hover:bg-line'
            }`}
          >
            {tab.name} <sup className="ml-0.5 opacity-70">{tab.count}</sup>
          </button>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {shown.map((item) => (
          <article key={item.key} className="group">
            <div className="relative aspect-[288/444] overflow-hidden rounded-card border border-line bg-surface shadow-card">
              <div className="h-[140%] transition-transform duration-[2500ms] ease-in-out group-hover:-translate-y-[28%]">
                <MiniSite theme={item.theme} variant="mobile" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary/80 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <a href={item.previewUrl} target="_blank" rel="noopener noreferrer" className="rounded-button bg-surface px-6 py-2.5 text-sm font-medium text-ink hover:bg-surface-alt">
                  {labels.preview} ↗
                </a>
                <Link href={`/order?theme=${item.key}`} className="rounded-button bg-accent px-6 py-2.5 text-sm font-medium text-on-primary hover:opacity-90">
                  {labels.choose}
                </Link>
              </div>
            </div>
            <h3 className="mt-4 text-center text-lg text-ink">{item.name}</h3>
            <p className="mt-1 text-center text-sm text-muted">{item.fit}</p>
          </article>
        ))}
      </div>
    </>
  );
}
