import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { DailyLog, WeatherType } from '../../../models';
import { useHaptics } from '../../../hooks/useHaptics';

interface ProgressReefProps {
  logs: DailyLog[];
  onOrbClick: (log: DailyLog) => void;
  className?: string;
}

// Weather color mapping (matches WeatherSelector colors)
const weatherColors: Record<WeatherType, string> = {
  stormy: '#9B7DFF', // Purple
  foggy: '#B0B0B0', // Gray
  clear: '#FFD93D', // Yellow
  sunny: '#FFB38A', // Warm ember
  turbulent: '#64FFDA', // Biolum cyan
};

// Simple hash function for deterministic positioning
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Calculate orb position using pseudo-random deterministic algorithm
const calculateOrbPosition = (
  log: DailyLog,
  index: number,
  totalLogs: number
): { x: number; y: number; size: number; opacity: number; color: string } => {
  // Deterministic positioning based on date hash
  const seed = hashCode(log.date);
  const angle = (seed % 360) * (Math.PI / 180);

  // Concentric rings (0-3 rings based on total logs)
  const ringCount = Math.min(3, Math.ceil(totalLogs / 10));
  const ringIndex = index % ringCount;
  const radius = 20 + ringIndex * 15; // 20%, 35%, 50% from center

  // Position as percentage of container
  const x = 50 + Math.cos(angle) * radius;
  const y = 50 + Math.sin(angle) * radius;

  // Calculate days since entry
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entryDate = new Date(log.date);
  const daysSince = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

  // Size: newer entries are larger (48px max, decreasing by 0.5px per day)
  const size = Math.max(32, 48 - daysSince * 0.5);

  // Opacity: brighter when closer to surface (higher mood_depth)
  const opacity = 0.4 + (log.mood_depth / 100) * 0.6;

  // Color based on weather
  const color = weatherColors[log.weather];

  return { x, y, size, opacity, color };
};

export const ProgressReef: FC<ProgressReefProps> = ({ logs, onOrbClick, className = '' }) => {
  const { t } = useTranslation();
  const { light } = useHaptics();

  // Limit to last 30 days and calculate positions
  const orbData = useMemo(() => {
    const recentLogs = logs.slice(0, 30);
    return recentLogs.map((log, index) => ({
      log,
      position: calculateOrbPosition(log, index, recentLogs.length),
    }));
  }, [logs]);

  const handleOrbClick = (log: DailyLog) => {
    light();
    onOrbClick(log);
  };

  if (orbData.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="mb-3 text-5xl">🪸</div>
        <p className="text-lg font-medium text-mist-white">{t('tideLog.reef.emptyTitle')}</p>
        <p className="mt-2 text-center text-sm text-mist-white/60">
          {t('tideLog.reef.emptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Title */}
      <h2 className="mb-6 text-xl font-semibold text-mist-white">{t('tideLog.reef.title')}</h2>

      {/* Reef Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-glass-border bg-glass-bg/30 backdrop-blur-glass">
        {/* Center anchor point (visual reference) */}
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-biolum-cyan/20" />

        {/* Orbs */}
        {orbData.map(({ log, position }, index) => (
          <motion.button
            key={log.id}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.size}px`,
              height: `${position.size}px`,
              backgroundColor: position.color,
              opacity: position.opacity,
              boxShadow: `0 0 ${position.size / 2}px ${position.color}`,
              transform: 'translate(-50%, -50%)', // Center the orb on its position
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: position.opacity }}
            transition={{
              duration: 0.6,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.2, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleOrbClick(log)}
            aria-label={t('tideLog.reef.orbLabel', {
              date: new Date(log.date).toLocaleDateString(),
              weather: t(`tideLog.weather.${log.weather}`),
            })}
          />
        ))}

        {/* Info text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-mist-white/40">
            {t('tideLog.reef.orbCount', { count: orbData.length })}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-center text-sm text-mist-white/60">{t('tideLog.reef.description')}</p>
    </div>
  );
};
