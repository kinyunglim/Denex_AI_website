import type { Theme } from './types';

/** Bold — near-black with electric coral, big type, square edges. */
export const bold: Theme = {
  name: 'bold',
  label: { 'zh-Hant': '大膽潮流', en: 'Bold' },
  colors: {
    bg: '#FFFDF8',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF1E8',
    ink: '#111111',
    muted: '#555555',
    line: '#111111',
    primary: '#FF4F2E',
    primaryHover: '#E23A1B',
    onPrimary: '#111111',
    accent: '#111111',
    heroBg: '#111111',
    onHero: '#FFFDF8',
  },
  fonts: { heading: 'spaceGrotesk', body: 'dmSans' },
  headingWeight: 700,
  headingTracking: '-0.03em',
  radius: { card: '0px', button: '0px', input: '0px' },
  shadow: '6px 6px 0 #111111',
  imageFilter: 'contrast(1.1) grayscale(.2)',
  hero: 'center',
};
