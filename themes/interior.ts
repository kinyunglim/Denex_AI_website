import type { Theme } from './types';

/** Interior — charcoal and sand gold with editorial serif; for interior design, property and architecture. */
export const interior: Theme = {
  name: 'interior',
  label: { 'zh-Hant': '室內設計', en: 'Interior' },
  colors: {
    bg: '#F5F3EF',
    surface: '#FFFFFF',
    surfaceAlt: '#EAE5DC',
    ink: '#1C1B19',
    muted: '#6B655C',
    line: '#DED8CD',
    primary: '#1C1B19',
    primaryHover: '#3A3833',
    onPrimary: '#F5F3EF',
    accent: '#B08D57',
    heroBg: '#1C1B19',
    onHero: '#F5F3EF',
  },
  fonts: { heading: 'playfair', body: 'notoSerifTc' },
  headingWeight: 500,
  headingTracking: '0.01em',
  radius: { card: '0px', button: '0px', input: '0px' },
  shadow: '0 20px 50px rgba(28,27,25,.10)',
  imageFilter: 'grayscale(.15)',
  hero: 'center',
};
