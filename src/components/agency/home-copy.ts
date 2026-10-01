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
    services: { 'zh-Hant': '服務', en: 'Services' },
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
  marketing: {
    title1: { 'zh-Hant': '唔止網站', en: 'More than a website' },
    title2: { 'zh-Hant': '一站式數碼營銷', en: 'Full-service digital marketing' },
    body: {
      'zh-Hant': '網站上線只係第一步。我哋幫你俾人搵到、吸引客人查詢，再用數據話你知每一蚊推廣費用帶嚟幾多生意。',
      en: 'Launching the site is step one. We help customers find you, turn visits into enquiries, and show with data what every marketing dollar brings back.',
    },
    pillars: [
      { icon: 'search', keys: ['seo', 'seo-monthly'], title: { 'zh-Hant': 'SEO 搜尋優化', en: 'SEO' }, body: { 'zh-Hant': 'Google 搜尋同地圖排名，每月追蹤關鍵字', en: 'Google search and Maps rankings, tracked monthly' } },
      { icon: 'sparkle', keys: ['geo'], title: { 'zh-Hant': 'GEO（AI 搜尋）', en: 'GEO (AI search)' }, body: { 'zh-Hant': '令 ChatGPT、Gemini、Perplexity 推介你', en: 'Get recommended by ChatGPT, Gemini and Perplexity' } },
      { icon: 'social', keys: ['social', 'reels', 'community', 'kol'], title: { 'zh-Hant': '社交媒體', en: 'Social media' }, body: { 'zh-Hant': 'IG、Facebook、小紅書帖文同短片，留言都幫你覆', en: 'Posts and short videos for IG, Facebook and RED, with comment replies' } },
      { icon: 'megaphone', keys: ['ads', 'landing', 'remarketing'], title: { 'zh-Hant': '廣告投放', en: 'Advertising' }, body: { 'zh-Hant': 'Google 同 Meta 廣告、著陸頁、再營銷', en: 'Google and Meta ads, landing pages, remarketing' } },
      { icon: 'chart', keys: ['analytics', 'dashboard', 'cro'], title: { 'zh-Hant': '數據及 KPI 報告', en: 'Data & KPI reports' }, body: { 'zh-Hant': '追蹤查詢同轉換，每月一份睇得明嘅報告', en: 'Track enquiries and conversions, with a monthly report you can read' } },
      { icon: 'mail', keys: ['edm', 'automation'], title: { 'zh-Hant': '電郵及 WhatsApp', en: 'Email & WhatsApp' }, body: { 'zh-Hant': '用 CRM 名單做推廣，自動跟進新查詢', en: 'Campaigns to CRM segments and automatic lead follow-up' } },
      { icon: 'bot', keys: ['ai-chat'], title: { 'zh-Hant': 'AI 客服助手', en: 'AI chat assistant' }, body: { 'zh-Hant': '24 小時解答查詢，對話記錄入 CRM', en: 'Answers enquiries 24/7, with chats logged in the CRM' } },
      { icon: 'star', keys: ['reviews'], title: { 'zh-Hant': 'Google 評價管理', en: 'Review management' }, body: { 'zh-Hant': '自動邀請好評，提升地圖排名同信任度', en: 'Automatic review requests for better Maps ranking and trust' } },
    ],
    from: { 'zh-Hant': '起', en: 'from' },
    perMonth: { 'zh-Hant': '／月', en: '/mo' },
    cta: { 'zh-Hant': '睇全部服務', en: 'See all services' },
  },
  services: {
    title: { 'zh-Hant': '網站以外，我哋仲可以幫你做咩', en: 'Beyond the website: everything we can do for you' },
    sub: {
      'zh-Hant': '由俾人搵到、吸引查詢，到用數據優化，一個團隊包辦。每項服務都可以單獨加，唔使綁長約。',
      en: 'From being found and winning enquiries to optimising with data, one team handles it all. Every service can be added on its own, with no long lock-in.',
    },
    groupIntro: {
      feature: { 'zh-Hant': '加強網站本身嘅功能。', en: 'Extra capabilities for the website itself.' },
      search: { 'zh-Hant': '客人喺 Google 同 AI 搜尋問問題嗰陣，答案入面要有你。', en: 'When customers search on Google or ask an AI assistant, your business should be in the answer.' },
      social: { 'zh-Hant': '穩定出內容，建立信任，將追蹤者變成查詢。', en: 'Consistent content that builds trust and turns followers into enquiries.' },
      ads: { 'zh-Hant': '用廣告快速帶客，每一蚊都追蹤到成效。', en: 'Paid campaigns that bring customers quickly, with every dollar tracked.' },
      data: { 'zh-Hant': '量度、跟進、自動化：知道邊樣有效，再做多啲。', en: 'Measure, follow up, automate: find what works and do more of it.' },
      content: { 'zh-Hant': '文字、相片同影片，講好你嘅故事。', en: 'Words, photos and video that tell your story well.' },
      brand: { 'zh-Hant': '令客人一眼認得你。', en: 'A brand customers recognise at a glance.' },
      care: { 'zh-Hant': '上線之後，我哋繼續陪你。', en: 'We stay with you after launch.' },
    },
    kpiTitle1: { 'zh-Hant': '我哋幫你追蹤嘅', en: 'The key metrics' },
    kpiTitle2: { 'zh-Hant': '關鍵指標', en: 'we track for you' },
    kpiBody: { 'zh-Hant': '每月報告用你睇得明嘅語言解釋數字，同埋下個月要做咩。', en: 'Each monthly report explains the numbers in plain language, plus what to do next month.' },
    kpis: [
      { name: { 'zh-Hant': '網站流量', en: 'Website traffic' }, body: { 'zh-Hant': '幾多人嚟、由邊度嚟', en: 'How many visitors, and from where' } },
      { name: { 'zh-Hant': '查詢及預約數', en: 'Leads & bookings' }, body: { 'zh-Hant': '表單、WhatsApp、預約，全部入 CRM', en: 'Forms, WhatsApp and bookings, all in the CRM' } },
      { name: { 'zh-Hant': '轉換率', en: 'Conversion rate' }, body: { 'zh-Hant': '訪客之中有幾多變成查詢', en: 'Share of visitors who enquire' } },
      { name: { 'zh-Hant': '獲客成本（CAC）', en: 'Cost per customer (CAC)' }, body: { 'zh-Hant': '平均用幾多錢搵到一個客', en: 'Average spend to win one customer' } },
      { name: { 'zh-Hant': '廣告回報（ROAS）', en: 'Return on ad spend (ROAS)' }, body: { 'zh-Hant': '每 $1 廣告費帶返幾多生意', en: 'Revenue per $1 of ad spend' } },
      { name: { 'zh-Hant': '關鍵字排名', en: 'Keyword rankings' }, body: { 'zh-Hant': '重要關鍵字喺 Google 排第幾', en: 'Where key searches rank on Google' } },
      { name: { 'zh-Hant': 'AI 搜尋曝光', en: 'AI search visibility' }, body: { 'zh-Hant': 'ChatGPT、Gemini 有冇提到你', en: 'Whether ChatGPT and Gemini mention you' } },
      { name: { 'zh-Hant': '社交互動率', en: 'Social engagement' }, body: { 'zh-Hant': '讚好、留言、分享、儲存', en: 'Likes, comments, shares and saves' } },
      { name: { 'zh-Hant': 'Google 評分', en: 'Google rating' }, body: { 'zh-Hant': '評價數量同平均星數', en: 'Number of reviews and average stars' } },
      { name: { 'zh-Hant': '回頭客比率', en: 'Repeat customers' }, body: { 'zh-Hant': '舊客再光顧，用 CRM 計得準', en: 'Returning customers, measured from the CRM' } },
    ],
    stepsTitle: { 'zh-Hant': '每月合作流程', en: 'How a month works' },
    steps: [
      { title: { 'zh-Hant': '設定追蹤', en: 'Set up tracking' }, body: { 'zh-Hant': '先裝好 GA4 同轉換追蹤，定好目標。', en: 'Install GA4 and conversion tracking, and agree the goals.' } },
      { title: { 'zh-Hant': '執行', en: 'Execute' }, body: { 'zh-Hant': '內容、SEO、廣告按計劃推進。', en: 'Content, SEO and ads run to plan.' } },
      { title: { 'zh-Hant': '每月報告', en: 'Monthly report' }, body: { 'zh-Hant': 'KPI 儀表板加文字總結。', en: 'KPI dashboard plus a written summary.' } },
      { title: { 'zh-Hant': '優化', en: 'Optimise' }, body: { 'zh-Hant': '保留有效嘅，改善冇效嘅。', en: 'Keep what works, fix what does not.' } },
    ],
    ctaTitle: { 'zh-Hant': '唔知由邊樣開始？', en: 'Not sure where to start?' },
    ctaBody: { 'zh-Hant': '話我哋知你嘅行業同目標，我哋建議最值得做嘅兩三項。', en: 'Tell us your industry and goals, and we will suggest the two or three things worth doing first.' },
    ctaOrder: { 'zh-Hant': '揀網站方案', en: 'Choose a website plan' },
    ctaContact: { 'zh-Hant': '免費諮詢', en: 'Free consultation' },
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
