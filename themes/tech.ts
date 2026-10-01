import type { Theme } from './types';

/** Tech — dark slate with electric violet; for IT services, SaaS and start-ups. */
export const tech: Theme = {
  name: 'tech',
  label: { 'zh-Hant': '科技初創', en: 'Tech' },
  colors: {
    bg: '#F7F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#ECEBFA',
    ink: '#12111F',
    muted: '#5A5873',
    line: '#E2E1F0',
    primary: '#5B3FE0',
    primaryHover: '#4A30C4',
    onPrimary: '#FFFFFF',
    accent: '#14C8B4',
    heroBg: '#12111F',
    onHero: '#F7F7FB',
  },
  fonts: { heading: 'spaceGrotesk', body: 'notoSansTc' },
  headingWeight: 700,
  headingTracking: '-0.02em',
  radius: { card: '14px', button: '10px', input: '10px' },
  shadow: '0 14px 40px rgba(91,63,224,.14)',
  imageFilter: 'none',
  hero: 'split',
};
