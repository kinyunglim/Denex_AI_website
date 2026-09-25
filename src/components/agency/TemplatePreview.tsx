'use client';

import { useState } from 'react';
import { shotSrc } from './visuals';

/**
 * Full-page template screenshot inside a browser (desktop) or phone frame,
 * with a toggle between the two. The frame scrolls so visitors can read the
 * whole demo page.
 */
export function TemplatePreview({ theme, alt, labels }: { theme: string; alt: string; labels: { desktop: string; mobile: string } }) {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex rounded-button bg-surface-alt p-1" role="group">
          {(['desktop', 'mobile'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`rounded-button px-5 py-2 text-sm transition-colors ${view === v ? 'bg-primary text-on-primary' : 'text-ink hover:text-primary'}`}
            >
              {labels[v]}
            </button>
          ))}
        </div>
      </div>

      {view === 'desktop' ? (
        <div className="mt-8 overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="flex items-center gap-1.5 border-b border-line bg-surface-alt px-4 py-3" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="h-3 w-3 rounded-full bg-line" />
            <span className="ml-4 h-6 flex-1 rounded-button bg-surface" />
          </div>
          <div className="h-[70vh] overflow-y-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shotSrc(theme, 'desktop')} alt={alt} className="block w-full" />
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-8 w-[320px] max-w-full rounded-[40px] border-[10px] border-ink bg-ink shadow-card">
          <div className="h-[600px] overflow-y-auto rounded-[30px] bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shotSrc(theme, 'mobile')} alt={alt} className="block w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
