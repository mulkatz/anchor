import type { FC } from 'react';
import { motion } from 'framer-motion';
import { AchievementCard } from './AchievementCard';
import type { Achievement } from '../../../models';

interface AchievementSectionProps {
  title: string;
  achievements: Achievement[];
  /** Delay before starting animations (for staggering sections) */
  delay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

/**
 * AchievementSection - Category grouping for achievements (redesigned)
 *
 * Features:
 * - Consistent 4-column grid
 * - Elegant section header with decorative line
 * - Staggered entrance animations
 * - Shows unlocked count per category
 */
export const AchievementSection: FC<AchievementSectionProps> = ({
  title,
  achievements,
  delay = 0,
}) => {
  if (achievements.length === 0) return null;

  const unlockedInCategory = achievements.filter((a) => a.isUnlocked).length;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
    >
      {/* Section header */}
      <div className="mb-4 flex items-center gap-3">
        {/* Title */}
        <h3 className="shrink-0 text-xs font-semibold uppercase tracking-widest text-mist-white/70">
          {title}
        </h3>

        {/* Decorative line */}
        <div className="h-px flex-1 bg-gradient-to-r from-glass-border/50 to-transparent" />

        {/* Count badge */}
        <span className="shrink-0 rounded-full bg-glass-bg/80 px-2 py-0.5 text-[10px] font-medium text-mist-white/50">
          {unlockedInCategory}/{achievements.length}
        </span>
      </div>

      {/* Achievement grid - always 4 columns */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-2"
      >
        {achievements.map((achievement) => (
          <motion.div key={achievement.id} variants={itemVariants}>
            <AchievementCard achievement={achievement} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
