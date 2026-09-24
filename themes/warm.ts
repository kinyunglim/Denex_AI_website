import type { Theme } from './types';

/** Warm — deep green with amber accent, soft corners; modelled on OnMove. */
export const warm: Theme = {
  name: 'warm',
  label: { 'zh-Hant': '溫暖生活', en: 'Warm' },
  colors: {
    bg: '#F7F8F7',
    surface: '#FFFFFF',
    surfaceAlt: '#E7F2EE',
    ink: '#14201B',
    muted: '#5B6B64',
    line: '#E2E8E4',
    primary: '#0F6B52',
    primaryHover: '#0B5641',
    onPrimary: '#FFFFFF',
    accent: '#F4A531',
    heroBg: '#E7F2EE',
    onHero: '#14201B',
  },
  fonts: { heading: 'notoSerifTc', body: 'notoSansTc' },
  headingWeight: 600,
  headingTracking: '0',
  radius: { card: '20px', button: '14px', input: '12px' },
  shadow: '0 10px 30px rgba(20,32,27,.08)',
  imageFilter: 'saturate(1.05) sepia(.08)',
  hero: 'split',
};
