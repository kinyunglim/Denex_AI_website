import { describe, expect, it } from '@jest/globals';
import { parseClientConfig, pickLocalized, ClientConfigInput } from '@/src/lib/config';

const base = (): ClientConfigInput => ({
  business: { name: { 'zh-Hant': '測試', en: 'Test' } },
  locales: ['zh-Hant', 'en'],
  theme: 'warm',
  modules: {},
  sections: ['hero', 'contact'],
  notify: { email: [] },
});

describe('parseClientConfig', () => {
  it('accepts a minimal config and fills defaults', () => {
    const cfg = parseClientConfig(base());
    expect(cfg.modules).toEqual({
      booking: false, payments: false, stripe: false, gcal: false, catalog: false, mobile: false,
    });
    expect(cfg.timezone).toBe('Asia/Hong_Kong');
    expect(cfg.business.logo).toBe('/logo.svg');
  });

  it('rejects stripe without payments', () => {
    const input = base();
    input.modules = { stripe: true };
    expect(() => parseClientConfig(input)).toThrow('Module "stripe" requires module "payments"');
  });

  it('rejects gcal without booking', () => {
    const input = base();
    input.modules = { gcal: true };
    expect(() => parseClientConfig(input)).toThrow('Module "gcal" requires module "booking"');
  });

  it('accepts dependent modules when their dependency is on', () => {
    const input = base();
    input.modules = { payments: true, stripe: true, booking: true, gcal: true };
    expect(parseClientConfig(input).modules.stripe).toBe(true);
  });

  it('rejects an unknown theme', () => {
    const input = { ...base(), theme: 'neon' };
    expect(() => parseClientConfig(input)).toThrow('theme');
  });

  it('requires at least one locale', () => {
    expect(() => parseClientConfig({ ...base(), locales: [] })).toThrow('At least one locale');
  });

  it('rejects duplicate locales', () => {
    expect(() => parseClientConfig({ ...base(), locales: ['en', 'en'] })).toThrow('Duplicate locale');
  });

  it('requires the business name in the default locale', () => {
    const input = base();
    input.locales = ['zh-Hans'];
    expect(() => parseClientConfig(input)).toThrow('default locale (zh-Hans)');
  });
});

describe('pickLocalized', () => {
  it('returns the requested locale', () => {
    expect(pickLocalized({ en: 'A', 'zh-Hant': '甲' }, 'en')).toBe('A');
  });
  it('falls back to zh-Hant then en', () => {
    expect(pickLocalized({ 'zh-Hant': '甲' }, 'zh-Hans')).toBe('甲');
    expect(pickLocalized({ en: 'A' }, 'zh-Hans')).toBe('A');
  });
  it('returns empty string for undefined', () => {
    expect(pickLocalized(undefined, 'en')).toBe('');
  });
});
