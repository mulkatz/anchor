import { type FC } from 'react';
import { Lightbulb, Plus, TrendingUp, PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  IlluminateModal,
  IlluminateEntryCard,
  BeaconCard,
} from '../components/features/illuminate';
import { useIlluminate } from '../hooks/useIlluminate';
import { useInsight } from '../hooks/useInsight';
import { useHaptics } from '../hooks/useHaptics';
import { useDialog } from '../contexts/DialogContext';
import { useUI } from '../contexts/UIContext';
import { LoadingSpinner } from '../components/ui';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';
import type { IlluminateEntry } from '../models';
import { cn } from '../utils/cn';

/**
 * Lighthouse Page - CBT-based anxiety reflection home
 * Replaces the old VaultPage with structured thought processing
 */
export const LighthousePage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { entries, recentEntries, loading, getAverageIntensity, getDistortionCounts } =
    useIlluminate();
  const {
    insight,
    loading: insightLoading,
    fetchInsight,
    markAsViewed,
    rateInsight,
  } = useInsight();
  const { push, pop } = useDialog();
  const { navbarBottom } = useUI();
  const { light } = useHaptics();

  // Calculate stats
  const avgIntensity = getAverageIntensity(7); // Last 7 days
  const distortionCounts = getDistortionCounts();
  const topDistortion = Object.entries(distortionCounts)
    .sort(([, a], [, b]) => b - a)
    .find(([, count]) => count > 0);

  const openIlluminate = () => {
    logAnalyticsEvent(AnalyticsEvent.ILLUMINATE_STARTED);
    push(<IlluminateModal onClose={() => pop()} />);
  };

  const handleEntryClick = (entry: IlluminateEntry) => {
    light();
    logAnalyticsEvent(AnalyticsEvent.ILLUMINATE_ENTRY_VIEWED, { entry_id: entry.id });
    navigate(`/lighthouse/${entry.id}`);
  };

  const goToHorizon = () => {
    logAnalyticsEvent(AnalyticsEvent.HORIZON_VIEWED);
    navigate('/horizon');
  };

  return (
    <div className="flex h-full flex-col bg-void-blue/75">
      {/* Header */}
      <header className="shrink-0 border-b border-glass-border bg-void-blue px-4 py-4 pt-safe sm:px-6">
        <h1 className="text-2xl font-light text-mist-white">
          {t('lighthouse.title', 'Lighthouse')}
        </h1>
        <p className="text-sm text-mist-white/60">
          {entries.length > 0
            ? t('lighthouse.subtitle', '{{count}} reflections', { count: entries.length })
            : t('lighthouse.subtitleEmpty', 'Illuminate your anxious thoughts')}
        </p>
      </header>

      {/* Scrollable Content */}
      <div
        className="flex flex-1 flex-col overflow-y-auto px-4 pt-6 sm:px-6"
        style={{ paddingBottom: `${Math.max(navbarBottom + 32, 96)}px` }}
      >
        {loading ? (
          <LoadingSpinner className="flex-1" />
        ) : entries.length === 0 ? (
          // Empty State
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="mb-6 rounded-full bg-biolum-cyan/10 p-6"
            >
              <Lightbulb size={48} className="text-biolum-cyan" />
            </motion.div>
            <p className="text-center text-xl font-light text-mist-white/60">
              {t('lighthouse.emptyTitle', 'Bring clarity to your thoughts')}
            </p>
            <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-mist-white/40">
              {t(
                'lighthouse.emptyDescription',
                'When anxiety hits, use Illuminate to process your thoughts and find balanced perspectives.'
              )}
            </p>

            {/* Start button */}
            <button
              onClick={openIlluminate}
              className="mt-8 rounded-2xl border border-biolum-cyan/30 bg-biolum-cyan/10 px-8 py-4 text-biolum-cyan shadow-glow-sm transition-all duration-300 ease-viscous active:scale-95"
            >
              <span className="text-lg">{t('lighthouse.startIlluminate', 'Start Illuminate')}</span>
            </button>
          </div>
        ) : (
          // Content with entries
          <div className="space-y-6">
            {/* Illuminate CTA */}
            <button
              onClick={openIlluminate}
              className="active:scale-98 flex w-full items-center justify-center gap-3 rounded-2xl border border-biolum-cyan/30 bg-biolum-cyan/10 px-6 py-4 text-lg font-medium text-biolum-cyan shadow-glow-sm transition-all duration-300 ease-viscous"
            >
              <Plus size={22} />
              <span>{t('lighthouse.newReflection', 'New Reflection')}</span>
            </button>

            {/* Stats Cards (if we have entries) */}
            {entries.length >= 3 && (
              <div className="grid grid-cols-2 gap-3">
                {/* Average intensity */}
                <div className="rounded-xl border border-glass-border bg-glass-bg p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs text-mist-white/50">
                    <TrendingUp size={14} />
                    <span>{t('lighthouse.stats.avgIntensity', '7-day avg')}</span>
                  </div>
                  <p
                    className={cn(
                      'text-2xl font-semibold',
                      avgIntensity <= 40
                        ? 'text-green-400'
                        : avgIntensity <= 60
                          ? 'text-yellow-400'
                          : 'text-orange-400'
                    )}
                  >
                    {avgIntensity}%
                  </p>
                </div>

                {/* Top distortion */}
                <button
                  onClick={goToHorizon}
                  className="rounded-xl border border-glass-border bg-glass-bg p-4 text-left transition-colors hover:bg-glass-bg-hover"
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-mist-white/50">
                    <PieChart size={14} />
                    <span>{t('lighthouse.stats.topPattern', 'Top pattern')}</span>
                  </div>
                  <p className="truncate text-lg font-medium text-biolum-cyan">
                    {topDistortion
                      ? t(
                          `illuminate.distortions.${topDistortion[0]}.name`,
                          topDistortion[0].replace('_', ' ')
                        )
                      : t('lighthouse.stats.noPatterns', 'None yet')}
                  </p>
                </button>
              </div>
            )}

            {/* View Horizon link */}
            {entries.length >= 5 && (
              <button
                onClick={goToHorizon}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-warm-ember/30 bg-warm-ember/10 px-4 py-3 text-sm text-warm-ember transition-colors hover:bg-warm-ember/20"
              >
                <TrendingUp size={16} />
                <span>{t('lighthouse.viewProgress', 'View Progress Dashboard')}</span>
              </button>
            )}

            {/* Weekly AI Insight (Beacon) */}
            {entries.length >= 3 && (
              <BeaconCard
                insight={insight}
                loading={insightLoading}
                onFetchInsight={fetchInsight}
                onMarkViewed={markAsViewed}
                onRate={rateInsight}
              />
            )}

            {/* Recent Entries */}
            <div>
              <h2 className="mb-3 text-sm font-medium text-mist-white/70">
                {t('lighthouse.recentReflections', 'Recent Reflections')}
              </h2>
              <div className="space-y-3">
                {recentEntries.slice(0, 10).map((entry) => (
                  <IlluminateEntryCard
                    key={entry.id}
                    entry={entry}
                    onClick={() => handleEntryClick(entry)}
                  />
                ))}
              </div>

              {/* View all link */}
              {entries.length > 10 && (
                <button
                  onClick={goToHorizon}
                  className="mt-4 w-full text-center text-sm text-biolum-cyan/70 hover:text-biolum-cyan"
                >
                  {t('lighthouse.viewAll', 'View all {{count}} reflections', {
                    count: entries.length,
                  })}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
