import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Activity, Cpu, Mic } from 'lucide-react';
import {
  useUsage,
  formatCost,
  formatTokenCount,
  formatSpeechMinutes,
  getPeriodDisplayName,
  getDaysRemaining,
} from '../../../hooks/useUsage';
import { useSettings } from '../../../hooks/useSettings';

/**
 * UsageCard Component
 * Displays current period usage statistics in a glass card
 * Shows AI costs, token usage, and voice minutes
 */
export const UsageCard: FC = () => {
  const { t } = useTranslation();
  const { summary, loading, error } = useUsage();
  const { settings } = useSettings();

  // Don't show if loading, error, or no data yet
  if (loading || error || !summary) {
    return null;
  }

  const { currentPeriod, lifetime } = summary;
  const daysRemaining = getDaysRemaining(currentPeriod.endDate);
  const periodName = getPeriodDisplayName(
    currentPeriod.startDate,
    settings.language === 'de-DE' ? 'de-DE' : 'en-US'
  );

  return (
    <motion.div
      className="mb-6 overflow-hidden rounded-3xl border border-glass-border bg-glass-bg shadow-glass backdrop-blur-glass"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist-white/5">
              <Activity size={20} className="text-biolum-cyan" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-mist-white">
                {t('profile.usage.title')}
              </h3>
              <p className="text-xs text-mist-white/50">{periodName}</p>
            </div>
          </div>

          {/* Cost Display */}
          <div className="text-right">
            <span className="text-xl font-bold text-biolum-cyan">
              {formatCost(currentPeriod.totalCostUsd)}
            </span>
            <p className="text-xs text-mist-white/40">{t('profile.usage.estimated')}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3">
          {/* AI Calls */}
          <div className="flex-1 rounded-xl bg-mist-white/5 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Cpu size={14} className="text-biolum-cyan/70" />
              <span className="text-xs text-mist-white/50">{t('profile.usage.aiCalls')}</span>
            </div>
            <span className="text-lg font-semibold text-mist-white">{currentPeriod.aiCalls}</span>
            <p className="text-xs text-mist-white/30">
              {formatTokenCount(currentPeriod.totalTokens)} {t('profile.usage.tokens')}
            </p>
          </div>

          {/* Voice Minutes */}
          <div className="flex-1 rounded-xl bg-mist-white/5 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Mic size={14} className="text-warm-ember/70" />
              <span className="text-xs text-mist-white/50">{t('profile.usage.voice')}</span>
            </div>
            <span className="text-lg font-semibold text-mist-white">
              {formatSpeechMinutes(currentPeriod.speechMinutes)}
            </span>
            <p className="text-xs text-mist-white/30">
              {t('profile.usage.daysRemaining', { count: daysRemaining })}
            </p>
          </div>
        </div>

        {/* Lifetime Stats (subtle) */}
        {lifetime.totalCostUsd > 0 && (
          <div className="mt-3 border-t border-glass-border pt-3">
            <p className="text-xs text-mist-white/40">
              {t('profile.usage.lifetime')}: {formatCost(lifetime.totalCostUsd)} ·{' '}
              {lifetime.aiCalls} {t('profile.usage.calls')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
