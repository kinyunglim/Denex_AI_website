import type { Theme } from './types';

/** Beauty — blush rose and serif headings; for salons, spas and skincare. */
export const beauty: Theme = {
  name: 'beauty',
  label: { 'zh-Hant': '美容優雅', en: 'Beauty' },
  colors: {
    bg: '#FCF8F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F6E9E6',
    ink: '#2B1D1F',
    muted: '#76615F',
    line: '#EEDFDB',
    primary: '#9E4F5C',
    primaryHover: '#84404C',
    onPrimary: '#FFFFFF',
    accent: '#B07F4F',
    heroBg: '#F6E9E6',
    onHero: '#2B1D1F',
  },
  fonts: { heading: 'playfair', body: 'notoSansTc' },
  headingWeight: 500,
  headingTracking: '0',
  radius: { card: '4px', button: '999px', input: '4px' },
  shadow: '0 16px 40px rgba(43,29,31,.08)',
  imageFilter: 'saturate(.95)',
  hero: 'center',
};
