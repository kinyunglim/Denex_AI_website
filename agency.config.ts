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
  languageCount: number;
  accounts: number;
  monthlyIncludes: Text;
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
    "key": "starter",
    "name": {
      "zh-Hant": "起步網站",
      "en": "Starter"
    },
    "tagline": {
      "zh-Hant": "建立基本網上形象，方便客人搵到你。",
      "en": "A simple online presence so customers can find you."
    },
    "oneOff": 7800,
    "monthly": 280,
    "modules": [],
    "deliveryDays": 10,
    "languageCount": 1,
    "accounts": 1,
    "includes": [
      {
        "zh-Hant": "單頁範本網站，最多 5 個內容區塊",
        "en": "One-page template site, up to 5 sections"
      },
      {
        "zh-Hant": "1 種語言：繁體中文或英文",
        "en": "1 language: Traditional Chinese or English"
      },
      {
        "zh-Hant": "套用 Logo、品牌顏色；手機及電腦版面",
        "en": "Your logo and colours; mobile and desktop layouts"
      },
      {
        "zh-Hant": "聯絡表單、查詢電郵、WhatsApp 按鈕及地圖",
        "en": "Contact form, enquiry emails, WhatsApp button and map"
      },
      {
        "zh-Hant": "內容管理後台，1 個管理員帳號",
        "en": "Content editor with 1 administrator account"
      },
      {
        "zh-Hant": "基本 SEO：標題、描述及網站地圖",
        "en": "Basic SEO: titles, descriptions and sitemap"
      },
      {
        "zh-Hant": "1 輪整合修改及 30 分鐘遙距教學",
        "en": "1 revision round and 30-minute remote training"
      },
      {
        "zh-Hant": "你提供文字及相片，我哋排版上載",
        "en": "You supply copy and photos; we lay out and upload"
      },
      {
        "zh-Hant": "不包含 CRM、預約或網上付款",
        "en": "CRM, booking and online payments are not included"
      }
    ],
    "monthlyIncludes": {
      "zh-Hant": "寄存、SSL、每日備份、保安更新及系統故障處理；不包含日常內容代改。",
      "en": "Hosting, SSL, daily backups, security updates and fault fixes. Content editing is not included."
    }
  },
  {
    "key": "business",
    "name": {
      "zh-Hant": "生意網站",
      "en": "Business"
    },
    "tagline": {
      "zh-Hant": "查詢、預約、付款，一個後台處理。",
      "en": "Manage enquiries, bookings and payments in one place."
    },
    "oneOff": 12800,
    "monthly": 580,
    "modules": [
      "booking",
      "payments",
      "stripe",
      "catalog",
      "gcal"
    ],
    "deliveryDays": 21,
    "languageCount": 2,
    "accounts": 5,
    "highlight": true,
    "includes": [
      {
        "zh-Hant": "起步網站功能，升級至最多 5 個獨立內容頁",
        "en": "Starter features, expanded to up to 5 content pages"
      },
      {
        "zh-Hant": "繁體中文及英文雙語；品牌化範本調整",
        "en": "Traditional Chinese and English; branded template styling"
      },
      {
        "zh-Hant": "基本文字整理及潤飾，2 輪整合修改",
        "en": "Copy organisation and light editing; 2 revision rounds"
      },
      {
        "zh-Hant": "CRM 客戶名單、查詢紀錄、備註及 Excel 匯入匯出",
        "en": "CRM contacts, enquiries, notes and Excel import/export"
      },
      {
        "zh-Hant": "網上預約、員工時間表、休假及確認電郵",
        "en": "Booking, staff schedules, time off and confirmation emails"
      },
      {
        "zh-Hant": "Google Calendar 單向同步，最多 5 個日曆",
        "en": "One-way Google Calendar sync, up to 5 calendars"
      },
      {
        "zh-Hant": "Stripe 付款連結、狀態同步、收款紀錄及中英收據",
        "en": "Stripe payment links, status sync, records and bilingual receipts"
      },
      {
        "zh-Hant": "產品／服務目錄及詢價，首次代上載最多 20 項",
        "en": "Catalogue and quote requests; initial upload of up to 20 items"
      },
      {
        "zh-Hant": "最多 5 個後台帳號；首次代設 10 項服務及 5 位員工",
        "en": "Up to 5 accounts; setup of 10 services and 5 staff"
      },
      {
        "zh-Hant": "GA4、Search Console、轉換追蹤及商家檔案設定協助",
        "en": "GA4, Search Console, conversion tracking and Business Profile setup help"
      },
      {
        "zh-Hant": "基本結構化資料及最多 10 組 FAQ",
        "en": "Basic structured data and up to 10 FAQs"
      },
      {
        "zh-Hant": "1 小時遙距培訓；上線後 30 日內一次內容微調",
        "en": "1-hour remote training; one content adjustment within 30 days of launch"
      }
    ],
    "monthlyIncludes": {
      "zh-Hant": "包含起步方案所有維護、營運系統使用，以及每月最多 30 分鐘現有內容更新。",
      "en": "Starter maintenance, operating system access and up to 30 minutes of existing-content updates each month."
    }
  },
  {
    "key": "pro",
    "name": {
      "zh-Hant": "專業全套",
      "en": "Pro"
    },
    "tagline": {
      "zh-Hant": "由品牌呈現到日常更新，交俾我哋跟進。",
      "en": "From brand presentation to ongoing updates, we take care of it."
    },
    "oneOff": 28800,
    "monthly": 1280,
    "modules": [
      "booking",
      "payments",
      "stripe",
      "catalog",
      "gcal"
    ],
    "deliveryDays": 30,
    "languageCount": 3,
    "accounts": 10,
    "includes": [
      {
        "zh-Hant": "生意網站全部功能，升級至最多 10 個內容頁",
        "en": "All Business features, expanded to up to 10 content pages"
      },
      {
        "zh-Hant": "專屬首頁及主要內頁視覺設計，以現有系統製作",
        "en": "Tailored homepage and key-page visual design on our existing system"
      },
      {
        "zh-Hant": "繁體、簡體及英文三語",
        "en": "Traditional Chinese, Simplified Chinese and English"
      },
      {
        "zh-Hant": "一次品牌訪談、文案及三語整理，最多 6,000 中文字及對應譯文",
        "en": "Brand interview, copywriting and three-language content; up to 6,000 Chinese characters plus translations"
      },
      {
        "zh-Hant": "3 輪整合修改",
        "en": "3 consolidated revision rounds"
      },
      {
        "zh-Hant": "一次香港單一地點 3 小時攝影，15 張精修相片",
        "en": "One 3-hour shoot at one Hong Kong location; 15 retouched photos"
      },
      {
        "zh-Hant": "首次代上載最多 50 項產品／服務；整理匯入 5,000 筆客戶資料",
        "en": "Initial upload of 50 catalogue items; clean and import 5,000 contacts"
      },
      {
        "zh-Hant": "最多 10 個帳號；首次代設 20 項服務及 10 位員工",
        "en": "Up to 10 accounts; setup of 20 services and 10 staff"
      },
      {
        "zh-Hant": "最多 3 條標準電郵自動跟進流程",
        "en": "Up to 3 standard automated email follow-up workflows"
      },
      {
        "zh-Hant": "AI 網站客服，每月包含 500 次回覆",
        "en": "Website AI assistant with 500 replies per month"
      },
      {
        "zh-Hant": "關鍵字研究、主要頁面 SEO、FAQ 及品牌資料整理",
        "en": "Keyword research, key-page SEO, FAQs and brand information"
      },
      {
        "zh-Hant": "數據儀表板及每季一次 30 分鐘成效檢視",
        "en": "Analytics dashboard and a 30-minute quarterly review"
      },
      {
        "zh-Hant": "指定服務聯絡人；工作日 1 個工作天內首次回覆",
        "en": "Named service contact; first response within 1 business day"
      },
      {
        "zh-Hant": "兩次各 1 小時員工培訓",
        "en": "Two 1-hour staff training sessions"
      }
    ],
    "monthlyIncludes": {
      "zh-Hant": "包含生意方案所有維護、AI 客服指定用量、數據儀表板、季度檢視，以及每月最多 90 分鐘內容更新或小幅版面調整。",
      "en": "Business maintenance, included AI usage, analytics dashboard, quarterly reviews and up to 90 minutes of content updates or minor layout changes each month."
    }
  }
] satisfies Package[],
  // Legacy orders retain their saved quotes; new orders use fixed packages only.
  addOns: [] as AddOn[],
};
