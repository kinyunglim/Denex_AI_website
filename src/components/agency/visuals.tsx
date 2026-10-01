import type { ReactNode } from 'react';

/** Line icons for the storefront (24px grid, stroke = currentColor). */
const ICONS: Record<string, ReactNode> = {
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  layout: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  plus: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></>,
  tag: <><path d="M3 12V4h8l10 10-8 8L3 12Z" /><circle cx="7.5" cy="8.5" r="1.5" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.7 3.1 2.4 3.5 5.2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M8 14h3" /></>,
  receipt: <><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></>,
  sheet: <><path d="M6 2h9l5 5v15H6V2Z" /><path d="M14 2v6h6M9 13h8M9 17h8M13 11v8" /></>,
  support: <><path d="M4 13a8 8 0 0 1 16 0" /><rect x="2.5" y="13" width="4" height="6" rx="1.5" /><rect x="17.5" y="13" width="4" height="6" rx="1.5" /><path d="M20 19c0 1.5-1.5 2.5-4 2.5h-2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  sparkle: <><path d="M12 3c.7 3.9 2.1 5.3 6 6-3.9.7-5.3 2.1-6 6-.7-3.9-2.1-5.3-6-6 3.9-.7 5.3-2.1 6-6Z" /><path d="M19 15c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z" /></>,
  social: <><path d="M4 5h11v8H8l-4 3V5Z" /><path d="M15 9h5v8l-3-2h-6v-2" /></>,
  megaphone: <><path d="M3 10v4h4l7 4V6L7 10H3Z" /><path d="M17 9a4 4 0 0 1 0 6" /></>,
  chart: <><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  bot: <><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
};

export function Icon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/** Brand logo (client.config.ts business.logo) on a white tile, so it reads on light and navy backgrounds. */
export function LogoMark({ src, className = 'h-10 w-10' }: { src: string; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-input bg-surface ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-contain" />
    </span>
  );
}

/** Path of a template screenshot (captured by scripts/capture-templates.mjs). */
export const shotSrc = (theme: string, view: 'desktop' | 'mobile' = 'desktop') => `/templates/${theme}-${view}.jpg`;

/** A real template screenshot cropped to its top; on hover (group) it scrolls down the page. */
export function Shot({ theme, view = 'desktop', alt, scroll = false }: { theme: string; view?: 'desktop' | 'mobile'; alt: string; scroll?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={shotSrc(theme, view)}
      alt={alt}
      loading="lazy"
      className={`h-full w-full object-cover object-top ${scroll ? 'transition-[object-position] duration-[5000ms] ease-in-out group-hover:object-bottom' : ''}`}
    />
  );
}

/** Laptop + tablet + phone composition for the hero, showing real template screenshots. */
export function Devices({ alt }: { alt: string }) {
  return (
    <div role="img" aria-label={alt} className="relative mx-auto aspect-[16/10] w-full max-w-4xl">
      {/* Laptop */}
      <div className="absolute left-[14%] right-[14%] top-0">
        <div className="rounded-t-[14px] border-[10px] border-b-0 border-ink bg-ink">
          <div className="aspect-[16/10] overflow-hidden rounded-[4px] bg-surface">
            <Shot theme="corporate" alt="" />
          </div>
        </div>
        <div className="relative -mx-[8%] h-[14px] rounded-b-[14px] bg-line shadow-card">
          <div className="mx-auto h-[5px] w-[16%] rounded-b-[6px] bg-muted/40" />
        </div>
      </div>
      {/* Tablet */}
      <div className="absolute bottom-[4%] left-0 w-[30%] -rotate-6 rounded-[16px] border-[7px] border-ink bg-ink shadow-card">
        <div className="aspect-[4/3] overflow-hidden rounded-[6px] bg-surface">
          <Shot theme="warm" alt="" />
        </div>
      </div>
      {/* Phone */}
      <div className="absolute bottom-0 right-[2%] w-[15%] rotate-6 rounded-[18px] border-[6px] border-ink bg-ink shadow-card">
        <div className="aspect-[9/19] overflow-hidden rounded-[10px] bg-surface">
          <Shot theme="product" view="mobile" alt="" />
        </div>
      </div>
    </div>
  );
}

/** Soft background ornaments (circles, ring, dotted squiggle) used behind hero-style bands. */
export function Ornaments() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-10 top-24 h-24 w-24 rounded-full bg-accent sm:h-28 sm:w-28" />
      <div className="absolute -right-24 top-40 hidden h-72 w-72 rounded-full border-[3px] border-accent/40 md:block" />
      <div className="absolute right-[-3rem] top-[16rem] hidden h-40 w-40 rounded-full bg-accent/10 md:block" />
      <svg viewBox="0 0 220 80" className="absolute left-[18%] top-10 hidden w-56 text-primary/30 md:block" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 7" strokeLinecap="round">
        <path d="M2 60c30-50 60-50 80-20s50 30 70-10 50-20 66-10" />
      </svg>
      <svg viewBox="0 0 120 120" className="absolute right-[20%] top-16 hidden w-24 text-primary/30 md:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 100c10-40 40-70 80-80M84 12l16 8-8 16" />
      </svg>
    </div>
  );
}
