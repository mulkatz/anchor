import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Sparkles, TrendingUp, Target } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

/**
 * StreakCard - Prominent streak display (polished)
 *
 * Design philosophy:
 * - Warm-ember themed (differentiate from cyan achievements)
 * - Celebrates growth without pressure
 * - Compact zero-state with encouragement
 * - Visual milestone markers for active streaks
 * - NO negative messaging about broken streaks
 */
export const StreakCard: FC<StreakCardProps> = ({ currentStreak, longestStreak }) => {
  const { t } = useTranslation();
  const isPersonalBest = currentStreak >= longestStreak && currentStreak > 0;
  const hasStreak = currentStreak > 0;

  // Visual streak milestones
  const milestones = [3, 7, 14, 30];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 30;
  const progressToNext = hasStreak ? Math.min((currentStreak / nextMilestone) * 100, 100) : 0;

  // Zero state - compact and encouraging
  if (!hasStreak) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="relative mb-6 overflow-hidden rounded-xl border border-warm-ember/15 bg-void-blue/80"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Inactive flame */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-ember/10">
            <Flame size={20} className="text-warm-ember/30" />
          </div>

          {/* Encouragement text */}
          <div className="flex-1">
            <p className="text-sm font-medium text-mist-white/60">{t('treasures.streak.start')}</p>
            <p className="text-xs text-mist-white/35">{t('treasures.streak.firstGoal')}</p>
          </div>

          {/* Target icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warm-ember/10">
            <Target size={16} className="text-warm-ember/40" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Active streak state
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="relative mb-6 overflow-hidden rounded-2xl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-warm-ember/15 via-warm-ember/5 to-transparent" />

      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(255, 179, 138, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(255, 179, 138, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(255, 179, 138, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-warm-ember/25" />

      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Streak info */}
          <div className="flex items-center gap-3">
            {/* Flame icon with subtle pulse */}
            <motion.div
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warm-ember/25"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame size={24} className="text-warm-ember" fill="rgba(255, 179, 138, 0.4)" />
            </motion.div>

            {/* Streak numbers */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <motion.span
                  key={currentStreak}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-3xl font-bold text-mist-white"
                >
                  {currentStreak}
                </motion.span>
                <span className="text-base font-normal text-mist-white/50">
                  {currentStreak === 1 ? t('treasures.streak.day') : t('treasures.streak.days')}
                </span>
              </div>

              <p className="flex items-center gap-1 text-xs text-mist-white/40">
                <TrendingUp size={12} className="text-warm-ember/60" />
                {t('treasures.streak.keepGoing')}
              </p>
            </div>
          </div>

          {/* Right side - Personal best badge or milestone progress */}
          {/* TODO: Re-enable when layout is fixed
          {isPersonalBest ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
              className="flex items-center gap-1 rounded-full bg-warm-ember/20 px-2.5 py-1"
            >
              <Sparkles size={12} className="text-warm-ember" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-warm-ember">
                {t('treasures.streak.personalBest')}
              </span>
            </motion.div>
          ) : (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-mist-white/30">
                {t('treasures.streak.next')}
              </p>
              <p className="text-lg font-semibold text-warm-ember/70">{nextMilestone}</p>
            </div>
          )}
          */}
        </div>

        {/* Progress bar to next milestone */}
        {currentStreak < 30 && (
          <div className="mt-3">
            <div className="h-1 overflow-hidden rounded-full bg-mist-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-warm-ember/50 to-warm-ember"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Longest streak hint (only when significantly higher) */}
        {longestStreak > currentStreak + 2 && (
          <p className="mt-2 text-[10px] text-mist-white/25">
            {t('treasures.streak.longest', { count: longestStreak })}
          </p>
        )}
      </div>
    </motion.div>
  );
};
