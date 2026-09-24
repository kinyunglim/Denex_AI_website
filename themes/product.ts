import type { Theme } from './types';

/** Product — crisp slate and cyan, catalogue-friendly; modelled on OceanLink. */
export const product: Theme = {
  name: 'product',
  label: { 'zh-Hant': '現代產品', en: 'Product' },
  colors: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#ECFEFF',
    ink: '#0F172A',
    muted: '#475569',
    line: '#E2E8F0',
    primary: '#0E7490',
    primaryHover: '#155E75',
    onPrimary: '#FFFFFF',
    accent: '#0EA5E9',
    heroBg: '#083344',
    onHero: '#FFFFFF',
  },
  fonts: { heading: 'inter', body: 'inter' },
  headingWeight: 700,
  headingTracking: '-0.02em',
  radius: { card: '12px', button: '8px', input: '8px' },
  shadow: '0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.06)',
  imageFilter: 'none',
  hero: 'center',
};
