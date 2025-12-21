import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Anchor, Sun, Waves } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface PillarsStepProps {
  onComplete: () => void;
  direction: number;
}

const PILLARS = [
  {
    id: 'talk',
    icon: Anchor,
    titleKey: 'talk',
    descKey: 'talkDesc',
  },
  {
    id: 'reflect',
    icon: Sun,
    titleKey: 'reflect',
    descKey: 'reflectDesc',
  },
  {
    id: 'understand',
    icon: Waves,
    titleKey: 'understand',
    descKey: 'understandDesc',
  },
];

const containerVariants: Variants = {
  hidden: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const pillarVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function PillarsStep({ onComplete, direction }: PillarsStepProps) {
  const { t } = useTranslation();
  const { medium } = useHaptics();

  const handleStart = async () => {
    await medium();
    onComplete();
  };

  return (
    <motion.div
      key="pillars"
      custom={direction}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex h-full flex-col items-center justify-center px-8 pb-safe"
    >
      {/* Headline */}
      <motion.h2
        variants={itemVariants}
        className="mb-12 text-center text-2xl font-light text-mist-white"
      >
        {t('onboarding.pillars.headline')}
      </motion.h2>

      {/* Three pillars */}
      <motion.div variants={itemVariants} className="mb-12 flex flex-col items-center gap-6">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.id}
              variants={pillarVariants}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-glass-border bg-glass-bg shadow-glass backdrop-blur-glass">
                <Icon size={24} className="text-biolum-cyan" />
              </div>
              <span className="font-medium text-mist-white">
                {t(`onboarding.pillars.${pillar.titleKey}`)}
              </span>
              <span className="text-sm text-mist-white/60">
                {t(`onboarding.pillars.${pillar.descKey}`)}
              </span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Button */}
      <motion.button
        variants={itemVariants}
        onClick={handleStart}
        whileTap={{ scale: 0.95 }}
        className="rounded-full bg-biolum-cyan px-10 py-4 text-lg font-medium text-void-blue shadow-[0_0_20px_rgba(100,255,218,0.4)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(100,255,218,0.6)]"
      >
        {t('onboarding.pillars.start')}
      </motion.button>
    </motion.div>
  );
}
