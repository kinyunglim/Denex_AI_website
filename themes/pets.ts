import type { Theme } from './types';

/** Pets — cheerful orange with chunky rounded shapes; for pet grooming, vets and pet shops. */
export const pets: Theme = {
  name: 'pets',
  label: { 'zh-Hant': '寵物生活', en: 'Pets' },
  colors: {
    bg: '#FFF9F3',
    surface: '#FFFFFF',
    surfaceAlt: '#FFEBD6',
    ink: '#2B1E12',
    muted: '#6E5C4A',
    line: '#F2E1CE',
    primary: '#C24E00',
    primaryHover: '#A34100',
    onPrimary: '#FFFFFF',
    accent: '#2E86AB',
    heroBg: '#FFEBD6',
    onHero: '#2B1E12',
  },
  fonts: { heading: 'dmSans', body: 'notoSansTc' },
  headingWeight: 700,
  headingTracking: '-0.01em',
  radius: { card: '26px', button: '999px', input: '16px' },
  shadow: '0 12px 28px rgba(194,78,0,.12)',
  imageFilter: 'saturate(1.08)',
  hero: 'split',
};
