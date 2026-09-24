import { describe, expect, it } from '@jest/globals';
import { AnswersSchema, renderClientConfig } from '@/src/lib/answers';
import { parseClientConfig } from '@/src/lib/config';

const extract = (source: string) =>
  JSON.parse(source.slice(source.indexOf('defineClientConfig(') + 'defineClientConfig('.length, source.lastIndexOf(');')));

describe('AnswersSchema + renderClientConfig', () => {
  it('fills defaults and renders a valid config', () => {
    const a = AnswersSchema.parse({ slug: 'harmony-move', business: { name: { 'zh-Hant': '和動' } }, theme: 'warm', modules: ['booking'] });
    expect(a.locales).toEqual(['zh-Hant', 'en']);
    const cfg = parseClientConfig(extract(renderClientConfig(a)));
    expect(cfg.modules.booking).toBe(true);
    expect(cfg.modules.stripe).toBe(false);
    expect(cfg.theme).toBe('warm');
  });

  it('rejects a bad slug', () => {
    expect(AnswersSchema.safeParse({ slug: 'Harmony Move', business: { name: { en: 'x' } }, theme: 'warm' }).success).toBe(false);
  });

  it('produces a config that fails validation when module dependencies are missing', () => {
    const a = AnswersSchema.parse({ slug: 'x', business: { name: { 'zh-Hant': 'X' } }, theme: 'bold', modules: ['stripe'] });
    expect(() => parseClientConfig(extract(renderClientConfig(a)))).toThrow('requires module "payments"');
  });
});
