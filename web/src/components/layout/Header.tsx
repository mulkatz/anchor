import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Anchor, Globe } from 'lucide-react';
import { cn } from '@/lib/cn';
import { APP_STORE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

const NAV_ITEMS = [
  { href: '#features', labelKey: 'nav.features' },
  { href: '#how-it-works', labelKey: 'nav.howItWorks' },
  { href: '#privacy', labelKey: 'nav.privacy' },
] as const;

/**
 * Sticky header with glass morphism blur background
 * Includes logo, navigation links, download CTA, and language switcher
 * Responsive with mobile hamburger menu
 */
export function Header() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de-DE' ? 'en-US' : 'de-DE';
    i18n.changeLanguage(newLang);
  };

  const currentLangLabel = i18n.language === 'de-DE' ? 'DE' : 'EN';

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-50',
        'transition-all duration-300 ease-viscous',
        'border-b border-glass-border bg-void-blue/80 backdrop-blur-glass'
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="focus-ring group flex items-center gap-2 rounded-lg text-mist-white transition-colors duration-300 hover:text-biolum-cyan"
        >
          <Anchor className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-xl font-semibold">Anchor</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Language Switcher - leftmost */}
          <button
            onClick={toggleLanguage}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium text-mist-white/80',
              'transition-colors duration-300 hover:text-biolum-cyan',
              'focus-ring rounded-lg px-2 py-1'
            )}
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            <span>{currentLangLabel}</span>
          </button>

          {/* Divider */}
          <span className="h-4 w-px bg-glass-border" />

          {NAV_ITEMS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium text-mist-white/80',
                'transition-colors duration-300 hover:text-biolum-cyan',
                'focus-ring rounded-lg px-2 py-1'
              )}
            >
              {t(link.labelKey)}
            </a>
          ))}

          <Button size="sm" onClick={() => window.open(APP_STORE_URL, '_blank')}>
            {t('nav.download')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            'flex items-center justify-center rounded-lg p-2 md:hidden',
            'text-mist-white transition-colors duration-300 hover:text-biolum-cyan',
            'focus-ring'
          )}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-glass-border bg-void-blue/95 backdrop-blur-glass md:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              {NAV_ITEMS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'text-lg font-medium text-mist-white/80',
                    'transition-colors duration-300 hover:text-biolum-cyan',
                    'focus-ring rounded-lg px-2 py-2'
                  )}
                >
                  {t(link.labelKey)}
                </a>
              ))}

              {/* Language Switcher (Mobile) */}
              <button
                onClick={toggleLanguage}
                className={cn(
                  'flex items-center gap-2 text-lg font-medium text-mist-white/80',
                  'transition-colors duration-300 hover:text-biolum-cyan',
                  'focus-ring rounded-lg px-2 py-2'
                )}
              >
                <Globe className="h-5 w-5" />
                <span>{i18n.language === 'de-DE' ? 'Deutsch' : 'English'}</span>
              </button>

              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    window.open(APP_STORE_URL, '_blank');
                    setMobileMenuOpen(false);
                  }}
                >
                  {t('nav.download')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
