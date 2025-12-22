import { motion, Variants } from 'framer-motion';
import { Anchor, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHaptics } from '../../../hooks/useHaptics';

interface WelcomeStepProps {
  onContinue: () => void;
  direction: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.15,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function WelcomeStep({ onContinue, direction }: WelcomeStepProps) {
  const { t } = useTranslation();
  const { light } = useHaptics();

  const handleContinue = async () => {
    await light();
    onContinue();
  };

  return (
    <motion.div
      key="welcome"
      custom={direction}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="flex h-full flex-col items-center justify-center px-8 pb-safe"
    >
      {/* Pulsing anchor icon with glow rings */}
      <motion.div variants={itemVariants} className="relative mb-8">
        {/* Outer glow ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-5 rounded-full bg-biolum-cyan/20 blur-xl"
        />
        {/* Inner glow ring */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0.5,
            ease: 'easeInOut',
          }}
          className="absolute -inset-3 rounded-full bg-biolum-cyan/30 blur-lg"
        />
        <Anchor
          size={120}
          strokeWidth={1}
          className="relative text-biolum-cyan drop-shadow-[0_0_20px_rgba(100,255,218,0.5)]"
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        variants={itemVariants}
        className="mb-2 text-4xl font-light tracking-wide text-mist-white"
      >
        {t('onboarding.welcome.title')}
      </motion.h1>

      {/* Subtitle */}
      <motion.p variants={itemVariants} className="mb-10 text-center text-lg text-mist-white/70">
        {t('onboarding.welcome.subtitle')}
      </motion.p>

      {/* Privacy promise */}
      <motion.div
        variants={itemVariants}
        className="mb-12 flex items-center gap-2 text-sm text-mist-white/50"
      >
        <Lock size={14} />
        <span>{t('onboarding.welcome.privacy')}</span>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        variants={itemVariants}
        onClick={handleContinue}
        whileTap={{ scale: 0.95 }}
        className="rounded-full bg-biolum-cyan px-10 py-4 text-lg font-medium text-void-blue shadow-[0_0_20px_rgba(100,255,218,0.4)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(100,255,218,0.6)]"
      >
        {t('onboarding.welcome.continue')}
      </motion.button>
    </motion.div>
  );
}
