import { agency } from '@/agency.config';
import english from '@/content/en.json';
import chinese from '@/content/zh-Hant.json';
import simplified from '@/content/zh-Hans.json';
import englishMessages from '@/messages/en.json';
import chineseMessages from '@/messages/zh-Hant.json';
import { copy } from '@/src/components/agency/home-copy';

describe('storefront pricing consistency', () => {
  it.each([english, chinese, simplified])('keeps all locale content aligned with the authoritative packages', content => {
    expect(content.services.items).toHaveLength(3);
    agency.packages.forEach((plan, index) => {
      const item = content.services.items[index];
      expect([plan.name.en, plan.name['zh-Hant']]).toContain(item.title);
      expect(item.price).toContain(`HK$${plan.oneOff.toLocaleString('en-US')}`);
      expect(item.price).toContain(`HK$${plan.monthly.toLocaleString('en-US')}`);
    });
    expect(JSON.stringify(content)).not.toMatch(/add[ -]?ons?|加購|加购/i);
  });

  it('uses matching best-value labels and no obsolete catalogue heading', () => {
    expect(englishMessages.agency.popular).toBe('Best value');
    expect(chineseMessages.agency.popular).toBe('最抵之選');
    expect(englishMessages.agency).not.toHaveProperty('addOnsTitle');
    expect(chineseMessages.agency).not.toHaveProperty('addOnsTitle');
    expect(agency.packages.filter(plan => 'highlight' in plan && plan.highlight).map(plan => plan.key)).toEqual(['business']);
  });

  it('advertises the current entry price in both homepage languages', () => {
    expect(copy.plans.price).toBe('HK$9,800+');
    expect(copy.plans.body.en).toContain('HK$680');
    expect(copy.plans.body['zh-Hant']).toContain('HK$680');
    expect(JSON.stringify(copy)).not.toMatch(/add[ -]?ons?|加購|加购/i);
  });
});
