import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudRain, CloudFog, Sun, Sparkles, Wind } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import type { DailyLog, WeatherType } from '../../../models';
import { getRelativeTime } from '../../../utils/time';
import { useHaptics } from '../../../hooks/useHaptics';
import { cn } from '../../../utils/cn';

interface LogCardProps {
  log: DailyLog;
  onClick: () => void;
  index?: number;
}

const weatherIcons: Record<WeatherType, typeof CloudRain> = {
  stormy: CloudRain,
  foggy: CloudFog,
  clear: Sun,
  sunny: Sparkles,
  turbulent: Wind,
};

const weatherColors: Record<WeatherType, string> = {
  stormy: 'text-[#9B7DFF]',
  foggy: 'text-[#B0B0B0]',
  clear: 'text-[#FFD93D]',
  sunny: 'text-warm-ember',
  turbulent: 'text-biolum-cyan',
};

/**
 * Single log entry card for the timeline stream
 * Shows date, weather, mood depth, and note preview
 */
export const LogCard: FC<LogCardProps> = ({ log, onClick, index = 0 }) => {
  const { t } = useTranslation();
  const { light } = useHaptics();

  const Icon = weatherIcons[log.weather];
  const iconColor = weatherColors[log.weather];

  const handleClick = () => {
    light();
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full rounded-2xl border border-glass-border bg-glass-bg p-4 text-left backdrop-blur-glass transition-all',
        'hover:border-biolum-cyan/50 hover:bg-glass-bg-hover'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Weather icon */}
        <div className="flex-shrink-0">
          <Icon size={32} className={iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Date and time */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-mist-white">
              {format(log.createdAt, 'MMM d, yyyy')}
            </span>
            <span className="text-xs text-mist-white/50">{getRelativeTime(log.createdAt, t)}</span>
          </div>

          {/* Mood depth bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-mist-white/60">
              <span>
                {log.mood_depth > 66
                  ? t('tideLog.depth.surface')
                  : log.mood_depth < 34
                    ? t('tideLog.depth.deep')
                    : t('tideLog.depth.anchored')}
              </span>
              <span>{log.mood_depth}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-mist-white/10">
              <div
                className="h-full bg-biolum-cyan transition-all duration-300"
                style={{ width: `${log.mood_depth}%` }}
              />
            </div>
          </div>

          {/* Note preview or "Released" label */}
          {log.is_released ? (
            <div className="relative">
              <p className="line-clamp-2 select-none text-sm text-mist-white/70 blur-sm">
                {log.note_text || t('tideLog.stream.noNote')}
              </p>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-warm-ember">
                {t('tideLog.stream.dissolved')}
              </span>
            </div>
          ) : (
            <p className="line-clamp-2 text-sm text-mist-white/70">
              {log.note_text || t('tideLog.stream.noNote')}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
};
