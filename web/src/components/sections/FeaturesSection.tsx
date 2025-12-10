import { useTranslation } from 'react-i18next';
import { AlertCircle, MessageCircle, Mic, Shield } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  ScrollReveal,
  ScrollRevealGroup,
  ScrollRevealItem,
} from '@/components/effects/ScrollReveal';
import { cn } from '@/lib/cn';

const FEATURES = [
  {
    id: 'sos',
    titleKey: 'features.sos.title',
    descriptionKey: 'features.sos.description',
    icon: AlertCircle,
    accent: 'warm-ember',
  },
  {
    id: 'ai-chat',
    titleKey: 'features.aiChat.title',
    descriptionKey: 'features.aiChat.description',
    icon: MessageCircle,
    accent: 'biolum-cyan',
  },
  {
    id: 'voice',
    titleKey: 'features.voice.title',
    descriptionKey: 'features.voice.description',
    icon: Mic,
    accent: 'biolum-cyan',
  },
  {
    id: 'privacy',
    titleKey: 'features.privacy.title',
    descriptionKey: 'features.privacy.description',
    icon: Shield,
    accent: 'success',
  },
] as const;

const accentColors = {
  'warm-ember': 'text-warm-ember',
  'biolum-cyan': 'text-biolum-cyan',
  success: 'text-success',
} as const;

const accentGlows = {
  'warm-ember': 'shadow-[0_0_20px_rgba(255,179,138,0.3)]',
  'biolum-cyan': 'shadow-glow-sm',
  success: 'shadow-[0_0_20px_rgba(78,205,196,0.3)]',
} as const;

/**
 * Features section - 2x2 grid of feature cards
 * Each card has an icon, title, and description
 */
export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="text-center">
          <h2 className="text-3xl font-bold text-mist-white sm:text-4xl">{t('features.title')}</h2>
        </ScrollReveal>

        {/* Feature Cards Grid */}
        <ScrollRevealGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8" staggerDelay={0.1}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const accentColor = accentColors[feature.accent as keyof typeof accentColors];
            const accentGlow = accentGlows[feature.accent as keyof typeof accentGlows];

            return (
              <ScrollRevealItem key={feature.id}>
                <GlassCard hover className="h-full p-6 sm:p-8">
                  {/* Icon */}
                  <div
                    className={cn(
                      'inline-flex items-center justify-center rounded-2xl p-3',
                      'border border-glass-border bg-glass-bg',
                      accentGlow
                    )}
                  >
                    <Icon className={cn('h-6 w-6', accentColor)} />
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 text-xl font-semibold text-mist-white">
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    {t(feature.descriptionKey)}
                  </p>
                </GlassCard>
              </ScrollRevealItem>
            );
          })}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}
