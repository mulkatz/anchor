import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudRain, CloudFog, Sun, Sparkles, Wind, Anchor } from 'lucide-react';
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
  turbulent: Wind,
  clear: Sun,
  sunny: Sparkles,
  calm: Anchor,
};

const weatherColors: Record<WeatherType, string> = {
  stormy: '#9B7DFF',
  foggy: '#B0B0B0',
  turbulent: '#64FFDA',
  clear: '#FFD93D',
  sunny: '#FFB38A',
  calm: '#7DD3FC',
};

/**
 * Single log entry card for the timeline stream
 * Shows date, weather, mood depth, and note preview
 */
export const LogCard: FC<LogCardProps> = ({ log, onClick, index = 0 }) => {
  const { t } = useTranslation();
  const { light } = useHaptics();

  const Icon = weatherIcons[log.weather];
  const weatherColor = weatherColors[log.weather];

  const handleClick = () => {
    light();
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full rounded-3xl border border-white/10 bg-black/20 p-5 text-left backdrop-blur-md transition-all duration-300',
        'hover:border-biolum-cyan/40 hover:bg-black/30 hover:shadow-[0_0_20px_rgba(100,255,218,0.1)]'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Weather icon with glow */}
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${weatherColor}20`,
            boxShadow: `0 0 12px ${weatherColor}40`,
          }}
        >
          <Icon size={28} color={weatherColor} strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Date and time */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-mist-white">
              {format(log.createdAt, 'MMM d, yyyy')}
            </span>
            <span className="text-xs text-mist-white/50">{getRelativeTime(log.createdAt, t)}</span>
          </div>

          {/* Horizontal depth bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-mist-white/60">
              <span>
                {log.mood_depth > 66
                  ? t('tideLog.depth.surface')
                  : log.mood_depth < 34
                    ? t('tideLog.depth.deep')
                    : t('tideLog.depth.anchored')}
              </span>
              <span className="font-medium text-mist-white/80">{log.mood_depth}</span>
            </div>
            {/* Gradient track matching DepthSlider aesthetic */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-void-blue via-[#3d8fb5] to-biolum-cyan opacity-60">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-biolum-cyan/40 backdrop-blur-sm transition-all duration-300"
                style={{ width: `${log.mood_depth}%` }}
              />
            </div>
          </div>

          {/* Note preview or "Released" label */}
          {log.is_released ? (
            <div className="relative">
              <p className="line-clamp-2 select-none text-sm text-mist-white/60 blur-sm">
                {log.note_text || t('tideLog.stream.noNote')}
              </p>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-warm-ember drop-shadow-glow">
                {t('tideLog.stream.dissolved')}
              </span>
            </div>
          ) : (
            <p className="line-clamp-2 text-sm text-mist-white">
              {log.note_text || t('tideLog.stream.noNote')}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
};
