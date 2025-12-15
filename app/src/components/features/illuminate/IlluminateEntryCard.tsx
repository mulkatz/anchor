import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronRight, Calendar } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import type { IlluminateEntry } from '../../../models';
import { DISTORTION_INFO } from '../../../services/illuminate.service';
import { cn } from '../../../utils/cn';

interface IlluminateEntryCardProps {
  entry: IlluminateEntry;
  onClick: () => void;
}

/**
 * Card displaying an Illuminate entry in the list
 */
export const IlluminateEntryCard: FC<IlluminateEntryCardProps> = ({ entry, onClick }) => {
  const { t } = useTranslation();

  // Format the date nicely
  const formatDate = (date: Date) => {
    if (isToday(date)) return t('common.today', 'Today');
    if (isYesterday(date)) return t('common.yesterday', 'Yesterday');
    return format(date, 'MMM d');
  };

  // Get intensity color
  const getIntensityColor = (value: number): string => {
    if (value <= 20) return 'bg-green-400';
    if (value <= 40) return 'bg-biolum-cyan';
    if (value <= 60) return 'bg-yellow-400';
    if (value <= 80) return 'bg-orange-400';
    return 'bg-red-400';
  };

  // Get top distortions (max 2)
  const topDistortions = entry.userConfirmedDistortions.slice(0, 2);

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-xl border border-glass-border bg-glass-bg p-4 text-left transition-all hover:bg-glass-bg-hover"
    >
      {/* Header with date and intensity */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-mist-white/60">
          <Calendar size={14} />
          <span>{formatDate(entry.createdAt)}</span>
          <span className="text-mist-white/30">•</span>
          <span>{format(entry.createdAt, 'h:mm a')}</span>
        </div>

        {/* Intensity indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cn('h-2 w-2 rounded-full', getIntensityColor(entry.emotionalIntensity))}
          />
          <span className="text-xs text-mist-white/50">{entry.emotionalIntensity}%</span>
        </div>
      </div>

      {/* Situation preview */}
      <p className="mb-2 line-clamp-2 text-sm text-mist-white">{entry.situation}</p>

      {/* Bottom row: distortions and arrow */}
      <div className="flex items-center justify-between">
        {/* Distortion chips */}
        <div className="flex flex-wrap gap-1.5">
          {topDistortions.map((type) => {
            const info = DISTORTION_INFO[type];
            return (
              <span
                key={type}
                className="flex items-center gap-1 rounded-full bg-biolum-cyan/10 px-2 py-0.5 text-xs text-biolum-cyan"
              >
                <span>{info?.emoji || '💭'}</span>
                <span>{t(`illuminate.distortions.${type}.name`, info?.name || type)}</span>
              </span>
            );
          })}
          {entry.userConfirmedDistortions.length > 2 && (
            <span className="rounded-full bg-mist-white/10 px-2 py-0.5 text-xs text-mist-white/50">
              +{entry.userConfirmedDistortions.length - 2}
            </span>
          )}
          {entry.userConfirmedDistortions.length === 0 && (
            <span className="text-xs text-mist-white/40">
              {t('illuminate.noDistortions', 'No patterns identified')}
            </span>
          )}
        </div>

        <ChevronRight size={18} className="text-mist-white/30" />
      </div>
    </motion.button>
  );
};
