import type { ThemeName } from '@/src/lib/config';
import type { Theme } from './types';
import { corporate } from './corporate';
import { warm } from './warm';
import { product } from './product';
import { bold } from './bold';
import { clinic } from './clinic';
import { beauty } from './beauty';
import { restaurant } from './restaurant';
import { education } from './education';
import { interior } from './interior';
import { tech } from './tech';
import { florist } from './florist';
import { pets } from './pets';

export const themes: Record<ThemeName, Theme> = { corporate, warm, product, bold, clinic, beauty, restaurant, education, interior, tech, florist, pets };
export type { Theme, FontKey } from './types';
