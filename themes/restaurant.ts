import type { Theme } from './types';

/** Restaurant — deep red on warm cream; for restaurants, cafes and bakeries. */
export const restaurant: Theme = {
  name: 'restaurant',
  label: { 'zh-Hant': '餐廳美食', en: 'Restaurant' },
  colors: {
    bg: '#FBF6EE',
    surface: '#FFFDF9',
    surfaceAlt: '#F3E7D3',
    ink: '#2A1A14',
    muted: '#6E5A4E',
    line: '#EADCC6',
    primary: '#A3261E',
    primaryHover: '#861E18',
    onPrimary: '#FFFFFF',
    accent: '#E0A23A',
    heroBg: '#2A1A14',
    onHero: '#FBF6EE',
  },
  fonts: { heading: 'notoSerifTc', body: 'notoSansTc' },
  headingWeight: 700,
  headingTracking: '0',
  radius: { card: '10px', button: '6px', input: '6px' },
  shadow: '0 10px 26px rgba(42,26,20,.12)',
  imageFilter: 'saturate(1.1) contrast(1.03)',
  hero: 'split',
};
