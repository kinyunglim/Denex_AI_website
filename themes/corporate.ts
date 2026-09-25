import type { Theme } from './types';

/**
 * Corporate — navy. On the agency site this is the storefront look
 * (layout modelled on webdesigntheme.com, with navy in place of yellow).
 */
export const corporate: Theme = {
  name: 'corporate',
  label: { 'zh-Hant': '企業專業', en: 'Corporate' },
  colors: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5FC',
    ink: '#0F1B2D',
    muted: '#4B5A70',
    line: '#E1E8F2',
    primary: '#082B57',
    primaryHover: '#0E3D78',
    onPrimary: '#FFFFFF',
    accent: '#1F6FEB',
    heroBg: '#F1F5FC',
    onHero: '#0F1B2D',
  },
  fonts: { heading: 'rubik', body: 'rubik' },
  headingWeight: 500,
  headingTracking: '-0.01em',
  radius: { card: '20px', button: '999px', input: '12px' },
  shadow: '0 20px 50px rgba(8,43,87,.10)',
  imageFilter: 'none',
  hero: 'center',
};
