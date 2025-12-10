import { FC } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useHaptics } from '../../../hooks/useHaptics';
import { cn } from '../../../utils/cn';

interface CheckInFABProps {
  onClick: () => void;
  hasTodayLog: boolean;
  className?: string;
}

/**
 * Floating Action Button for check-ins
 * Shows Plus icon for new entry, Edit2 icon for updating today's entry
 */
export const CheckInFAB: FC<CheckInFABProps> = ({ onClick, hasTodayLog, className }) => {
  const { t } = useTranslation();
  const { medium } = useHaptics();

  const handleClick = () => {
    medium();
    onClick();
  };

  const Icon = hasTodayLog ? Edit2 : Plus;

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed bottom-24 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-2 border-biolum-cyan bg-biolum-cyan/20 text-biolum-cyan shadow-glow-lg backdrop-blur-glass transition-all',
        'hover:shadow-glow-strong hover:scale-110 hover:bg-biolum-cyan/30',
        'active:scale-95',
        className
      )}
      aria-label={hasTodayLog ? t('tideLog.checkIn') : t('tideLog.checkIn')}
    >
      {/* Pulsing glow animation */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-biolum-cyan"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Icon size={28} strokeWidth={2.5} />
    </motion.button>
  );
};
