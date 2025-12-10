import { useTranslation } from 'react-i18next';
import { Moon, Brain, Zap, Hand } from 'lucide-react';
import {
  ScrollReveal,
  ScrollRevealGroup,
  ScrollRevealItem,
} from '@/components/effects/ScrollReveal';
import { cn } from '@/lib/cn';

const PHILOSOPHY_ITEMS = [
  {
    titleKey: 'philosophy.darkByDesign.title',
    descriptionKey: 'philosophy.darkByDesign.description',
    icon: Moon,
  },
  {
    titleKey: 'philosophy.evidenceBased.title',
    descriptionKey: 'philosophy.evidenceBased.description',
    icon: Brain,
  },
  {
    titleKey: 'philosophy.immediateRelief.title',
    descriptionKey: 'philosophy.immediateRelief.description',
    icon: Zap,
  },
  {
    titleKey: 'philosophy.therapeuticTouch.title',
    descriptionKey: 'philosophy.therapeuticTouch.description',
    icon: Hand,
  },
] as const;

/**
 * Philosophy section - explains the app's unique approach
 * Dark aesthetic, evidence-based, immediate relief, therapeutic haptics
 */
export function PhilosophySection() {
  const { t } = useTranslation();

  return (
    <section id="philosophy" className="relative overflow-hidden py-24 sm:py-32">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-void-blue via-void-blue/95 to-void-blue" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(100,255,218,0.05)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="text-center">
          <h2 className="text-3xl font-bold text-mist-white sm:text-4xl">
            {t('philosophy.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mist-white/70">
            {t('philosophy.subtitle')}
          </p>
        </ScrollReveal>

        {/* Philosophy Points */}
        <ScrollRevealGroup className="mt-16 grid gap-8 sm:grid-cols-2" staggerDelay={0.1}>
          {PHILOSOPHY_ITEMS.map((point) => {
            const Icon = point.icon;
            return (
              <ScrollRevealItem key={point.titleKey}>
                <div className="flex gap-5">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        'border border-glass-border bg-glass-bg'
                      )}
                    >
                      <Icon className="h-6 w-6 text-biolum-cyan" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-mist-white">{t(point.titleKey)}</h3>
                    <p className="mt-2 leading-relaxed text-mist-white/70">
                      {t(point.descriptionKey)}
                    </p>
                  </div>
                </div>
              </ScrollRevealItem>
            );
          })}
        </ScrollRevealGroup>

        {/* Quote */}
        <ScrollReveal delay={0.5}>
          <blockquote className="mx-auto mt-16 max-w-3xl text-center">
            <p className="text-xl italic text-mist-white/80 sm:text-2xl">
              "{t('philosophy.quote')}"
            </p>
          </blockquote>
        </ScrollReveal>
      </div>
    </section>
  );
}
