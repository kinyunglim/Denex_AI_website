import { getTranslations } from 'next-intl/server';
import { Locale, pickLocalized } from '@/src/lib/config';
import { getBusiness } from '@/src/lib/site-context';

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations('footer');
  const business = await getBusiness();
  const name = pickLocalized(business.name, locale);
  const address = pickLocalized(business.address, locale);

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted sm:grid-cols-3 sm:px-6">
        <div>
          <p className="heading text-base text-ink">{name}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {name}. {t('rights')}
          </p>
        </div>
        {address && (
          <div>
            <p className="font-semibold text-ink">{t('address')}</p>
            <p className="mt-1">{address}</p>
          </div>
        )}
        <div className="space-y-1">
          {business.phone && (
            <p>
              <span className="font-semibold text-ink">{t('phone')}：</span>
              <a href={`tel:${business.phone.replace(/\s/g, '')}`} className="hover:text-ink">
                {business.phone}
              </a>
            </p>
          )}
          {business.email && (
            <p>
              <span className="font-semibold text-ink">{t('email')}：</span>
              <a href={`mailto:${business.email}`} className="hover:text-ink">
                {business.email}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
