import type { ThemeName } from '@/src/lib/config';
import type { Theme } from './types';
import { corporate } from './corporate';
import { warm } from './warm';
import { product } from './product';
import { bold } from './bold';

export const themes: Record<ThemeName, Theme> = { corporate, warm, product, bold };
export type { Theme, FontKey } from './types';
