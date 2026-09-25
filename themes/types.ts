/**
 * Design tokens for one theme. Components use only the Tailwind classes these
 * feed (bg-bg, text-ink, bg-primary, rounded-card, font-heading, …) — never hex.
 */
export type FontKey = 'notoSansTc' | 'notoSerifTc' | 'inter' | 'playfair' | 'spaceGrotesk' | 'dmSans' | 'rubik';

export type Theme = {
  name: string;
  label: { 'zh-Hant': string; en: string };
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    ink: string;
    muted: string;
    line: string;
    primary: string;
    primaryHover: string;
    onPrimary: string;
    accent: string;
    heroBg: string;
    onHero: string;
  };
  fonts: { heading: FontKey; body: FontKey };
  headingWeight: number;
  headingTracking: string;
  radius: { card: string; button: string; input: string };
  shadow: string;
  /** CSS filter applied to content photos, e.g. "grayscale(1)". */
  imageFilter: string;
  /** Hero layout flavour; structure stays the same, only emphasis changes. */
  hero: 'split' | 'center';
};
