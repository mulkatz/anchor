import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Shell } from 'lucide-react';
import { useAchievements } from '../contexts/AchievementContext';
import { useUI } from '../contexts/UIContext';
import { useHaptics } from '../hooks/useHaptics';
import { AchievementSection, StreakCard } from '../components/features/achievements';
import { LoadingSpinner } from '../components/ui';
import { categoryOrder } from '../data/achievements';
import { cn } from '../utils/cn';
import type { AchievementCategory } from '../models';

/**
 * AchievementsPage - "Treasures" - Ocean-themed achievement showcase
 *
 * Features:
 * - Header matching app-wide style (like ChatPage)
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

  // Categories to display (excluding streak which is shown in StreakCard)
  const displayCategories = categoryOrder.filter((category) => category !== 'streak');

  return (
    <div className="flex h-full flex-col bg-void-blue">
      {/* Header - matching ChatPage style */}
      <header className="flex shrink-0 items-center justify-between border-b border-glass-border bg-void-blue px-4 py-4 pt-safe">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <motion.button
            onClick={handleBack}
            whileTap={{ scale: 0.95 }}
            className="-ml-2 rounded-full p-2 text-mist-white/70 transition-colors hover:bg-glass-bg hover:text-mist-white"
          >
            <ChevronLeft size={24} />
          </motion.button>

          <div>
            <h1 className="text-2xl font-light text-mist-white">{t('treasures.title')}</h1>
            <p className="text-sm text-mist-white/60">{t('treasures.subtitle')}</p>
          </div>
        </div>

        {/* Progress chip - like ChatPage buttons */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2',
            'bg-glass-bg backdrop-blur-glass',
            'border border-glass-border'
          )}
        >
          <Shell size={16} className="text-biolum-cyan" />
          <span className="text-sm font-medium text-biolum-cyan">
            {unlockedCount}
            <span className="text-mist-white/40">/{totalCount}</span>
          </span>
        </div>
      </header>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-6"
        style={{ paddingBottom: `${navbarBottom + 24}px` }}
      >
        {isLoading ? (
          <LoadingSpinner className="flex-1" />
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
                title={t(`treasures.categories.${category}`)}
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
