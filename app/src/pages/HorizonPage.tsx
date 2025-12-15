import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, PieChart, Target, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';

import { useIlluminate } from '../hooks/useIlluminate';
import { useUI } from '../contexts/UIContext';
import { LoadingSpinner } from '../components/ui';
import { DISTORTION_INFO } from '../services/illuminate.service';
import type { CognitiveDistortion } from '../models';
import { cn } from '../utils/cn';

/**
 * Horizon Page - Progress Dashboard
 * Visualizes anxiety trends, distortion patterns, and progress over time
 */
export const HorizonPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { entries, loading, getAverageIntensity, getDistortionCounts, getEmotionCounts } =
    useIlluminate();
  const { navbarBottom } = useUI();

  // Calculate stats
  const avgIntensity7d = getAverageIntensity(7);
  const avgIntensity30d = getAverageIntensity(30);
  const distortionCounts = getDistortionCounts();
  const emotionCounts = getEmotionCounts();

  // Get sorted distortions for display
  const sortedDistortions = Object.entries(distortionCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate total distortions
  const totalDistortions = Object.values(distortionCounts).reduce((a, b) => a + b, 0);

  // Calculate streak (consecutive days with entries)
  const calculateStreak = () => {
    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const hasEntry = entries.some((entry) => {
        const entryDate = new Date(entry.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });

      if (hasEntry) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-void-blue/75">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-void-blue/75">
      {/* Header */}
      <header className="shrink-0 border-b border-glass-border bg-void-blue px-4 py-4 pt-safe sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lighthouse')}
            className="rounded-full p-2 text-mist-white/70 transition-colors hover:bg-mist-white/10 hover:text-mist-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-light text-mist-white">{t('horizon.title', 'Horizon')}</h1>
            <p className="text-sm text-mist-white/60">
              {t('horizon.subtitle', 'Your progress over time')}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
        style={{ paddingBottom: `${Math.max(navbarBottom + 32, 96)}px` }}
      >
        {entries.length === 0 ? (
          // Empty state
          <div className="flex h-full flex-col items-center justify-center px-8">
            <TrendingUp size={48} className="mb-4 text-mist-white/30" />
            <p className="text-center text-mist-white/60">
              {t('horizon.empty', 'Complete a few reflections to see your progress here.')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="rounded-xl border border-glass-border bg-glass-bg p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-mist-white/50">
                  <Award size={14} />
                  <span>{t('horizon.stats.streak', 'Streak')}</span>
                </div>
                <p className="text-2xl font-bold text-warm-ember">
                  {streak} {t('horizon.stats.days', 'days')}
                </p>
              </motion.div>

              {/* Total reflections */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-glass-border bg-glass-bg p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-mist-white/50">
                  <Calendar size={14} />
                  <span>{t('horizon.stats.total', 'Total')}</span>
                </div>
                <p className="text-2xl font-bold text-biolum-cyan">{entries.length}</p>
              </motion.div>
            </div>

            {/* Intensity Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-glass-border bg-glass-bg p-4"
            >
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-biolum-cyan" />
                <h3 className="font-medium text-mist-white">
                  {t('horizon.intensity.title', 'Emotional Intensity')}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-1 text-xs text-mist-white/50">
                    {t('horizon.intensity.7day', '7-day average')}
                  </p>
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      avgIntensity7d <= 40
                        ? 'text-green-400'
                        : avgIntensity7d <= 60
                          ? 'text-yellow-400'
                          : 'text-orange-400'
                    )}
                  >
                    {avgIntensity7d}%
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-mist-white/50">
                    {t('horizon.intensity.30day', '30-day average')}
                  </p>
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      avgIntensity30d <= 40
                        ? 'text-green-400'
                        : avgIntensity30d <= 60
                          ? 'text-yellow-400'
                          : 'text-orange-400'
                    )}
                  >
                    {avgIntensity30d}%
                  </p>
                </div>
              </div>

              {/* Simple trend indicator */}
              {entries.length >= 7 && avgIntensity7d < avgIntensity30d && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-400/10 p-2 text-sm text-green-400">
                  <TrendingUp size={16} />
                  <span>
                    {t('horizon.intensity.improving', 'Your emotional intensity is improving!')}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Distortion Patterns */}
            {sortedDistortions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-glass-border bg-glass-bg p-4"
              >
                <div className="mb-4 flex items-center gap-2">
                  <PieChart size={18} className="text-warm-ember" />
                  <h3 className="font-medium text-mist-white">
                    {t('horizon.distortions.title', 'Common Thinking Patterns')}
                  </h3>
                </div>

                <div className="space-y-3">
                  {sortedDistortions.map(([type, count], index) => {
                    const info = DISTORTION_INFO[type as CognitiveDistortion];
                    const percentage = Math.round((count / totalDistortions) * 100);

                    return (
                      <motion.div
                        key={type}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{info?.emoji || '💭'}</span>
                            <span className="text-sm text-mist-white">
                              {t(`illuminate.distortions.${type}.name`, info?.name || type)}
                            </span>
                          </div>
                          <span className="text-sm text-mist-white/50">
                            {count}x ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-mist-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                            className="h-full rounded-full bg-biolum-cyan"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-glass-border bg-glass-bg p-4"
            >
              <div className="mb-4 flex items-center gap-2">
                <Target size={18} className="text-biolum-cyan" />
                <h3 className="font-medium text-mist-white">
                  {t('horizon.milestones.title', 'Milestones')}
                </h3>
              </div>

              <div className="space-y-2">
                {/* First reflection */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full',
                      entries.length >= 1 ? 'bg-biolum-cyan' : 'bg-mist-white/20'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      entries.length >= 1 ? 'text-mist-white' : 'text-mist-white/50'
                    )}
                  >
                    {t('horizon.milestones.first', 'First reflection')}
                  </span>
                </div>

                {/* 7 reflections */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full',
                      entries.length >= 7 ? 'bg-biolum-cyan' : 'bg-mist-white/20'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      entries.length >= 7 ? 'text-mist-white' : 'text-mist-white/50'
                    )}
                  >
                    {t('horizon.milestones.week', '7 reflections')}
                  </span>
                </div>

                {/* 30 reflections */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full',
                      entries.length >= 30 ? 'bg-biolum-cyan' : 'bg-mist-white/20'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      entries.length >= 30 ? 'text-mist-white' : 'text-mist-white/50'
                    )}
                  >
                    {t('horizon.milestones.month', '30 reflections')}
                  </span>
                </div>

                {/* 7-day streak */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full',
                      streak >= 7 ? 'bg-warm-ember' : 'bg-mist-white/20'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm',
                      streak >= 7 ? 'text-mist-white' : 'text-mist-white/50'
                    )}
                  >
                    {t('horizon.milestones.streak7', '7-day streak')}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
