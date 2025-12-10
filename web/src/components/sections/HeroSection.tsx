import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { GlowOrb } from '@/components/effects/GlowOrb';
import { AppStoreBadges } from '@/components/ui/AppStoreBadges';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Viscous easing curve
const viscousEase = [0.22, 1, 0.36, 1] as const;

/**
 * Hero section - full viewport height with central GlowOrb
 * Contains headline, subheadline, and app store CTAs
 */
export function HeroSection() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: viscousEase,
      },
    },
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20">
      <motion.div
        className="flex flex-col items-center text-center"
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Glow Orb */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="mb-8">
          <GlowOrb size="lg" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="text-5xl font-bold tracking-tight text-mist-white sm:text-6xl lg:text-7xl"
        >
          <span className="text-glow">Anchor</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-2 text-xl text-biolum-cyan sm:text-2xl"
        >
          {t('hero.tagline')}
        </motion.p>

        {/* Subheadline */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mx-auto mt-6 max-w-2xl text-lg text-mist-white/70 sm:text-xl"
        >
          {t('hero.subheadline')}
        </motion.p>

        {/* App Store Badges */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="mt-10">
          <AppStoreBadges size="md" />
        </motion.div>

        {/* Free Badge */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-4 text-sm text-mist-white/50"
        >
          {t('cta.subtitle')}
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6, ease: viscousEase }}
      >
        <motion.a
          href="#features"
          className="flex flex-col items-center gap-2 text-mist-white/50 transition-colors hover:text-biolum-cyan"
          animate={prefersReducedMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.a>
      </motion.div>
    </section>
  );
}
