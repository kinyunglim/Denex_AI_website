import { agency } from '@/agency.config';
import { quote } from '../pricing';

describe('fixed package quotes', () => {
  it.each([
    ['starter', 1, 9800, 680, 4900],
    ['business', 2, 13800, 1080, 6900],
    ['pro', 3, 28800, 1880, 14400],
  ] as const)('%s charges exactly the published package and deposit', (key, languages, oneOff, monthly, deposit) => {
    const result = quote(key, [], languages);
    expect(result).toMatchObject({ packageKey: key, oneOff, monthly, deposit, currency: 'HKD' });
    expect(result.lines).toHaveLength(1);
    expect(result.modules).toEqual(agency.packages.find(p => p.key === key)!.modules);
  });

  it('includes operating modules in Business with no extra charges', () => {
    expect(quote('business', [], 2).modules.sort()).toEqual(['booking', 'catalog', 'gcal', 'payments', 'stripe']);
    expect(quote('starter', [], 1).modules).toEqual([]);
  });

  it('rejects legacy add-ons and excess languages rather than silently charging', () => {
    expect(() => quote('business', ['stripe'], 2)).toThrow('Add-ons are no longer available');
    expect(() => quote('starter', [], 2)).toThrow('Language count exceeds');
    expect(() => quote('business', [], 3)).toThrow('Language count exceeds');
    expect(() => quote('pro', [], 0)).toThrow('Language count exceeds');
    expect(() => quote('unknown', [], 1)).toThrow('Unknown package');
  });
});
