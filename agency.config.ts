/**
 * What the agency sells. Edit prices and wording here; the pricing page,
 * order form, price calculation and admin all read from this file.
 * Prices are HKD suggestions for the Hong Kong SME market.
 */
export type ModuleKey = 'booking' | 'payments' | 'stripe' | 'gcal' | 'catalog' | 'mobile';
export type Text = { 'zh-Hant': string; en: string };

export type Package = {
  key: string;
  name: Text;
  tagline: Text;
  oneOff: number;
  monthly: number;
  modules: ModuleKey[];
  includes: Text[];
  deliveryDays: number;
  highlight?: boolean;
};

export type AddOn = {
  key: string;
  name: Text;
  description: Text;
  oneOff: number;
  monthly: number;
  /** Module switched on in the client's site, if any. */
  module?: ModuleKey;
  /** Hidden when the package already includes this module. */
  group: 'feature' | 'content' | 'brand' | 'growth' | 'care';
  /** Priced per extra language, page, etc. */
  perUnit?: Text;
};

export const agency = {
  currency: 'HKD',
  /** Share of the one-off price taken as a deposit when ordering (0–1). */
  depositRate: 0.5,
  /** Where client-starter's preview deployment lives (PREVIEW_MODE=1). */
  previewBaseUrl: process.env.NEXT_PUBLIC_PREVIEW_BASE_URL || 'http://localhost:3100',
  themes: [
    { key: 'corporate', name: { 'zh-Hant': '企業專業', en: 'Corporate' }, fit: { 'zh-Hant': '顧問、律師、會計、金融', en: 'Consulting, legal, finance' } },
    { key: 'warm', name: { 'zh-Hant': '溫暖生活', en: 'Warm' }, fit: { 'zh-Hant': '診所、健身、美容、教育', en: 'Clinics, fitness, beauty, education' } },
    { key: 'product', name: { 'zh-Hant': '現代產品', en: 'Product' }, fit: { 'zh-Hant': '貿易、B2B、產品品牌', en: 'Trading, B2B, product brands' } },
    { key: 'bold', name: { 'zh-Hant': '大膽潮流', en: 'Bold' }, fit: { 'zh-Hant': '餐飲、理髮、潮流、創意', en: 'F&B, barbers, lifestyle, creative' } },
  ],
  packages: [
    {
      key: 'starter',
      name: { 'zh-Hant': '起步網站', en: 'Starter' },
      tagline: { 'zh-Hant': '專業網站 + 客戶名單', en: 'A professional site with a simple CRM' },
      oneOff: 8800,
      monthly: 380,
      modules: [],
      deliveryDays: 7,
      includes: [
        { 'zh-Hant': '5 個主頁區塊（服務、案例、關於、聯絡）', en: '5 home sections (services, work, about, contact)' },
        { 'zh-Hant': '2 種語言', en: '2 languages' },
        { 'zh-Hant': '聯絡表單 + WhatsApp 按鈕', en: 'Contact form + WhatsApp button' },
        { 'zh-Hant': '客戶管理、Excel 匯入匯出', en: 'Contacts CRM, Excel import/export' },
        { 'zh-Hant': '寄存、SSL、每日備份', en: 'Hosting, SSL, daily backups' },
      ],
    },
    {
      key: 'business',
      name: { 'zh-Hant': '生意網站', en: 'Business' },
      tagline: { 'zh-Hant': '網上預約 + 收款收據', en: 'Online booking, payments and receipts' },
      oneOff: 16800,
      monthly: 680,
      modules: ['booking', 'payments'],
      deliveryDays: 14,
      highlight: true,
      includes: [
        { 'zh-Hant': '起步網站全部功能', en: 'Everything in Starter' },
        { 'zh-Hant': '網上預約（服務、員工、休假）', en: 'Online booking (services, staff, time off)' },
        { 'zh-Hant': '收款記錄 + 中英收據', en: 'Payment records + bilingual receipts' },
        { 'zh-Hant': '預約確認電郵', en: 'Booking confirmation emails' },
        { 'zh-Hant': '員工帳號及權限', en: 'Staff accounts and roles' },
      ],
    },
    {
      key: 'pro',
      name: { 'zh-Hant': '專業全套', en: 'Pro' },
      tagline: { 'zh-Hant': '網上付款 + 產品目錄 + 日曆同步', en: 'Online payments, catalogue and calendar sync' },
      oneOff: 28800,
      monthly: 1280,
      modules: ['booking', 'payments', 'stripe', 'catalog', 'gcal'],
      deliveryDays: 21,
      includes: [
        { 'zh-Hant': '生意網站全部功能', en: 'Everything in Business' },
        { 'zh-Hant': 'Stripe 網上付款連結', en: 'Stripe payment links' },
        { 'zh-Hant': '產品目錄 + 查詢報價', en: 'Product catalogue + quote requests' },
        { 'zh-Hant': 'Google Calendar 同步', en: 'Google Calendar sync' },
        { 'zh-Hant': '3 種語言', en: '3 languages' },
      ],
    },
  ] satisfies Package[],
  addOns: [
    { key: 'booking', group: 'feature', module: 'booking', oneOff: 5000, monthly: 200, name: { 'zh-Hant': '網上預約', en: 'Online booking' }, description: { 'zh-Hant': '客人自己揀服務同時間', en: 'Customers pick a service and time themselves' } },
    { key: 'payments', group: 'feature', module: 'payments', oneOff: 3000, monthly: 100, name: { 'zh-Hant': '收款及收據', en: 'Payments & receipts' }, description: { 'zh-Hant': '記錄收款，列印中英收據', en: 'Record payments, print bilingual receipts' } },
    { key: 'stripe', group: 'feature', module: 'stripe', oneOff: 3000, monthly: 100, name: { 'zh-Hant': 'Stripe 網上付款', en: 'Stripe online payments' }, description: { 'zh-Hant': '發付款連結，信用卡 / Apple Pay 自動入賬', en: 'Send payment links; card / Apple Pay recorded automatically' } },
    { key: 'gcal', group: 'feature', module: 'gcal', oneOff: 1500, monthly: 0, name: { 'zh-Hant': 'Google Calendar 同步', en: 'Google Calendar sync' }, description: { 'zh-Hant': '預約自動出現喺你嘅日曆', en: 'Bookings appear in your calendar' } },
    { key: 'catalog', group: 'feature', module: 'catalog', oneOff: 4000, monthly: 100, name: { 'zh-Hant': '產品目錄', en: 'Product catalogue' }, description: { 'zh-Hant': '產品、規格、查詢報價', en: 'Products, specs, quote requests' } },
    { key: 'mobile', group: 'feature', module: 'mobile', oneOff: 38000, monthly: 800, name: { 'zh-Hant': '手機 App（iOS + Android）', en: 'Mobile app (iOS + Android)' }, description: { 'zh-Hant': '同網站共用資料，包上架', en: 'Shares data with the site; store submission included' } },
    { key: 'language', group: 'content', oneOff: 1500, monthly: 0, perUnit: { 'zh-Hant': '每種語言', en: 'per language' }, name: { 'zh-Hant': '額外語言', en: 'Extra language' }, description: { 'zh-Hant': '翻譯及上載全站內容', en: 'Translate and load all site copy' } },
    { key: 'copywriting', group: 'content', oneOff: 2500, monthly: 0, name: { 'zh-Hant': '文案撰寫', en: 'Copywriting' }, description: { 'zh-Hant': '全站文案，以你嘅語氣撰寫', en: 'All site copy, written in your voice' } },
    { key: 'photography', group: 'content', oneOff: 4500, monthly: 0, name: { 'zh-Hant': '半日攝影', en: 'Half-day photo shoot' }, description: { 'zh-Hant': '店舖、團隊、產品相', en: 'Premises, team and product photos' } },
    { key: 'migration', group: 'content', oneOff: 2000, monthly: 0, name: { 'zh-Hant': 'Excel 資料搬遷', en: 'Excel data migration' }, description: { 'zh-Hant': '整理並匯入你現有嘅客戶名單', en: 'Clean and import your existing client list' } },
    { key: 'logo', group: 'brand', oneOff: 6000, monthly: 0, name: { 'zh-Hant': 'Logo 及品牌套件', en: 'Logo & brand kit' }, description: { 'zh-Hant': 'Logo、顏色、字體、名片檔', en: 'Logo, colours, fonts, name-card files' } },
    { key: 'domain-email', group: 'brand', oneOff: 1200, monthly: 0, name: { 'zh-Hant': '網域 + 公司電郵設定', en: 'Domain + business email setup' }, description: { 'zh-Hant': '登記網域，設定 Google Workspace / Microsoft 365', en: 'Register the domain, set up Google Workspace / Microsoft 365' } },
    { key: 'seo', group: 'growth', oneOff: 2500, monthly: 0, name: { 'zh-Hant': 'SEO + Google 商家檔案', en: 'SEO + Google Business Profile' }, description: { 'zh-Hant': '關鍵字、Search Console、地圖商家', en: 'Keywords, Search Console, Maps listing' } },
    { key: 'ads', group: 'growth', oneOff: 0, monthly: 2800, name: { 'zh-Hant': '廣告代操（Google / Meta）', en: 'Ads management (Google / Meta)' }, description: { 'zh-Hant': '每月優化及報告（廣告費另計）', en: 'Monthly optimisation + report (ad spend extra)' } },
    { key: 'social', group: 'growth', oneOff: 0, monthly: 3800, name: { 'zh-Hant': 'IG / Facebook 內容', en: 'IG / Facebook content' }, description: { 'zh-Hant': '每月 12 個帖文設計及文案', en: '12 designed posts a month with captions' } },
    { key: 'care', group: 'care', oneOff: 0, monthly: 600, name: { 'zh-Hant': '優先支援 + 每月更新', en: 'Priority support + monthly updates' }, description: { 'zh-Hant': '每月 4 次內容修改，1 個工作天內回覆', en: '4 content edits a month, 1-business-day response' } },
    { key: 'training', group: 'care', oneOff: 1200, monthly: 0, name: { 'zh-Hant': '員工培訓（2 小時）', en: 'Staff training (2 h)' }, description: { 'zh-Hant': '教識你同員工用後台', en: 'Hands-on back-office training for your team' } },
  ] satisfies AddOn[],
};
