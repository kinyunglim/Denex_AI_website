import type { Theme } from './types';

/** Education — friendly blue with sunny yellow, rounded; for tutoring centres and schools. */
export const education: Theme = {
  name: 'education',
  label: { 'zh-Hant': '教育補習', en: 'Education' },
  colors: {
    bg: '#F7F9FD',
    surface: '#FFFFFF',
    surfaceAlt: '#E7EEFB',
    ink: '#14213D',
    muted: '#56607A',
    line: '#DFE5F2',
    primary: '#2453C7',
    primaryHover: '#1C43A6',
    onPrimary: '#FFFFFF',
    accent: '#E0A100',
    heroBg: '#E7EEFB',
    onHero: '#14213D',
  },
  fonts: { heading: 'dmSans', body: 'notoSansTc' },
  headingWeight: 700,
  headingTracking: '-0.01em',
  radius: { card: '24px', button: '16px', input: '14px' },
  shadow: '0 12px 30px rgba(36,83,199,.10)',
  imageFilter: 'none',
  hero: 'split',
};
