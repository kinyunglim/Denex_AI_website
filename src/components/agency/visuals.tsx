import type { CSSProperties, ReactNode } from 'react';
import type { Theme } from '@/themes';

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

/** Brand mark: a navy disc with an accent orbit (stands in until a real logo exists). */
export function LogoMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="20" className="fill-primary" />
      <ellipse cx="24" cy="24" rx="22" ry="8" transform="rotate(-28 24 24)" fill="none" strokeWidth="3" className="stroke-accent" />
      <path d="M24 13c1 5.6 3.4 8 9 11-5.6 1-8 3.4-9 11-1-7.6-3.4-10-9-11 5.6-3 8-5.4 9-11Z" className="fill-on-primary" />
    </svg>
  );
}

/**
 * A miniature website drawn in a theme's own colours: used inside the hero
 * devices and the template cards so no screenshots are needed.
 * Hex values come from the theme objects (data), not from this component.
 */
export function MiniSite({ theme, variant = 'desktop' }: { theme: Theme; variant?: 'desktop' | 'mobile' }) {
  const c = theme.colors;
  const v = (color: string): CSSProperties => ({ backgroundColor: color });
  const mobile = variant === 'mobile';
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={v(c.bg)} aria-hidden="true">
      <div className="flex items-center justify-between px-[6%] py-[4%]" style={v(c.surface)}>
        <span className="block h-[6px] w-[22%] rounded-full" style={v(c.primary)} />
        {mobile ? (
          <span className="block h-[6px] w-[10%] rounded-full" style={v(c.muted)} />
        ) : (
          <span className="flex w-[42%] justify-end gap-[8%]">
            {[0, 1, 2].map((i) => <span key={i} className="block h-[4px] flex-1 rounded-full" style={v(c.muted)} />)}
            <span className="block h-[8px] flex-1 rounded-full" style={v(c.primary)} />
          </span>
        )}
      </div>
      <div className={`flex ${mobile ? 'flex-col' : 'items-center'} gap-[5%] px-[6%] py-[7%]`} style={v(c.heroBg)}>
        <div className="flex flex-1 flex-col gap-[6px]">
          <span className="block h-[5px] w-[30%] rounded-full" style={v(c.accent)} />
          <span className="block h-[9px] w-[90%] rounded-full" style={v(c.onHero)} />
          <span className="block h-[9px] w-[70%] rounded-full" style={v(c.onHero)} />
          <span className="mt-[4px] block h-[4px] w-[80%] rounded-full opacity-60" style={v(c.onHero)} />
          <span className="mt-[6px] block h-[10px] w-[34%] rounded-full" style={v(c.primary === c.heroBg ? c.accent : c.primary)} />
        </div>
        <div className={`${mobile ? 'h-[70px] w-full' : 'aspect-[4/3] w-[42%]'} rounded-[6px]`} style={v(c.surfaceAlt)}>
          <div className="m-[12%] h-[60%] rounded-full opacity-40" style={v(c.accent)} />
        </div>
      </div>
      <div className={`grid ${mobile ? 'grid-cols-1' : 'grid-cols-3'} gap-[4%] px-[6%] py-[6%]`}>
        {(mobile ? [0, 1] : [0, 1, 2]).map((i) => (
          <div key={i} className="flex flex-col gap-[5px] rounded-[5px] border p-[8%]" style={{ ...v(c.surface), borderColor: c.line }}>
            <span className="block h-[5px] w-[60%] rounded-full" style={v(c.ink)} />
            <span className="block h-[3px] w-[90%] rounded-full opacity-50" style={v(c.muted)} />
            <span className="block h-[3px] w-[70%] rounded-full opacity-50" style={v(c.muted)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Laptop + tablet + phone composition for the hero. */
export function Devices({ theme, alt }: { theme: Theme; alt: string }) {
  return (
    <div role="img" aria-label={alt} className="relative mx-auto aspect-[16/10] w-full max-w-4xl">
      {/* Laptop */}
      <div className="absolute left-[14%] right-[14%] top-0">
        <div className="rounded-t-[14px] border-[10px] border-b-0 border-ink bg-ink">
          <div className="aspect-[16/10] overflow-hidden rounded-[4px]">
            <MiniSite theme={theme} />
          </div>
        </div>
        <div className="relative -mx-[8%] h-[14px] rounded-b-[14px] bg-line shadow-card">
          <div className="mx-auto h-[5px] w-[16%] rounded-b-[6px] bg-muted/40" />
        </div>
      </div>
      {/* Tablet */}
      <div className="absolute bottom-[4%] left-0 w-[30%] -rotate-6 rounded-[16px] border-[7px] border-ink bg-ink shadow-card">
        <div className="aspect-[4/3] overflow-hidden rounded-[6px]">
          <MiniSite theme={theme} />
        </div>
      </div>
      {/* Phone */}
      <div className="absolute bottom-0 right-[2%] w-[15%] rotate-6 rounded-[18px] border-[6px] border-ink bg-ink shadow-card">
        <div className="aspect-[9/19] overflow-hidden rounded-[10px]">
          <MiniSite theme={theme} variant="mobile" />
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
