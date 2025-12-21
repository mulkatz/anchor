import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { Lock, Check } from 'lucide-react';
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
  const { t } = useTranslation();
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
        'relative flex aspect-square flex-col items-center justify-center rounded-xl p-1.5',
        'transition-all duration-500 ease-viscous',
        isUnlocked ? 'bg-biolum-cyan/10' : 'bg-void-blue/50'
      )}
      whileTap={{ scale: 0.95 }}
    >
      {/* Border */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-xl border',
          isUnlocked ? 'border-biolum-cyan/40' : 'border-mist-white/10'
        )}
      />

      {/* Glow for unlocked */}
      {isUnlocked && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              '0 0 12px rgba(100, 255, 218, 0.15), inset 0 0 12px rgba(100, 255, 218, 0.05)',
              '0 0 20px rgba(100, 255, 218, 0.25), inset 0 0 20px rgba(100, 255, 218, 0.1)',
              '0 0 12px rgba(100, 255, 218, 0.15), inset 0 0 12px rgba(100, 255, 218, 0.05)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Icon container */}
      <div className="relative mb-1">
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
              isUnlocked ? 'text-biolum-cyan' : 'text-mist-white/20'
            )}
          />

          {/* Lock overlay for locked achievements */}
          {!isUnlocked && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-mist-white/20 bg-void-blue">
              <Lock size={9} className="text-mist-white/40" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <span
        className={cn(
          'w-full text-center text-[9px] font-medium leading-tight',
          'line-clamp-2 px-0.5',
          isUnlocked ? 'text-mist-white' : 'text-mist-white/35'
        )}
      >
        {t(`achievements.names.${achievement.id}`)}
      </span>

      {/* Progress percentage */}
      {hasProgress && (
        <span className="mt-0.5 text-[8px] font-semibold text-biolum-cyan/70">
          {Math.round(achievement.progress)}%
        </span>
      )}

      {/* Checkmark badge for unlocked */}
      {isUnlocked && (
        <motion.div
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-biolum-cyan"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Check size={10} className="text-void-blue" strokeWidth={3} />
        </motion.div>
      )}
    </motion.div>
  );
};
