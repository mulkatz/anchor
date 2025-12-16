import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, Lightbulb } from 'lucide-react';
import type { WeeklyInsight } from '../../../models';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

interface BeaconCardProps {
  insight: WeeklyInsight | null;
  loading: boolean;
  onMarkViewed: () => Promise<void>;
}

/**
 * BeaconCard - Displays weekly AI-generated insight
 */
export const BeaconCard: FC<BeaconCardProps> = ({ insight, loading, onMarkViewed }) => {
  const { t } = useTranslation();
  const { light } = useHaptics();
  const [expanded, setExpanded] = useState(false);

  // Mark as viewed when expanded
  useEffect(() => {
    if (expanded && insight && !insight.viewed) {
      onMarkViewed();
    }
  }, [expanded, insight, onMarkViewed]);

  const handleToggle = () => {
    light();
    setExpanded((prev) => !prev);
  };

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-biolum-cyan/30 bg-biolum-cyan/5 p-4">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-biolum-cyan" />
          <span className="text-sm text-biolum-cyan/70">
            {t('beacon.loading', 'Generating your insight...')}
          </span>
        </div>
      </div>
    );
  }

  // No insight available (no entries this week)
  if (!insight) {
    return (
      <div className="rounded-xl border border-glass-border bg-glass-bg p-4">
        <div className="flex items-center gap-3">
          <Lightbulb size={20} className="text-mist-white/40" />
          <span className="text-sm text-mist-white/50">
            {t('beacon.noData', 'Complete some reflections to get weekly insights')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={cn(
        'overflow-hidden rounded-xl border shadow-glow-sm transition-colors',
        expanded
          ? 'border-biolum-cyan/50 bg-biolum-cyan/10'
          : 'border-biolum-cyan/30 bg-biolum-cyan/5'
      )}
    >
      {/* Header - always visible */}
      <button onClick={handleToggle} className="flex w-full items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Lightbulb size={20} className="text-biolum-cyan" />
            {!insight.viewed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-biolum-cyan"
              />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-biolum-cyan">
              {t('beacon.title', 'Weekly Insight')}
            </h3>
            <p className="text-xs text-mist-white/50">
              {t('beacon.basedOn', 'Based on {{count}} reflections', {
                count: insight.entryCount,
              })}
            </p>
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={20} className="text-biolum-cyan/70" />
        ) : (
          <ChevronDown size={20} className="text-biolum-cyan/70" />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-biolum-cyan/20 px-4 pb-4 pt-3">
              {/* Insight text */}
              <p className="mb-4 text-sm leading-relaxed text-mist-white">{insight.insightText}</p>

              {/* Recommendations */}
              {insight.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-biolum-cyan/70">
                    {t('beacon.recommendations', 'Recommendations')}
                  </h4>
                  <ul className="space-y-2">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-mist-white/80">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-biolum-cyan" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Identified triggers */}
              {insight.identifiedTriggers.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-biolum-cyan/70">
                    {t('beacon.triggers', 'Common Triggers')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.identifiedTriggers.map((trigger, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-biolum-cyan/20 px-2.5 py-1 text-xs text-biolum-cyan"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
