import type { Theme } from './types';

/** Florist — sage green with soft pink and serif headings; for florists, organic and wellness shops. */
export const florist: Theme = {
  name: 'florist',
  label: { 'zh-Hant': '花藝自然', en: 'Florist' },
  colors: {
    bg: '#F7F8F4',
    surface: '#FFFFFF',
    surfaceAlt: '#E8EDE2',
    ink: '#1E2A20',
    muted: '#5E6B5F',
    line: '#DEE5D6',
    primary: '#4E6B4A',
    primaryHover: '#3F583C',
    onPrimary: '#FFFFFF',
    accent: '#C9707F',
    heroBg: '#E8EDE2',
    onHero: '#1E2A20',
  },
  fonts: { heading: 'notoSerifTc', body: 'notoSansTc' },
  headingWeight: 600,
  headingTracking: '0',
  radius: { card: '28px', button: '999px', input: '14px' },
  shadow: '0 12px 30px rgba(30,42,32,.08)',
  imageFilter: 'saturate(1.05)',
  hero: 'center',
};
