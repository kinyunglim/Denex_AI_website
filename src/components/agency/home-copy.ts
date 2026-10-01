import { agency, type Text } from '@/agency.config';

/**
 * Agency storefront copy (header, home page, footer). Numbers are derived from
 * agency.config.ts so the home page never disagrees with the pricing page.
 */
const packages = agency.packages;
const minOneOff = Math.min(...packages.map((p) => p.oneOff));
const minMonthly = Math.min(...packages.map((p) => p.monthly));
const minDays = Math.min(...packages.map((p) => p.deliveryDays));
const maxDays = Math.max(...packages.map((p) => p.deliveryDays));
const hkd = (n: number) => `HK$${n.toLocaleString('en-US')}`;

export type Lang = 'zh-Hant' | 'en';
export const langOf = (locale: string): Lang => (locale === 'en' ? 'en' : 'zh-Hant');

export const copy = {
  topBar: {
    promo: { 'zh-Hant': '免費 30 分鐘諮詢 · 先試玩範本，滿意先落單', en: 'Free 30-minute consultation · Try the templates before you order' },
    quote: { 'zh-Hant': '索取報價', en: 'Get a quote' },
  },
  nav: {
    home: { 'zh-Hant': '主頁', en: 'Home' },
    templates: { 'zh-Hant': '範本', en: 'Templates' },
    pricing: { 'zh-Hant': '價錢', en: 'Pricing' },
    cases: { 'zh-Hant': '案例', en: 'Work' },
    about: { 'zh-Hant': '優勢', en: 'Why us' },
    contact: { 'zh-Hant': '聯絡我們', en: 'Contact' },
    order: { 'zh-Hant': '立即落單', en: 'Order now' },
    menu: { 'zh-Hant': '選單', en: 'Menu' },
  },
  hero: {
    badge: { 'zh-Hant': '香港中小企網站 + CRM', en: 'Websites + CRM for Hong Kong SMEs' },
    line1: [
      { 'zh-Hant': '一個', en: 'A website that ' },
      { 'zh-Hant': '幫你做生意', en: 'runs your business' },
      { 'zh-Hant': '嘅網站', en: '' },
    ],
    line2: [
      { 'zh-Hant': '最快 ', en: 'live in as little as ' },
      { 'zh-Hant': `${minDays} 日`, en: `${minDays} days` },
      { 'zh-Hant': '上線', en: '' },
    ],
    sub1: { 'zh-Hant': '客人可以直接預約、查詢、付款，資料自動入你嘅客戶名單。', en: 'Customers book, enquire and pay online, and every one lands in your client list.' },
    sub2: { 'zh-Hant': '唔使識寫程式，後台自己改內容。', en: 'Update your own content from the back office, no coding needed.' },
    cta: { 'zh-Hant': '立即開始', en: 'Get started now' },
  },
  steps: {
    title1: { 'zh-Hant': '建立你嘅網站', en: 'Create your website' },
    title2: { 'zh-Hant': '只需 3 個步驟', en: 'in 3 easy steps' },
    items: [
      { title: { 'zh-Hant': '揀範本', en: 'Pick a template' }, body: { 'zh-Hant': `${agency.themes.length} 款風格即場試玩，揀最啱你行業嘅一款。`, en: `Try ${agency.themes.length} live styles and pick the one that fits your trade.` } },
      { title: { 'zh-Hant': '網上落單', en: 'Order online' }, body: { 'zh-Hant': '揀方案同加購，價錢即時計；我哋確認後先收訂金。', en: 'Choose a plan and add-ons with live pricing; the deposit is only charged once we confirm.' } },
      { title: { 'zh-Hant': '上線', en: 'Go live' }, body: { 'zh-Hant': '我哋放入你嘅文字同相片，教識你用後台，然後正式上線。', en: 'We load your copy and photos, train your team, then launch.' } },
    ],
  },
  plans: {
    label: { 'zh-Hant': '網站方案', en: 'Website plans' },
    title: { 'zh-Hant': '由呢個價錢開始建立你嘅網站', en: 'Start your website from' },
    price: `${hkd(minOneOff)}+`,
    body: { 'zh-Hant': `包寄存、SSL、每日備份同客戶管理系統，月費 ${hkd(minMonthly)} 起。`, en: `Hosting, SSL, daily backups and a client CRM included, from ${hkd(minMonthly)} a month.` },
    cta: { 'zh-Hant': '睇價錢', en: 'See pricing' },
  },
  action: {
    eyebrow: { 'zh-Hant': '立即行動', en: 'Action now' },
    title: { 'zh-Hant': '今日開始建立你嘅網站', en: 'Kick-start your website today' },
    body: { 'zh-Hant': '由設計、開發到上線，同一個團隊跟到尾。', en: 'Design, build and launch, handled by one team from start to finish.' },
    book: { 'zh-Hant': '預約免費諮詢', en: 'Book a free call' },
    order: { 'zh-Hant': '立即落單', en: 'Order now' },
  },
  why: {
    title1: { 'zh-Hant': '點解揀', en: 'Why choose' },
    title2: { 'zh-Hant': '我哋？', en: 'us?' },
    body: {
      'zh-Hant': '我哋唔止整一個好睇嘅網站。每個網站都連埋客戶管理、預約同收款，所有資料集中喺一個後台，你同員工都用得。',
      en: 'We do more than make a nice-looking site. Every site comes with client management, booking and payments in one back office that you and your staff can use.',
    },
    stats: [
      { icon: 'clock', value: { 'zh-Hant': `${minDays}–${maxDays} 日`, en: `${minDays}–${maxDays} days` }, label: { 'zh-Hant': '上線時間', en: 'Delivery time' } },
      { icon: 'layout', value: { 'zh-Hant': `${agency.themes.length} 款`, en: `${agency.themes.length}` }, label: { 'zh-Hant': '設計風格', en: 'Design styles' } },
      { icon: 'globe', value: { 'zh-Hant': '3 種', en: '3' }, label: { 'zh-Hant': '語言（繁 / 簡 / 英）', en: 'Languages' } },
      { icon: 'plus', value: { 'zh-Hant': `${agency.addOns.length} 項`, en: `${agency.addOns.length}` }, label: { 'zh-Hant': '加購服務', en: 'Add-on services' } },
      { icon: 'tag', value: { 'zh-Hant': `${hkd(minMonthly)} 起`, en: `from ${hkd(minMonthly)}` }, label: { 'zh-Hant': '月費全包', en: 'All-in monthly' } },
      { icon: 'shield', value: { 'zh-Hant': '100%', en: '100%' }, label: { 'zh-Hant': '資料屬於你，可匯出 Excel', en: 'Your data, exportable to Excel' } },
    ],
  },
  design: {
    title1: { 'zh-Hant': '揀你嘅設計', en: 'Choose your design' },
    title2: { 'zh-Hant': `${agency.themes.length} 款即用網站風格`, en: `${agency.themes.length} ready-made website styles` },
    body: {
      'zh-Hant': '每款風格都係完整網站：主頁、服務、案例、聯絡表單、預約同後台，全部已經做好。你只需要揀一款，再換上你嘅文字、相片同顏色。',
      en: 'Each style is a complete site: home, services, work, contact form, booking and back office, all ready. Pick one, then swap in your copy, photos and colours.',
    },
    cta: { 'zh-Hant': '試玩範本', en: 'Try the templates' },
  },
  gallery: {
    title1: { 'zh-Hant': '網站範本', en: 'Website' },
    title2: { 'zh-Hant': '即場試玩', en: 'templates' },
    body: { 'zh-Hant': '撳「預覽」睇真實網站，滿意就直接揀。', en: 'Open a live preview, then choose the one you like.' },
    all: { 'zh-Hant': '全部', en: 'All' },
    preview: { 'zh-Hant': '預覽', en: 'Preview' },
    choose: { 'zh-Hant': '揀呢款', en: 'Choose' },
    more: { 'zh-Hant': `睇全部 ${agency.themes.length} 個範本`, en: `View all ${agency.themes.length} templates` },
  },
  preview: {
    back: { 'zh-Hant': "← 所有範本", en: "← All templates" },
    desktop: { 'zh-Hant': "電腦版", en: "Desktop" },
    mobile: { 'zh-Hant': "手機版", en: "Mobile" },
    choose: { 'zh-Hant': "揀呢款風格", en: "Choose this style" },
    live: { 'zh-Hant': "開啟互動示範", en: "Open live demo" },
    note: {
      'zh-Hant': "以下係示範網站嘅完整頁面。文字、相片、顏色同 logo 會換成你嘅；需要嘅功能（預約、收款、產品目錄）可以喺落單時加。",
      en: "This is the full page of the demo site. Copy, photos, colours and logo are replaced with yours; features such as booking, payments and a catalogue are added when you order.",
    },
    includes: { 'zh-Hant': "每個網站都包括", en: "Every site includes" },
    list: [
      { 'zh-Hant': "主頁、服務、案例、關於、聯絡", en: "Home, services, work, about, contact" },
      { 'zh-Hant': "手機版自動適配", en: "Mobile-ready layout" },
      { 'zh-Hant': "中英文切換", en: "Chinese / English switch" },
      { 'zh-Hant': "後台客戶管理 CRM", en: "Back-office client CRM" },
    ],
    others: { 'zh-Hant': "其他風格", en: "Other styles" },
    fit: { 'zh-Hant': "適合", en: "Best for" },
  },
  chat: {
    open: { 'zh-Hant': "問 AI 助手", en: "Ask our AI assistant" },
    title: { 'zh-Hant': "AI 網站顧問", en: "AI website advisor" },
    status: { 'zh-Hant': "通常幾秒內回覆", en: "Replies in seconds" },
    greeting: {
      'zh-Hant': "你好！我係 AI 網站顧問。話我知你做咩生意、想網站幫你做到啲咩，我幫你揀方案、風格同計價錢。",
      en: "Hi! I am the AI website advisor. Tell me about your business and what you need the site to do, and I will help you pick a plan and style and work out the price.",
    },
    suggestions: [
      { 'zh-Hant': "我開診所，邊個方案啱我？", en: "I run a clinic. Which plan fits?" },
      { 'zh-Hant': "幾耐可以上線？", en: "How long until the site is live?" },
      { 'zh-Hant': "訂金點收？", en: "How does the deposit work?" },
      { 'zh-Hant': "4 款風格有咩分別？", en: "What is the difference between the styles?" },
    ],
    placeholder: { 'zh-Hant': "輸入你嘅問題…", en: "Type your question…" },
    send: { 'zh-Hant': "發送", en: "Send" },
    close: { 'zh-Hant': "關閉", en: "Close" },
    reset: { 'zh-Hant': "重新開始", en: "Start over" },
    disclaimer: { 'zh-Hant': "AI 回覆僅供參考，最終價錢以報價為準。", en: "AI answers are a guide; your quote is final." },
    unavailable: {
      'zh-Hant': "AI 助手暫時未開放。你可以直接落單，或者用聯絡表單搵我哋，我哋會盡快回覆。",
      en: "The AI assistant is not available right now. You can order directly or reach us through the contact form.",
    },
    busy: { 'zh-Hant': "問題太多喇，請等幾分鐘再試。", en: "Too many messages. Please try again in a few minutes." },
    error: { 'zh-Hant': "連線出咗問題，請再試一次。", en: "Something went wrong. Please try again." },
    order: { 'zh-Hant': "立即落單", en: "Order now" },
    contact: { 'zh-Hant': "聯絡我們", en: "Contact us" },
  },
  cards: [
    { title: { 'zh-Hant': '網站方案', en: 'Website plans' }, body: { 'zh-Hant': '3 個方案，按你嘅生意需要揀', en: 'Three plans to match your business' }, href: '/pricing', cta: { 'zh-Hant': '了解更多', en: 'Learn more' } },
    { title: { 'zh-Hant': '度身報價', en: 'Custom quote' }, body: { 'zh-Hant': '有特別需要？話我哋知，我哋幫你報價', en: 'Special requirements? Tell us and we will quote' }, href: '/#contact', cta: { 'zh-Hant': '了解更多', en: 'Learn more' } },
  ],
  advantages: {
    title1: { 'zh-Hant': '我哋嘅', en: 'Our competitive' },
    title2: { 'zh-Hant': '優勢', en: 'advantages' },
    body: { 'zh-Hant': '每個網站都用同一套已驗證嘅系統建立，功能齊全，按需要開關。', en: 'Every site is built on the same proven system, with features you switch on as needed.' },
    items: [
      { icon: 'users', title: { 'zh-Hant': '客戶管理 CRM', en: 'Client CRM' }, body: { 'zh-Hant': '每個查詢、預約、付款都記錄喺同一位客人名下。', en: 'Every enquiry, booking and payment filed under the right client.' } },
      { icon: 'calendar', title: { 'zh-Hant': '網上預約', en: 'Online booking' }, body: { 'zh-Hant': '客人自己揀服務、員工同時間，你一個畫面睇晒成個星期。', en: 'Customers pick service, staff and time; you see the whole week at a glance.' } },
      { icon: 'receipt', title: { 'zh-Hant': '收款及收據', en: 'Payments & receipts' }, body: { 'zh-Hant': '記錄收款，一按列印中英文收據。', en: 'Record payments and print bilingual receipts in one click.' } },
      { icon: 'card', title: { 'zh-Hant': '網上付款', en: 'Online payments' }, body: { 'zh-Hant': 'Stripe 付款連結，信用卡、Apple Pay 自動入賬。', en: 'Stripe payment links; card and Apple Pay recorded automatically.' } },
      { icon: 'globe', title: { 'zh-Hant': '多語言', en: 'Multilingual' }, body: { 'zh-Hant': '繁體中文、簡體中文、英文，一鍵切換。', en: 'Traditional Chinese, Simplified Chinese and English.' } },
      { icon: 'phone', title: { 'zh-Hant': '手機優先', en: 'Mobile first' }, body: { 'zh-Hant': '每個版面都為手機設計，客人用手機一樣易用。', en: 'Every layout is designed for phones first.' } },
      { icon: 'sheet', title: { 'zh-Hant': 'Excel 匯入匯出', en: 'Excel import & export' }, body: { 'zh-Hant': '一次過搬晒舊客戶名單，隨時匯出備份。', en: 'Bring your existing client list over in one go; export any time.' } },
      { icon: 'shield', title: { 'zh-Hant': '寄存及備份', en: 'Hosting & backups' }, body: { 'zh-Hant': 'SSL、每日備份、安全更新，全部包埋。', en: 'SSL, daily backups and security updates included.' } },
      { icon: 'support', title: { 'zh-Hant': '培訓及支援', en: 'Training & support' }, body: { 'zh-Hant': '上線前教識你同員工用後台，之後有問題隨時搵我哋。', en: 'We train your team before launch and stay on hand afterwards.' } },
    ],
  },
  cases: {
    title1: { 'zh-Hant': '我哋做過嘅', en: 'Projects' },
    title2: { 'zh-Hant': '項目', en: 'we have built' },
  },
  finalCta: {
    title: { 'zh-Hant': '用我哋嘅系統建立你嘅網站同 CRM', en: 'Build your website and CRM with us' },
    order: { 'zh-Hant': '立即落單', en: 'Order now' },
    contact: { 'zh-Hant': '聯絡我們', en: 'Contact us' },
  },
  footer: {
    tagline: { 'zh-Hant': '為香港中小企建立網站、網上預約同客戶管理系統，一站式由設計到上線。', en: 'Websites, online booking and client management for Hong Kong SMEs, from design to launch.' },
    site: { 'zh-Hant': '網站', en: 'Site' },
    plans: { 'zh-Hant': '方案', en: 'Plans' },
    contact: { 'zh-Hant': '聯絡', en: 'Contact' },
    rights: { 'zh-Hant': '版權所有', en: 'All rights reserved.' },
    top: { 'zh-Hant': '返回頂部', en: 'Back to top' },
    parent: { 'zh-Hant': 'DenEx Consulting 旗下服務', en: 'A DenEx Consulting service' },
  },
} satisfies Record<string, unknown>;

export const tx = (text: Text, lang: Lang) => text[lang];
