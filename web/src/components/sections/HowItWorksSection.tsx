import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const STEPS = [
  { step: 1, titleKey: 'howItWorks.step1.title', descriptionKey: 'howItWorks.step1.description' },
  { step: 2, titleKey: 'howItWorks.step2.title', descriptionKey: 'howItWorks.step2.description' },
  { step: 3, titleKey: 'howItWorks.step3.title', descriptionKey: 'howItWorks.step3.description' },
] as const;

const TECHNIQUES = [
  'howItWorks.technique1',
  'howItWorks.technique2',
  'howItWorks.technique3',
  'howItWorks.technique4',
  'howItWorks.technique5',
] as const;

/**
 * How It Works section - 3 steps with connecting line
 * Shows the SOS flow process
 */
export function HowItWorksSection() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="text-center">
          <h2 className="text-3xl font-bold text-mist-white sm:text-4xl">
            {t('howItWorks.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-white/70">
            {t('howItWorks.subtitle')}
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting Line - Desktop */}
          <div className="absolute left-0 right-0 top-[60px] hidden h-px bg-gradient-to-r from-transparent via-biolum-cyan/30 to-transparent lg:block" />

          {/* Steps Grid */}
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {STEPS.map((step, index) => (
              <ScrollReveal key={step.step} delay={index * 0.15} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Step Number */}
                  <motion.div
                    className={cn(
                      'relative flex h-[120px] w-[120px] items-center justify-center',
                      'rounded-full border border-biolum-cyan/30 bg-void-blue'
                    )}
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            boxShadow: [
                              '0 0 20px rgba(100, 255, 218, 0.2)',
                              '0 0 40px rgba(100, 255, 218, 0.3)',
                              '0 0 20px rgba(100, 255, 218, 0.2)',
                            ],
                          }
                    }
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  >
                    <span className="text-4xl font-bold text-biolum-cyan">{step.step}</span>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-biolum-cyan/5" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="mt-6 text-xl font-semibold text-mist-white">{t(step.titleKey)}</h3>

                  {/* Description */}
                  <p className="mt-3 max-w-xs text-mist-white/70">{t(step.descriptionKey)}</p>
                </div>

                {/* Connecting Arrow - Mobile */}
                {index < STEPS.length - 1 && (
                  <div className="mx-auto my-6 h-8 w-px bg-gradient-to-b from-biolum-cyan/30 to-transparent lg:hidden" />
                )}
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Techniques List */}
        <ScrollReveal delay={0.5}>
          <div className="mt-16 rounded-3xl border border-glass-border bg-glass-bg p-6 backdrop-blur-glass sm:p-8">
            <h3 className="text-center text-lg font-medium text-biolum-cyan">
              {t('howItWorks.techniques')}
            </h3>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {TECHNIQUES.map((techniqueKey) => (
                <span
                  key={techniqueKey}
                  className={cn(
                    'rounded-full border border-biolum-cyan/30 bg-biolum-cyan/10 px-4 py-2',
                    'text-sm text-biolum-cyan'
                  )}
                >
                  {t(techniqueKey)}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
