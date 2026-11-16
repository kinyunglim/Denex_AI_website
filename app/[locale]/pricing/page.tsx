import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';
import { agency } from '@/agency.config';
import { Icon } from '@/src/components/agency/visuals';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agency');
  return { title: t('pricingTitle') };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agency');
  const lang = locale === 'en' ? 'en' : 'zh-Hant';
  const en = lang === 'en';
  const starter = agency.packages.find(p => p.key === 'starter')!;
  const business = agency.packages.find(p => p.key === 'business')!;
  const money = new Intl.NumberFormat(en ? 'en-HK' : 'zh-HK', { style: 'currency', currency: agency.currency, maximumFractionDigits: 0 });
  const terms = en ? [
    ['Payment and monthly fees', 'The build fee is paid 50% on confirmation and 50% after acceptance, before launch. Monthly fees start at launch. Online deposit holds are captured only after we accept the order.'],
    ['Content and revisions', 'Starter and Business use existing templates and client-supplied copy, translations and photos. Business includes light editing; Pro includes the content services listed above. Submit feedback together for each revision round. New pages, features and redesigns need an agreed quote.'],
    ['Maintenance and updates', 'All plans include hosting, SSL, daily backups, security updates and fixes to delivered functionality. Monthly content time covers existing text, images and minor layout changes, does not roll over and excludes new features. Fault fixes do not use your content allowance.'],
    ['Third-party costs', 'Domain registration, business email, Stripe transaction fees, advertising spend and third-party messaging fees are separate. We confirm additional paid services before enabling them.'],
    ['Scope and delivery', 'The catalogue supports display and enquiries; cart, inventory, shipping and returns require a separate quote. Calendar sync is one-way. Delivery starts once the deposit, requirements and materials are confirmed, excluding client delays and third-party approvals.'],
    ['Pro services', 'AI replies use approved business information and include 500 replies per month; paid increases require your confirmation, with no automatic overage charge. Photography is at one Hong Kong location. Search ranking and AI recommendations are not guaranteed.'],
    ['Your data and cancellation', 'Your business data and supplied content belong to you. Business and Pro support export of system-supported data formats. The website is a hosted subscription; source-code transfer and migration require a separate quote. Contact us at least 30 days before cancellation.'],
  ] : [
    ['製作費同月費點計？', '製作費分兩期：確認後支付 50%，驗收後、正式上線前支付餘款。月費由正式上線日起計。網上預留訂金只會喺我哋確認接單後扣款。'],
    ['內容同修改包括幾多？', '起步及生意方案以現有範本製作，由你提供基本文字、譯文及相片；生意方案包含基本文字潤飾，專業方案包含上述文案及內容服務。每輪修改請一次過提交；新增頁面、功能及重新設計會先報價。'],
    ['月費包括甚麼？', '所有方案包寄存、SSL、每日備份、保安更新及已交付功能嘅故障處理。內容更新時數適用於現有文字、圖片及小幅版面調整，未使用時間不累積，新功能另報價。系統故障修正不扣內容更新時間。'],
    ['有冇其他費用？', '網域、公司電郵、Stripe 交易手續費、廣告費及第三方電郵／WhatsApp 發送費另計。需要額外付費服務時，我哋會先同你確認，唔會自動加收。'],
    ['功能同交付範圍', '產品目錄提供展示及詢價，完整購物車、庫存、運費及退貨流程另行報價。Google Calendar 為單向同步。交付時間由訂金、需求及素材齊備後起計，不包括等候客戶回覆及第三方審批時間。'],
    ['專業方案服務範圍', 'AI 客服根據你確認嘅業務資料回答，每月包 500 次回覆；需要增加用量會先聯絡你確認，不自動收超額費。攝影限香港單一地點。搜尋排名及 AI 推薦不設保證。'],
    ['資料同取消安排', '你提供嘅內容及業務資料屬於你。生意及專業方案可匯出系統支援格式嘅業務資料。網站以寄存訂閱方式提供，原始碼轉讓及轉往其他平台另行報價；取消服務請提前 30 日聯絡我哋。'],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl text-ink sm:text-5xl">{t('pricingTitle')}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">{t('pricingSub')}</p>
      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        {agency.packages.map(p => (
          <article id={p.key} key={p.key} className={`card scroll-mt-32 p-6 sm:p-7 ${p.highlight ? '!border-2 !border-primary !bg-surface-alt !shadow-none' : ''}`}>
            {p.highlight && <p className="mb-4 inline-block rounded-button bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary">{t('popular')}</p>}
            <h2 className="text-2xl text-ink">{p.name[lang]}</h2>
            <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted">{p.tagline[lang]}</p>
            <p className="mt-6 text-4xl font-semibold tabular-nums text-ink">{money.format(p.oneOff)}</p>
            <p className="mt-1 text-sm text-muted">{en ? 'One-time build fee' : '一次性製作費'}</p>
            <p className="mt-3 text-lg font-semibold tabular-nums text-ink">+ {money.format(p.monthly)} {t('perMonth')}</p>
            {p.highlight && <p className="mt-4 text-sm font-semibold text-primary">{en ? `Compared with Starter: ${money.format(business.oneOff - starter.oneOff)} more to build and ${money.format(business.monthly - starter.monthly)} more per month, with booking, payments and CRM included.` : `比起步製作費多 ${money.format(business.oneOff - starter.oneOff)}、月費多 ${money.format(business.monthly - starter.monthly)}，預約、付款、CRM 一次配齊。`}</p>}
            <Link href={`/order?package=${p.key}`} className={`mt-6 w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}>{en ? `Choose ${p.name.en}` : `選擇${p.name['zh-Hant']}`}</Link>
            <ul className="mt-7 space-y-3 text-sm leading-relaxed text-ink">
              {p.includes.map(item => <li key={item.en} className="flex items-start gap-2"><Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item[lang]}</span></li>)}
            </ul>
            <div className="mt-7 border-t border-line pt-5">
              <h3 className="text-sm font-semibold text-ink">{en ? 'Monthly fee includes' : '月費已包括'}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.monthlyIncludes[lang]}</p>
              <p className="mt-4 text-xs text-muted">{t('delivery', { n: p.deliveryDays })}</p>
              <p className="mt-2 text-xs tabular-nums text-muted">{en ? 'First year: ' : '首年總額：'}{money.format(p.oneOff + p.monthly * 12)}{en ? ' (build + 12 monthly fees)' : '（製作費＋12 個月月費）'}</p>
            </div>
          </article>
        ))}
      </div>
      <section className="mt-16 border-t border-line pt-10" aria-labelledby="pricing-terms">
        <h2 id="pricing-terms" className="text-2xl text-ink">{en ? 'Clear scope, clear fees' : '收費及服務說明'}</h2>
        <p className="mt-3 max-w-2xl text-muted">{en ? 'Common features are included in your package. Extra pages, apps or custom integrations are quoted before work begins.' : '常用功能已包入三個完整方案。額外頁面、手機 App 或特殊整合，會先確認範圍及報價。'}</p>
        <div className="mt-6 divide-y divide-line">
          {terms.map(([title,body]) => <details key={title} className="py-4"><summary className="cursor-pointer font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{title}</summary><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{body}</p></details>)}
        </div>
      </section>
      <div className="mt-12 rounded-card bg-surface-alt p-7 sm:p-10">
        <h2 className="text-2xl text-ink">{en ? 'Need help choosing?' : '唔肯定邊個方案適合你？'}</h2>
        <p className="mt-3 max-w-2xl text-muted">{en ? 'Tell us how you handle enquiries and bookings. We will help you choose a suitable plan.' : '話我哋知你點處理查詢同預約，我哋幫你揀合適方案。'}</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/book" className="btn-primary">{en ? 'Book a free 30-minute consultation' : '預約免費 30 分鐘諮詢'}</Link><Link href="/templates" className="btn-ghost">{en ? 'Try the templates' : '試玩網站範本'}</Link></div>
      </div>
    </section>
  );
}
