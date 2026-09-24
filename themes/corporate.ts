import type { Theme } from './types';

/** Corporate — cool navy, restrained; modelled on DenEx. */
export const corporate: Theme = {
  name: 'corporate',
  label: { 'zh-Hant': '企業專業', en: 'Corporate' },
  colors: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#EDF3F9',
    ink: '#14263A',
    muted: '#5A6B82',
    line: '#E2E8F0',
    primary: '#082B57',
    primaryHover: '#0E3D78',
    onPrimary: '#FFFFFF',
    accent: '#0E76C7',
    heroBg: '#082B57',
    onHero: '#FFFFFF',
  },
  fonts: { heading: 'notoSansTc', body: 'notoSansTc' },
  headingWeight: 500,
  headingTracking: '-0.005em',
  radius: { card: '14px', button: '999px', input: '10px' },
  shadow: '0 18px 50px rgba(8,43,87,.10)',
  imageFilter: 'none',
  hero: 'split',
};
