import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Anchor, Heart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SUPPORT_EMAIL } from '@/lib/constants';
import { AppStoreBadges } from '@/components/ui/AppStoreBadges';

/**
 * Footer with links, app store badges, and copyright
 * Glass morphism styling consistent with the rest of the site
 */
export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { href: '#features', labelKey: 'footer.features' },
    { href: '#how-it-works', labelKey: 'footer.howItWorks' },
    { href: '#philosophy', labelKey: 'footer.ourApproach' },
  ];

  const legalLinks = [
    { href: '/privacy', labelKey: 'footer.privacyPolicy' },
    { href: '/terms', labelKey: 'footer.termsOfService' },
  ];

  const supportLinks = [{ href: `mailto:${SUPPORT_EMAIL}`, labelKey: 'footer.contactSupport' }];

  return (
    <footer className="border-t border-glass-border bg-void-blue/50 backdrop-blur-glass">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="group flex items-center gap-2 text-mist-white transition-colors duration-300 hover:text-biolum-cyan"
            >
              <Anchor className="h-8 w-8" />
              <span className="text-xl font-semibold">Anchor</span>
            </Link>
            <p className="mt-4 text-sm text-mist-white/60">
              {t('footer.tagline')}. {t('footer.description')}
            </p>
            <div className="mt-6">
              <AppStoreBadges size="sm" className="justify-start" />
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-biolum-cyan">
              {t('footer.product')}
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      'text-sm text-mist-white/70',
                      'transition-colors duration-300 hover:text-biolum-cyan'
                    )}
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-biolum-cyan">
              {t('footer.legal')}
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={cn(
                      'text-sm text-mist-white/70',
                      'transition-colors duration-300 hover:text-biolum-cyan'
                    )}
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-biolum-cyan">
              {t('footer.support')}
            </h3>
            <ul className="mt-4 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      'text-sm text-mist-white/70',
                      'transition-colors duration-300 hover:text-biolum-cyan'
                    )}
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`tel:${t('footer.crisisHotlineNumber')}`}
                  className={cn(
                    'text-sm text-mist-white/70',
                    'transition-colors duration-300 hover:text-biolum-cyan'
                  )}
                >
                  {t('footer.crisisHotline')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Crisis Resources Banner */}
        <div className="mt-12 rounded-2xl border border-warm-ember/30 bg-warm-ember/10 px-6 py-4">
          <p className="text-center text-sm text-warm-ember">
            <strong>{t('footer.crisisBanner')}</strong> {t('footer.crisisBannerText')}{' '}
            <a
              href={`tel:${t('footer.crisisHotlineNumber')}`}
              className="underline hover:no-underline"
            >
              {t('footer.crisisLine')}
            </a>{' '}
            {t('footer.crisisOr')}{' '}
            <a
              href={`tel:${t('footer.crisisEmergencyNumber')}`}
              className="underline hover:no-underline"
            >
              {t('footer.crisisEmergency')}
            </a>
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-glass-border pt-8 sm:flex-row">
          <p className="text-sm text-mist-white/50">
            &copy; {currentYear} {t('footer.copyright')}
          </p>
          <p className="flex items-center gap-1 text-sm text-mist-white/50">
            {t('footer.madeWith')} <Heart className="h-4 w-4 text-warm-ember" />{' '}
            {t('footer.forThose')}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs text-mist-white/40">{t('footer.disclaimer')}</p>
      </div>
    </footer>
  );
}
