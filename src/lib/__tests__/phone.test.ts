import { describe, expect, it } from '@jest/globals';
import { normalizeEmail, normalizePhone } from '@/src/lib/phone';

describe('normalizePhone', () => {
  it('adds +852 to bare 8-digit HK numbers', () => {
    expect(normalizePhone('9123 4567')).toBe('+85291234567');
  });
  it('keeps explicit country codes', () => {
    expect(normalizePhone('+86 138-0013-8000')).toBe('+8613800138000');
  });
  it('treats 00 prefix as international', () => {
    expect(normalizePhone('0085291234567')).toBe('+85291234567');
  });
  it('handles 852 without plus', () => {
    expect(normalizePhone('85291234567')).toBe('+85291234567');
  });
  it('returns null for empty input', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
    expect(normalizePhone('---')).toBeNull();
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Foo@Example.COM ')).toBe('foo@example.com');
  });
  it('returns null for blank', () => {
    expect(normalizeEmail('  ')).toBeNull();
  });
});
