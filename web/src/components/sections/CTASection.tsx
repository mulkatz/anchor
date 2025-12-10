import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';
import { AppStoreBadges } from '@/components/ui/AppStoreBadges';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Final CTA section - download call to action
 * Intensified visual effects and prominent app store badges
 */
export function CTASection() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-biolum-cyan/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-biolum-cyan/10 blur-3xl" />
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Animated Anchor Icon */}
        <ScrollReveal>
          <motion.div
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-biolum-cyan/30 bg-void-blue"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    boxShadow: [
                      '0 0 30px rgba(100, 255, 218, 0.3)',
                      '0 0 60px rgba(100, 255, 218, 0.4)',
                      '0 0 30px rgba(100, 255, 218, 0.3)',
                    ],
                  }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Anchor className="h-12 w-12 text-biolum-cyan" />
          </motion.div>
        </ScrollReveal>

        {/* Headline */}
        <ScrollReveal delay={0.1}>
          <h2 className="text-4xl font-bold text-mist-white sm:text-5xl">{t('cta.title')}</h2>
        </ScrollReveal>

        {/* Subheadline */}
        <ScrollReveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-xl text-mist-white/70">
            {t('cta.subtitle')}
            <br />
            <span className="text-mist-white/90">{t('cta.subtitleHighlight')}</span>
          </p>
        </ScrollReveal>

        {/* App Store Badges */}
        <ScrollReveal delay={0.3}>
          <div className="mt-10">
            <AppStoreBadges size="lg" />
          </div>
        </ScrollReveal>

        {/* Trust Indicators */}
        <ScrollReveal delay={0.4}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-mist-white/50">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              {t('cta.trustPrivacy')}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-biolum-cyan" />
              {t('cta.trustEvidence')}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warm-ember" />
              {t('cta.trustCrisis')}
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
