'use client';

import { useState } from 'react';
import { Link } from '@/src/i18n/navigation';
import { Shot } from './visuals';

export type GalleryItem = { key: string; name: string; fit: string; category: string };
export type GalleryCategory = { key: string; name: string };

/**
 * Category filter tabs (with counts) over portrait template cards. Each card
 * shows the real template screenshot, which scrolls down on hover; the overlay
 * links to the in-site preview page and the order form. `limit` caps the
 * "All" tab (the home page shows a selection; /templates shows everything).
 */
export function TemplateGallery({
  items,
  categories,
  labels,
  limit,
}: {
  items: GalleryItem[];
  categories: GalleryCategory[];
  labels: { all: string; preview: string; choose: string };
  limit?: number;
}) {
  const [filter, setFilter] = useState<string>('all');
  const tabs = [
    { key: 'all', name: labels.all, count: items.length },
    ...categories.map((c) => ({ key: c.key, name: c.name, count: items.filter((i) => i.category === c.key).length })),
  ].filter((t) => t.count > 0);
  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);
  const shown = filter === 'all' && limit ? filtered.slice(0, limit) : filtered;

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
              <Shot theme={item.key} alt={item.name} scroll />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-primary/90 to-transparent px-3 pb-4 pt-16 opacity-100 transition-opacity sm:gap-3 lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                <Link href={`/templates/${item.key}`} className="w-full max-w-40 rounded-button bg-surface px-4 py-2 text-center text-sm font-medium text-ink hover:bg-surface-alt">
                  {labels.preview}
                </Link>
                <Link href={`/order?theme=${item.key}`} className="w-full max-w-40 rounded-button bg-accent px-4 py-2 text-center text-sm font-medium text-on-primary hover:opacity-90">
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
