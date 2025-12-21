import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as LucideIcons from 'lucide-react';

interface AchievementToastContentProps {
  achievementId: string;
  iconName: string;
}

/**
 * Get Lucide icon component by name
 */
function getLucideIcon(name: string): LucideIcons.LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>;
  const Icon = icons[name];
  return Icon || LucideIcons.Circle;
}

/**
 * Custom toast content component for achievement unlocks
 * Celebratory but not overwhelming - matches ocean aesthetic
 */
const AchievementToastContent: FC<AchievementToastContentProps> = ({ achievementId, iconName }) => {
  const { t } = useTranslation();
  const Icon = getLucideIcon(iconName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-xl border border-biolum-cyan/50 bg-void-blue px-4 py-3 shadow-glow-sm backdrop-blur-glass"
    >
      {/* Glowing icon */}
      <motion.div
        className="rounded-full bg-biolum-cyan/20 p-2"
        animate={{
          boxShadow: [
            '0 0 10px rgba(100, 255, 218, 0.3)',
            '0 0 20px rgba(100, 255, 218, 0.5)',
            '0 0 10px rgba(100, 255, 218, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={20} className="text-biolum-cyan" />
      </motion.div>

      {/* Text content */}
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-biolum-cyan/70">
          {t('treasures.unlocked')}
        </span>
        <span className="text-sm font-medium text-mist-white">
          {t(`treasures.names.${achievementId}`)}
        </span>
      </div>
    </motion.div>
  );
};

/**
 * Show achievement toast with haptic feedback
 */
export const showAchievementToast = (
  achievementId: string,
  iconName: string,
  haptics: { medium: () => Promise<void> }
) => {
  // Celebratory haptic
  haptics.medium();

  toast.custom(
    () => <AchievementToastContent achievementId={achievementId} iconName={iconName} />,
    {
      duration: 4000,
      position: 'top-center',
    }
  );
};

export { AchievementToastContent };
