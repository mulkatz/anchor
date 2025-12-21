import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Trophy } from 'lucide-react';
import { useAchievements } from '../contexts/AchievementContext';
import { useUI } from '../contexts/UIContext';
import { useHaptics } from '../hooks/useHaptics';
import { AchievementSection, StreakCard } from '../components/features/achievements';
import { categoryOrder } from '../data/achievements';
import type { AchievementCategory } from '../models';

/**
 * AchievementsPage - Motivational achievement showcase (redesigned)
 *
 * Features:
 * - Enhanced header with progress visualization
 * - Prominent streak card with milestone progress
 * - Organized achievement grid with category counts
 * - Smooth staggered animations
 */
export const AchievementsPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { light } = useHaptics();
  const { navbarBottom } = useUI();
  const { summary, computedAchievements, unlockedCount, totalCount, isLoading } = useAchievements();

  // Group achievements by category
  const grouped = useMemo(() => {
    const result: Record<AchievementCategory, typeof computedAchievements> = {
      streak: [],
      chat: [],
      dive: [],
      lighthouse: [],
      tidelog: [],
      milestone: [],
    };

    for (const achievement of computedAchievements) {
      result[achievement.category].push(achievement);
    }

    // Sort each category by order
    for (const category of Object.keys(result) as AchievementCategory[]) {
      result[category].sort((a, b) => a.order - b.order);
    }

    return result;
  }, [computedAchievements]);

  const handleBack = async () => {
    await light();
    navigate(-1);
  };

  // Calculate overall progress percentage
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // Categories to display (excluding streak which is shown in StreakCard)
  const displayCategories = categoryOrder.filter((category) => category !== 'streak');

  return (
    <div className="flex h-full flex-col bg-void-blue">
      {/* Header */}
      <header className="shrink-0 bg-void-blue px-4 pb-4 pt-safe">
        <div className="flex items-center gap-3 pt-4">
          {/* Back button */}
          <motion.button
            onClick={handleBack}
            whileTap={{ scale: 0.95 }}
            className="-ml-1 rounded-full p-2 text-mist-white/70 transition-colors hover:bg-glass-bg hover:text-mist-white"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div className="flex-1">
            <h1 className="text-xl font-semibold text-mist-white">{t('achievements.title')}</h1>
          </div>

          {/* Trophy with count */}
          <div className="flex items-center gap-2 rounded-full bg-biolum-cyan/10 px-3 py-1.5">
            <Trophy size={16} className="text-biolum-cyan" />
            <span className="text-sm font-semibold text-biolum-cyan">
              {unlockedCount}
              <span className="font-normal text-biolum-cyan/60">/{totalCount}</span>
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="h-1 overflow-hidden rounded-full bg-glass-bg">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-biolum-cyan/70 to-biolum-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-4"
        style={{ paddingBottom: `${navbarBottom + 24}px` }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-mist-white/50"
            >
              {t('general.loading')}
            </motion.div>
          </div>
        ) : (
          <>
            {/* Streak Card - Prominent at top */}
            <StreakCard
              currentStreak={summary?.stats.current_streak || 0}
              longestStreak={summary?.stats.longest_streak || 0}
            />

            {/* Achievement Sections - Following category order with staggered delays */}
            {displayCategories.map((category, index) => (
              <AchievementSection
                key={category}
                title={t(`achievements.categories.${category}`)}
                achievements={grouped[category]}
                delay={index * 0.1}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
