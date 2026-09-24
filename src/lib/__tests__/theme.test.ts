import { describe, expect, it } from '@jest/globals';
import { themes } from '@/themes';
import { themeToCssVars } from '@/src/lib/theme';
import { THEMES } from '@/src/lib/config';

describe('themes', () => {
  it('defines every theme listed in config', () => {
    for (const name of THEMES) expect(themes[name].name).toBe(name);
  });

  it('produces the same set of CSS variables for every theme', () => {
    const keys = THEMES.map((n) => Object.keys(themeToCssVars(themes[n])).sort().join(','));
    expect(new Set(keys).size).toBe(1);
  });

  it('maps colours and fonts', () => {
    const vars = themeToCssVars(themes.corporate);
    expect(vars['--c-primary']).toBe('#082B57');
    expect(vars['--f-heading']).toContain("'Noto Sans TC'");
  });
});
