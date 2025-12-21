import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { Lock } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { Achievement } from '../../../models';

interface AchievementCardProps {
  achievement: Achievement;
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
 * AchievementCard - Single achievement display (polished)
 *
 * Features:
 * - Fixed aspect ratio for consistent grid
 * - Clean circular progress ring for locked items
 * - Strong visual distinction between locked/unlocked
 * - Elegant glow effect for unlocked achievements
 */
export const AchievementCard: FC<AchievementCardProps> = ({ achievement }) => {
  const { t, i18n } = useTranslation();
  const Icon = getLucideIcon(achievement.iconName);

  // Calculate the circular progress (for the ring)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (achievement.progress / 100) * circumference;

  const isUnlocked = achievement.isUnlocked;
  const hasProgress = !isUnlocked && achievement.progress > 0;

  return (
    <motion.div
      className={cn(
        'relative flex aspect-square w-full flex-col items-center justify-center rounded-xl p-2',
        'transition-all duration-500 ease-viscous',
        isUnlocked ? 'bg-transparent' : 'bg-void-blue/40'
      )}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon container */}
      <div className="relative mb-2">
        {/* Progress ring for locked achievements with progress */}
        {hasProgress && (
          <svg className="absolute -inset-1 h-[44px] w-[44px] -rotate-90">
            {/* Background ring */}
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="rgba(100, 255, 218, 0.1)"
              strokeWidth="2.5"
            />
            {/* Progress ring */}
            <motion.circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="rgba(100, 255, 218, 0.6)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: progressOffset }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
        )}

        {/* Icon circle */}
        <div
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full',
            'transition-all duration-300',
            isUnlocked ? 'bg-biolum-cyan/25' : 'bg-mist-white/5'
          )}
        >
          <Icon
            size={18}
            strokeWidth={isUnlocked ? 2 : 1.5}
            className={cn(
              'transition-colors duration-300',
              isUnlocked ? 'text-biolum-cyan' : 'text-mist-white/25'
            )}
          />

          {/* Bottom-right badge: Lock for locked items only */}
          {!isUnlocked && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-mist-white/20 bg-void-blue">
              <Lock size={8} className="text-mist-white/40" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      {/* Name - fixed 2 lines for consistent height, with proper hyphenation */}
      <span
        className={cn(
          'w-full text-center text-[9px] font-medium leading-tight',
          'line-clamp-2 min-h-[24px] px-0.5',
          'hyphens-auto break-words',
          isUnlocked ? 'text-mist-white' : 'text-mist-white/40'
        )}
        lang={i18n.language}
      >
        {t(`treasures.names.${achievement.id}`)}
      </span>

      {/* Progress percentage */}
      {hasProgress && (
        <span className="text-[8px] font-semibold text-biolum-cyan/70">
          {Math.round(achievement.progress)}%
        </span>
      )}
    </motion.div>
  );
};
