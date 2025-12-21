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
 * AchievementCard - Single achievement display (redesigned)
 *
 * Features:
 * - Fixed aspect ratio for consistent grid
 * - Internal circular progress ring for locked items
 * - Strong visual distinction between locked/unlocked
 * - Elegant glow effect for unlocked achievements
 */
export const AchievementCard: FC<AchievementCardProps> = ({ achievement }) => {
  const { t } = useTranslation();
  const Icon = getLucideIcon(achievement.iconName);

  // Calculate the circular progress (for the ring)
  const circumference = 2 * Math.PI * 20; // radius = 20
  const progressOffset = circumference - (achievement.progress / 100) * circumference;

  return (
    <motion.div
      className={cn(
        'relative flex aspect-square flex-col items-center justify-center rounded-2xl p-2',
        'transition-all duration-500 ease-viscous',
        achievement.isUnlocked
          ? 'bg-gradient-to-br from-biolum-cyan/20 via-biolum-cyan/10 to-transparent'
          : 'bg-glass-bg/50'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer glow for unlocked */}
      {achievement.isUnlocked && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: '0 0 20px rgba(100, 255, 218, 0.3), inset 0 0 20px rgba(100, 255, 218, 0.1)',
          }}
          animate={{
            boxShadow: [
              '0 0 15px rgba(100, 255, 218, 0.2), inset 0 0 15px rgba(100, 255, 218, 0.05)',
              '0 0 25px rgba(100, 255, 218, 0.4), inset 0 0 25px rgba(100, 255, 218, 0.15)',
              '0 0 15px rgba(100, 255, 218, 0.2), inset 0 0 15px rgba(100, 255, 218, 0.05)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Border */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl border',
          achievement.isUnlocked ? 'border-biolum-cyan/60' : 'border-glass-border/50'
        )}
      />

      {/* Icon container with progress ring */}
      <div className="relative mb-1.5">
        {/* Progress ring for locked achievements */}
        {!achievement.isUnlocked && achievement.progress > 0 && (
          <svg className="absolute -inset-1.5 h-[52px] w-[52px] -rotate-90">
            {/* Background ring */}
            <circle
              cx="26"
              cy="26"
              r="20"
              fill="none"
              stroke="rgba(226, 232, 240, 0.1)"
              strokeWidth="3"
            />
            {/* Progress ring */}
            <motion.circle
              cx="26"
              cy="26"
              r="20"
              fill="none"
              stroke="rgba(100, 255, 218, 0.5)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: progressOffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
        )}

        {/* Icon background circle */}
        <div
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-full',
            'transition-all duration-500 ease-viscous',
            achievement.isUnlocked
              ? 'bg-biolum-cyan/30 text-biolum-cyan'
              : 'bg-mist-white/5 text-mist-white/25'
          )}
        >
          {achievement.isUnlocked ? (
            <Icon size={20} strokeWidth={2} />
          ) : (
            <div className="relative">
              <Icon size={18} strokeWidth={1.5} className="opacity-40" />
              <Lock
                size={10}
                className="absolute -bottom-0.5 -right-0.5 text-mist-white/40"
                strokeWidth={2.5}
              />
            </div>
          )}
        </div>
      </div>

      {/* Name - single line with ellipsis */}
      <span
        className={cn(
          'w-full text-center text-[10px] font-medium leading-tight',
          'line-clamp-2 px-1',
          achievement.isUnlocked ? 'text-mist-white' : 'text-mist-white/40'
        )}
      >
        {t(`achievements.names.${achievement.id}`)}
      </span>

      {/* Progress percentage for locked (shown below name) */}
      {!achievement.isUnlocked && achievement.progress > 0 && (
        <span className="mt-0.5 text-[9px] font-medium text-biolum-cyan/60">
          {Math.round(achievement.progress)}%
        </span>
      )}

      {/* Unlocked checkmark badge */}
      {achievement.isUnlocked && (
        <motion.div
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-biolum-cyan shadow-glow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <LucideIcons.Check size={12} className="text-void-blue" strokeWidth={3} />
        </motion.div>
      )}
    </motion.div>
  );
};
