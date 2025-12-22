import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Phone, Stethoscope, Building2 } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface DisclaimerStepProps {
  onComplete: () => void;
  direction: number;
}

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
      staggerChildren: 0.08,
      delayChildren: 0.15,
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

const CRISIS_RESOURCES = [
  { id: 'call988', icon: Phone },
  { id: 'call911', icon: AlertTriangle },
  { id: 'contactTherapist', icon: Stethoscope },
  { id: 'goToER', icon: Building2 },
];

export function DisclaimerStep({ onComplete, direction }: DisclaimerStepProps) {
  const { t } = useTranslation();
  const { medium } = useHaptics();

  const handleAccept = async () => {
    await medium();
    onComplete();
  };

  return (
    <motion.div
      key="disclaimer"
      custom={direction}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex h-full flex-col items-center justify-center px-6 pb-safe"
    >
      {/* Title */}
      <motion.h2
        variants={itemVariants}
        className="mb-3 text-center text-xl font-medium text-mist-white"
      >
        {t('disclaimer.title')}
      </motion.h2>

      {/* Main Warning */}
      <motion.p
        variants={itemVariants}
        className="mb-2 text-center text-sm font-medium text-warm-ember"
      >
        {t('disclaimer.notSubstitute')}
      </motion.p>

      {/* Description */}
      <motion.p variants={itemVariants} className="mb-6 text-center text-sm text-mist-white/60">
        {t('disclaimer.description')}
      </motion.p>

      {/* Crisis Resources Box - hidden on very small screens (iPhone SE) */}
      <motion.div
        variants={itemVariants}
        className="mb-6 hidden w-full rounded-xl border border-glass-border bg-glass-bg p-4 backdrop-blur-glass [@media(min-height:700px)]:block"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-mist-white/50">
          {t('disclaimer.crisisTitle')}
        </p>
        <div className="space-y-2">
          {CRISIS_RESOURCES.map((resource) => {
            const Icon = resource.icon;
            return (
              <div key={resource.id} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-mist-white/5">
                  <Icon size={14} className="text-biolum-cyan" />
                </div>
                <span className="text-sm text-mist-white/80">{t(`disclaimer.${resource.id}`)}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Acknowledgment */}
      <motion.p variants={itemVariants} className="mb-8 text-center text-xs text-mist-white/40">
        {t('disclaimer.acknowledgment')}
      </motion.p>

      {/* Accept Button */}
      <motion.button
        variants={itemVariants}
        onClick={handleAccept}
        whileTap={{ scale: 0.95 }}
        className="rounded-full bg-biolum-cyan px-10 py-4 text-lg font-medium text-void-blue shadow-[0_0_20px_rgba(100,255,218,0.4)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(100,255,218,0.6)]"
      >
        {t('disclaimer.understand')}
      </motion.button>
    </motion.div>
  );
}
