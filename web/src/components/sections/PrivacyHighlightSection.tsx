import { useTranslation } from 'react-i18next';
import { Shield, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/effects/ScrollReveal';

const PRIVACY_POINTS = [
  'privacyHighlight.points.autoDelete',
  'privacyHighlight.points.export',
  'privacyHighlight.points.noSelling',
  'privacyHighlight.points.encryption',
] as const;

/**
 * Privacy highlight section - showcases privacy-first approach
 * Key privacy features with badge
 */
export function PrivacyHighlightSection() {
  const { t } = useTranslation();

  return (
    <section id="privacy" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Side - Content */}
          <ScrollReveal direction="left">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-success/30 bg-success/10 p-2">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <span className="text-sm font-medium uppercase tracking-wider text-success">
                {t('privacyHighlight.badge')}
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-mist-white sm:text-4xl">
              {t('privacyHighlight.title')}
            </h2>

            <p className="mt-4 text-lg text-mist-white/70">{t('privacyHighlight.subtitle')}</p>

            {/* Privacy Points */}
            <ul className="mt-8 space-y-4">
              {PRIVACY_POINTS.map((pointKey) => (
                <li key={pointKey} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 rounded-full bg-success/20 p-1">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-mist-white/80">{t(pointKey)}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Right Side - Visual */}
          <ScrollReveal direction="right" delay={0.2}>
            <GlassCard glow className="relative overflow-hidden p-8 sm:p-12">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(78,205,196,0.15)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(78,205,196,0.1)_0%,transparent_50%)]" />
              </div>

              {/* Content */}
              <div className="relative text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
                  <Shield className="h-10 w-10 text-success" />
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-mist-white">
                  {t('privacyHighlight.cardTitle')}
                </h3>

                <p className="mt-4 text-mist-white/70">{t('privacyHighlight.cardSubtitle')}</p>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-glass-border bg-glass-bg p-4">
                    <div className="text-2xl font-bold text-success">
                      {t('privacyHighlight.stat1Value')}
                    </div>
                    <div className="mt-1 text-xs text-mist-white/60">
                      {t('privacyHighlight.stat1Label')}
                    </div>
                  </div>
                  <div className="rounded-xl border border-glass-border bg-glass-bg p-4">
                    <div className="text-2xl font-bold text-success">
                      {t('privacyHighlight.stat2Value')}
                    </div>
                    <div className="mt-1 text-xs text-mist-white/60">
                      {t('privacyHighlight.stat2Label')}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
