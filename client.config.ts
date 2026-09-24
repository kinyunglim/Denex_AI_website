import { defineClientConfig } from './src/lib/config';

/**
 * The ONE file to edit per client (or generate with `yarn client:init`).
 * Validated at startup by `src/lib/config.ts`; `yarn client:check` checks it too.
 */
export default defineClientConfig({
  business: {
    name: { 'zh-Hant': '示範工作室', 'zh-Hans': '示范工作室', en: 'Demo Studio' },
    phone: '+852 2345 6789',
    whatsapp: '+852 9123 4567',
    email: 'hello@example.com',
    address: { 'zh-Hant': '香港灣仔示範街 1 號', en: '1 Demo Street, Wan Chai, Hong Kong' },
    logo: '/logo.svg',
  },
  locales: ['zh-Hant', 'en', 'zh-Hans'],
  theme: 'warm',
  modules: { booking: true, payments: true, stripe: false, gcal: false, catalog: false, mobile: false },
  sections: ['hero', 'services', 'cases', 'about', 'contact'],
  notify: { email: ['owner@example.com'] },
  timezone: 'Asia/Hong_Kong',
  currency: 'HKD',
});
