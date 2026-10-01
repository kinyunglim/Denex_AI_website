/**
 * What the agency sells. Edit prices and wording here; the pricing page,
 * order form, price calculation and admin all read from this file.
 * Prices are HKD suggestions for the Hong Kong SME market.
 */
export type ModuleKey = 'booking' | 'payments' | 'stripe' | 'gcal' | 'catalog' | 'mobile';
export type Text = { 'zh-Hant': string; en: string };
export type TemplateCategory = 'pro' | 'health' | 'food' | 'life';
/** Add-on groups, in display order (pricing page, services page, order form). */
export const ADD_ON_GROUPS = ['feature', 'search', 'social', 'ads', 'data', 'content', 'brand', 'care'] as const;
export type AddOnGroup = (typeof ADD_ON_GROUPS)[number];

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
  group: AddOnGroup;
  /** Priced per extra language, page, etc. */
  perUnit?: Text;
};

export const agency = {
  currency: 'HKD',
  /** Share of the one-off price taken as a deposit when ordering (0–1). */
  depositRate: 0.5,
  /** Where client-starter's preview deployment lives (PREVIEW_MODE=1). */
  previewBaseUrl: process.env.NEXT_PUBLIC_PREVIEW_BASE_URL || 'http://localhost:3100',
  /** Template categories, used as filter tabs in the gallery. */
  categories: [
    { key: 'pro', name: { 'zh-Hant': '專業服務', en: 'Professional' } },
    { key: 'health', name: { 'zh-Hant': '健康美容', en: 'Health & beauty' } },
    { key: 'food', name: { 'zh-Hant': '餐飲零售', en: 'Food & retail' } },
    { key: 'life', name: { 'zh-Hant': '生活教育', en: 'Lifestyle & education' } },
  ] satisfies { key: TemplateCategory; name: Text }[],
  themes: [
    { key: 'corporate', category: 'pro', name: { 'zh-Hant': '企業專業', en: 'Corporate' }, fit: { 'zh-Hant': '顧問、律師、會計、金融', en: 'Consulting, legal, finance' } },
    { key: 'tech', category: 'pro', name: { 'zh-Hant': '科技初創', en: 'Tech' }, fit: { 'zh-Hant': 'IT 服務、SaaS、初創', en: 'IT services, SaaS, start-ups' } },
    { key: 'interior', category: 'pro', name: { 'zh-Hant': '室內設計', en: 'Interior' }, fit: { 'zh-Hant': '室內設計、地產、建築', en: 'Interior design, property, architecture' } },
    { key: 'warm', category: 'health', name: { 'zh-Hant': '溫暖生活', en: 'Warm' }, fit: { 'zh-Hant': '物理治療、健身、瑜伽', en: 'Physio, fitness, yoga' } },
    { key: 'clinic', category: 'health', name: { 'zh-Hant': '醫療診所', en: 'Clinic' }, fit: { 'zh-Hant': '牙科、醫務所、中醫', en: 'Dental, medical, TCM clinics' } },
    { key: 'beauty', category: 'health', name: { 'zh-Hant': '美容優雅', en: 'Beauty' }, fit: { 'zh-Hant': '美容院、美甲、護膚', en: 'Beauty salons, nails, skincare' } },
    { key: 'product', category: 'food', name: { 'zh-Hant': '現代產品', en: 'Product' }, fit: { 'zh-Hant': '貿易、B2B、產品品牌', en: 'Trading, B2B, product brands' } },
    { key: 'restaurant', category: 'food', name: { 'zh-Hant': '餐廳美食', en: 'Restaurant' }, fit: { 'zh-Hant': '餐廳、咖啡店、餅店', en: 'Restaurants, cafes, bakeries' } },
    { key: 'florist', category: 'food', name: { 'zh-Hant': '花藝自然', en: 'Florist' }, fit: { 'zh-Hant': '花店、有機店、手作', en: 'Florists, organic shops, crafts' } },
    { key: 'bold', category: 'life', name: { 'zh-Hant': '大膽潮流', en: 'Bold' }, fit: { 'zh-Hant': '理髮、紋身、潮流店', en: 'Barbers, tattoo, streetwear' } },
    { key: 'education', category: 'life', name: { 'zh-Hant': '教育補習', en: 'Education' }, fit: { 'zh-Hant': '補習社、興趣班、學校', en: 'Tutoring, classes, schools' } },
    { key: 'pets', category: 'life', name: { 'zh-Hant': '寵物生活', en: 'Pets' }, fit: { 'zh-Hant': '寵物美容、獸醫、寵物店', en: 'Pet grooming, vets, pet shops' } },
  ] satisfies { key: string; category: TemplateCategory; name: Text; fit: Text }[],
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
    { key: 'seo', group: 'search', oneOff: 2500, monthly: 0, name: { 'zh-Hant': 'SEO 基礎設定 + Google 商家檔案', en: 'SEO setup + Google Business Profile' }, description: { 'zh-Hant': '關鍵字研究、Search Console、網站地圖、地圖商家', en: 'Keyword research, Search Console, sitemap, Maps listing' } },
    { key: 'ads', group: 'ads', oneOff: 0, monthly: 2800, name: { 'zh-Hant': '廣告代操（Google / Meta）', en: 'Ads management (Google / Meta)' }, description: { 'zh-Hant': '每月優化及報告（廣告費另計）', en: 'Monthly optimisation + report (ad spend extra)' } },
    { key: 'social', group: 'social', oneOff: 0, monthly: 3800, name: { 'zh-Hant': 'IG / Facebook 內容', en: 'IG / Facebook content' }, description: { 'zh-Hant': '每月 12 個帖文設計及文案', en: '12 designed posts a month with captions' } },

    // --- Search: SEO & GEO
    { key: 'seo-monthly', group: 'search', oneOff: 0, monthly: 4800, name: { 'zh-Hant': 'SEO 月度優化', en: 'Monthly SEO' }, description: { 'zh-Hant': '關鍵字排名追蹤、技術修正、每月 2 篇 SEO 文章', en: 'Rank tracking, technical fixes, 2 SEO articles a month' } },
    { key: 'geo', group: 'search', oneOff: 3800, monthly: 1800, name: { 'zh-Hant': 'GEO（AI 搜尋優化）', en: 'GEO (AI search optimisation)' }, description: { 'zh-Hant': '令 ChatGPT、Gemini、Perplexity 同 Google AI 概覽都搵到你：結構化資料、FAQ 內容、品牌資料一致', en: 'Get found in ChatGPT, Gemini, Perplexity and Google AI Overviews: structured data, FAQ content, consistent brand facts' } },
    { key: 'reviews', group: 'search', oneOff: 0, monthly: 800, name: { 'zh-Hant': 'Google 評價管理', en: 'Google review management' }, description: { 'zh-Hant': '自動邀請客人留評價、回覆範本、每月評價報告', en: 'Automatic review requests, reply templates, monthly review report' } },
    // --- Social media
    { key: 'reels', group: 'social', oneOff: 0, monthly: 4800, name: { 'zh-Hant': '短片 Reels / 小紅書 / TikTok', en: 'Short video (Reels / RED / TikTok)' }, description: { 'zh-Hant': '每月 4 條短片：腳本、拍攝剪接、字幕', en: '4 short videos a month: script, shoot and edit, subtitles' } },
    { key: 'community', group: 'social', oneOff: 0, monthly: 2200, name: { 'zh-Hant': '社群管理', en: 'Community management' }, description: { 'zh-Hant': '工作日回覆留言同 DM，查詢直接入 CRM', en: 'Replies to comments and DMs on weekdays; enquiries go straight into the CRM' } },
    { key: 'kol', group: 'social', oneOff: 3000, monthly: 0, name: { 'zh-Hant': 'KOL / 網紅合作', en: 'KOL / influencer campaign' }, description: { 'zh-Hant': '揀選、聯絡、跟進同成效報告（KOL 費用另計）', en: 'Selection, outreach, follow-up and results report (KOL fees extra)' } },
    // --- Ads
    { key: 'landing', group: 'ads', oneOff: 3500, monthly: 0, perUnit: { 'zh-Hant': '每頁', en: 'per page' }, name: { 'zh-Hant': '廣告著陸頁', en: 'Ad landing page' }, description: { 'zh-Hant': '為單一廣告活動設計，表單直接入 CRM', en: 'Built for one campaign, with the form feeding the CRM' } },
    { key: 'remarketing', group: 'ads', oneOff: 1800, monthly: 0, name: { 'zh-Hant': '再營銷設定', en: 'Remarketing setup' }, description: { 'zh-Hant': '向睇過網站嘅人再次展示廣告（Google + Meta）', en: 'Show ads again to people who visited the site (Google + Meta)' } },
    // --- Data & automation
    { key: 'analytics', group: 'data', oneOff: 2800, monthly: 0, name: { 'zh-Hant': '數據追蹤設定', en: 'Analytics & tracking setup' }, description: { 'zh-Hant': 'GA4、Google Tag Manager、Meta Pixel、查詢同預約轉換事件', en: 'GA4, Google Tag Manager, Meta Pixel, enquiry and booking conversions' } },
    { key: 'dashboard', group: 'data', oneOff: 0, monthly: 1200, name: { 'zh-Hant': 'KPI 儀表板 + 每月報告', en: 'KPI dashboard + monthly report' }, description: { 'zh-Hant': '流量、查詢、轉換率、獲客成本、廣告回報、排名，一頁睇晒', en: 'Traffic, leads, conversion rate, cost per customer, ROAS and rankings on one page' } },
    { key: 'cro', group: 'data', oneOff: 0, monthly: 2500, name: { 'zh-Hant': '轉換率優化', en: 'Conversion rate optimisation' }, description: { 'zh-Hant': 'A/B 測試標題、按鈕同表單，每月一輪改善', en: 'A/B tests on headlines, buttons and forms, one round a month' } },
    { key: 'edm', group: 'data', oneOff: 0, monthly: 1500, name: { 'zh-Hant': '電郵 / WhatsApp 推廣', en: 'Email / WhatsApp campaigns' }, description: { 'zh-Hant': '每月 2 次推廣，用 CRM 名單分組發送', en: '2 campaigns a month, sent to CRM segments' } },
    { key: 'automation', group: 'data', oneOff: 3500, monthly: 0, name: { 'zh-Hant': '營銷自動化', en: 'Marketing automation' }, description: { 'zh-Hant': '新查詢自動跟進、生日優惠、舊客喚醒', en: 'Automatic follow-up on new leads, birthday offers, win-back messages' } },
    { key: 'ai-chat', group: 'data', oneOff: 4800, monthly: 600, name: { 'zh-Hant': 'AI 客服助手', en: 'AI chat assistant' }, description: { 'zh-Hant': '喺你網站 24 小時解答查詢、推介服務，對話記錄入 CRM', en: 'Answers questions on your site around the clock and recommends services; chats logged in the CRM' } },
    // --- Content
    { key: 'video', group: 'content', oneOff: 8800, monthly: 0, name: { 'zh-Hant': '品牌宣傳短片', en: 'Brand video' }, description: { 'zh-Hant': '1 分鐘宣傳片，半日拍攝連剪接', en: '1-minute promo, half-day shoot plus edit' } },
    { key: 'care', group: 'care', oneOff: 0, monthly: 600, name: { 'zh-Hant': '優先支援 + 每月更新', en: 'Priority support + monthly updates' }, description: { 'zh-Hant': '每月 4 次內容修改，1 個工作天內回覆', en: '4 content edits a month, 1-business-day response' } },
    { key: 'training', group: 'care', oneOff: 1200, monthly: 0, name: { 'zh-Hant': '員工培訓（2 小時）', en: 'Staff training (2 h)' }, description: { 'zh-Hant': '教識你同員工用後台', en: 'Hands-on back-office training for your team' } },
  ] satisfies AddOn[],
};
