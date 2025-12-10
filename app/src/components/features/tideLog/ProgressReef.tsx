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

  // Size variation: 12-24px with random offset for organic feel
  const baseSize = Math.max(12, 24 - daysSince * 0.3);
  const sizeVariation = (seed % 8) - 4; // -4 to +4px variation
  const size = Math.max(12, Math.min(24, baseSize + sizeVariation));

  // Opacity: brighter when closer to surface (higher mood_depth)
  const opacity = 0.5 + (log.mood_depth / 100) * 0.5;

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
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="mb-4 text-6xl">🪸</div>
        <p className="text-xl font-light text-mist-white">{t('tideLog.reef.emptyTitle')}</p>
        <p className="mt-3 text-center text-sm text-mist-white/50">
          {t('tideLog.reef.emptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Title */}
      <h2 className="mb-6 text-2xl font-light text-white">{t('tideLog.reef.title')}</h2>

      {/* Reef Container - floating in void, no grey box */}
      <div className="relative h-80 w-full overflow-visible">
        {/* Center anchor point (visual reference) */}
        <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-biolum-cyan/10" />

        {/* Pulsing orbs with mandatory glows */}
        {orbData.map(({ log, position }, index) => (
          <motion.button
            key={log.id}
            className="absolute cursor-pointer rounded-full will-change-transform"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.size}px`,
              height: `${position.size}px`,
              backgroundColor: position.color,
              // MANDATORY GLOW: layered boxShadow for bioluminescent effect
              boxShadow: `0 0 ${position.size * 0.5}px ${position.color}, 0 0 ${position.size}px ${position.color}40, 0 0 ${position.size * 1.5}px ${position.color}20`,
              transform: 'translate(-50%, -50%)', // Center the orb on its position
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [position.opacity, position.opacity * 1.2, position.opacity],
            }}
            transition={{
              duration: 4,
              delay: index * 0.05,
              repeat: Infinity,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            whileHover={{ scale: 1.3, opacity: 1 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleOrbClick(log)}
            aria-label={t('tideLog.reef.orbLabel', {
              date: new Date(log.date).toLocaleDateString(),
              weather: t(`tideLog.weather.${log.weather}`),
            })}
          />
        ))}

        {/* Info text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-mist-white/30">
            {t('tideLog.reef.orbCount', { count: orbData.length })}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-6 text-center text-sm text-mist-white/50">{t('tideLog.reef.description')}</p>
    </div>
  );
};
