import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, Loader2, Lightbulb } from 'lucide-react';
import type { WeeklyInsight } from '../../../models';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

interface BeaconCardProps {
  insight: WeeklyInsight | null;
  loading: boolean;
  onFetchInsight: () => Promise<void>;
  onMarkViewed: () => Promise<void>;
  onRate: (rating: number) => Promise<void>;
}

/**
 * BeaconCard - Displays weekly AI-generated insight
 */
export const BeaconCard: FC<BeaconCardProps> = ({
  insight,
  loading,
  onFetchInsight,
  onMarkViewed,
  onRate,
}) => {
  const { t } = useTranslation();
  const { light, medium } = useHaptics();
  const [expanded, setExpanded] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(
    insight?.helpfulnessRating || null
  );

  // Fetch insight on mount if not already loaded
  useEffect(() => {
    if (!insight && !loading) {
      onFetchInsight();
    }
  }, [insight, loading, onFetchInsight]);

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

  const handleRate = async (rating: number) => {
    medium();
    setSelectedRating(rating);
    await onRate(rating);
  };

  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-warm-ember/30 bg-warm-ember/5 p-4">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-warm-ember" />
          <span className="text-sm text-warm-ember/70">
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
        'overflow-hidden rounded-xl border transition-colors',
        expanded ? 'border-warm-ember/50 bg-warm-ember/10' : 'border-warm-ember/30 bg-warm-ember/5'
      )}
    >
      {/* Header - always visible */}
      <button onClick={handleToggle} className="flex w-full items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Lightbulb size={20} className="text-warm-ember" />
            {!insight.viewed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-warm-ember"
              />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-warm-ember">
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
          <ChevronUp size={20} className="text-warm-ember/70" />
        ) : (
          <ChevronDown size={20} className="text-warm-ember/70" />
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
            <div className="border-t border-warm-ember/20 px-4 pb-4 pt-3">
              {/* Insight text */}
              <p className="mb-4 text-sm leading-relaxed text-mist-white">{insight.insightText}</p>

              {/* Recommendations */}
              {insight.recommendations.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-warm-ember/70">
                    {t('beacon.recommendations', 'Recommendations')}
                  </h4>
                  <ul className="space-y-2">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-mist-white/80">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warm-ember" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Identified triggers */}
              {insight.identifiedTriggers.length > 0 && (
                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-warm-ember/70">
                    {t('beacon.triggers', 'Common Triggers')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.identifiedTriggers.map((trigger, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-warm-ember/20 px-2.5 py-1 text-xs text-warm-ember"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="border-t border-warm-ember/20 pt-3">
                <p className="mb-2 text-xs text-mist-white/50">
                  {t('beacon.helpful', 'Was this helpful?')}
                </p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRate(rating)}
                      className={cn(
                        'rounded-full p-1.5 transition-all',
                        selectedRating && rating <= selectedRating
                          ? 'text-warm-ember'
                          : 'text-mist-white/30 hover:text-warm-ember/50'
                      )}
                    >
                      <Star
                        size={18}
                        fill={selectedRating && rating <= selectedRating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
