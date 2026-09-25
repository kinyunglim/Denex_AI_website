import type { FontKey, Theme } from '@/themes';

/**
 * Converts theme tokens into CSS custom properties.
 * Approach: the root layout puts these on <html style>; globals.css maps them
 * into Tailwind 4 via `@theme inline`, so switching theme needs no rebuild.
 * Fonts load at runtime from Google Fonts (see googleFontsHref) and fall back
 * to Noto Sans TC / system fonts, so builds never depend on font downloads.
 */
export const FONT_FAMILIES: Record<FontKey, { family: string; query: string }> = {
  notoSansTc: { family: 'Noto Sans TC', query: 'Noto+Sans+TC:wght@400;500;700' },
  notoSerifTc: { family: 'Noto Serif TC', query: 'Noto+Serif+TC:wght@500;600;700' },
  inter: { family: 'Inter', query: 'Inter:wght@400;500;600;700' },
  playfair: { family: 'Playfair Display', query: 'Playfair+Display:wght@500;700' },
  spaceGrotesk: { family: 'Space Grotesk', query: 'Space+Grotesk:wght@500;700' },
  dmSans: { family: 'DM Sans', query: 'DM+Sans:wght@400;500;700' },
  rubik: { family: 'Rubik', query: 'Rubik:wght@400;500;700' },
};

const fontStack = (key: FontKey) =>
  `'${FONT_FAMILIES[key].family}', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif`;

/** Stylesheet URL for exactly the fonts a theme uses (plus Noto Sans TC for Chinese). */
export function googleFontsHref(theme: Theme): string {
  const keys = new Set<FontKey>([theme.fonts.heading, theme.fonts.body, 'notoSansTc']);
  const families = [...keys].map((k) => `family=${FONT_FAMILIES[k].query}`).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function themeToCssVars(theme: Theme): Record<string, string> {
  const c = theme.colors;
  return {
    '--c-bg': c.bg,
    '--c-surface': c.surface,
    '--c-surface-alt': c.surfaceAlt,
    '--c-ink': c.ink,
    '--c-muted': c.muted,
    '--c-line': c.line,
    '--c-primary': c.primary,
    '--c-primary-hover': c.primaryHover,
    '--c-on-primary': c.onPrimary,
    '--c-accent': c.accent,
    '--c-hero-bg': c.heroBg,
    '--c-on-hero': c.onHero,
    '--f-heading': fontStack(theme.fonts.heading),
    '--f-body': fontStack(theme.fonts.body),
    '--heading-weight': String(theme.headingWeight),
    '--heading-tracking': theme.headingTracking,
    '--r-card': theme.radius.card,
    '--r-button': theme.radius.button,
    '--r-input': theme.radius.input,
    '--shadow-card': theme.shadow,
    '--image-filter': theme.imageFilter,
  };
}
