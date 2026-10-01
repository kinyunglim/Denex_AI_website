import type { Theme } from './types';

/** Clinic — clean teal and white, calm and clinical; for dental and medical practices. */
export const clinic: Theme = {
  name: 'clinic',
  label: { 'zh-Hant': '醫療診所', en: 'Clinic' },
  colors: {
    bg: '#F6FAFA',
    surface: '#FFFFFF',
    surfaceAlt: '#E3F2F1',
    ink: '#10282A',
    muted: '#4F6668',
    line: '#DCE9E8',
    primary: '#0F7C7A',
    primaryHover: '#0B6361',
    onPrimary: '#FFFFFF',
    accent: '#2C8FC4',
    heroBg: '#E3F2F1',
    onHero: '#10282A',
  },
  fonts: { heading: 'inter', body: 'notoSansTc' },
  headingWeight: 600,
  headingTracking: '-0.01em',
  radius: { card: '16px', button: '999px', input: '10px' },
  shadow: '0 12px 32px rgba(15,124,122,.10)',
  imageFilter: 'none',
  hero: 'split',
};
