import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

/**
 * StreakCard - Prominent streak display (redesigned)
 *
 * Design philosophy:
 * - Warm-ember themed (differentiate from cyan achievements)
 * - Celebrates growth without pressure
 * - Visual milestone markers
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="relative mb-8 overflow-hidden rounded-2xl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-warm-ember/20 via-warm-ember/10 to-transparent" />

      {/* Animated glow effect */}
      {hasStreak && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(255, 179, 138, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(255, 179, 138, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(255, 179, 138, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Border */}
      <div className="absolute inset-0 rounded-2xl border border-warm-ember/30" />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          {/* Left side - Streak info */}
          <div className="flex items-center gap-4">
            {/* Flame icon with enhanced glow */}
            <motion.div
              className="relative"
              animate={
                hasStreak
                  ? {
                      scale: [1, 1.05, 1],
                    }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow rings */}
              {hasStreak && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-warm-ember/20"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-warm-ember/20"
                    animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                </>
              )}

              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-full ${
                  hasStreak ? 'bg-warm-ember/30' : 'bg-mist-white/5'
                }`}
              >
                <Flame
                  size={28}
                  className={hasStreak ? 'text-warm-ember' : 'text-mist-white/30'}
                  fill={hasStreak ? 'rgba(255, 179, 138, 0.3)' : 'none'}
                />
              </div>
            </motion.div>

            {/* Streak numbers */}
            <div>
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={currentStreak}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-mist-white"
                >
                  {currentStreak}
                </motion.span>
                <span className="text-lg font-normal text-mist-white/60">
                  {currentStreak === 1
                    ? t('achievements.streak.day')
                    : t('achievements.streak.days')}
                </span>
              </div>

              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-mist-white/50">
                {hasStreak ? (
                  <>
                    <TrendingUp size={14} className="text-warm-ember/70" />
                    {t('achievements.streak.keepGoing')}
                  </>
                ) : (
                  t('achievements.streak.start')
                )}
              </p>
            </div>
          </div>

          {/* Right side - Personal best badge */}
          {isPersonalBest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
              className="flex items-center gap-1 rounded-full bg-warm-ember/25 px-3 py-1.5"
            >
              <Sparkles size={14} className="text-warm-ember" />
              <span className="text-xs font-semibold text-warm-ember">
                {t('achievements.streak.personalBest')}
              </span>
            </motion.div>
          )}
        </div>

        {/* Progress to next milestone */}
        {hasStreak && currentStreak < 30 && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-mist-white/40">
                {t('achievements.streak.nextMilestone', { days: nextMilestone })}
              </span>
              <span className="text-xs font-medium text-warm-ember/70">
                {currentStreak}/{nextMilestone}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-mist-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-warm-ember/60 to-warm-ember"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Longest streak (when different from current) */}
        {longestStreak > 0 && longestStreak > currentStreak && (
          <p className="mt-3 text-xs text-mist-white/30">
            {t('achievements.streak.longest', { count: longestStreak })}
          </p>
        )}
      </div>
    </motion.div>
  );
};
