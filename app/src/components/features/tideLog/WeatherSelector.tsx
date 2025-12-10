import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudRain, CloudFog, Sun, Sparkles, Wind, Anchor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../../hooks/useHaptics';
import type { WeatherType } from '../../../models';
import { cn } from '../../../utils/cn';

interface WeatherSelectorProps {
  value: WeatherType | null;
  onChange: (weather: WeatherType) => void;
  className?: string;
}

interface WeatherOption {
  type: WeatherType;
  icon: typeof CloudRain;
  color: string;
  glowColor: string;
}

// Weather options ordered from challenging to positive states
const weatherOptions: WeatherOption[] = [
  {
    type: 'stormy',
    icon: CloudRain,
    color: 'text-[#9B7DFF]',
    glowColor: 'shadow-[0_0_20px_rgba(155,125,255,0.4)]',
  },
  {
    type: 'foggy',
    icon: CloudFog,
    color: 'text-[#B0B0B0]',
    glowColor: 'shadow-[0_0_20px_rgba(176,176,176,0.4)]',
  },
  {
    type: 'turbulent',
    icon: Wind,
    color: 'text-biolum-cyan',
    glowColor: 'shadow-glow-md',
  },
  {
    type: 'clear',
    icon: Sun,
    color: 'text-[#FFD93D]',
    glowColor: 'shadow-[0_0_20px_rgba(255,217,61,0.4)]',
  },
  {
    type: 'sunny',
    icon: Sparkles,
    color: 'text-warm-ember',
    glowColor: 'shadow-glow-md',
  },
  {
    type: 'calm',
    icon: Anchor,
    color: 'text-[#7DD3FC]',
    glowColor: 'shadow-[0_0_20px_rgba(125,211,252,0.4)]',
  },
];

/**
 * Weather selector with 6 atmospheric icons in a 2x3 grid
 * Each icon has a unique color and glow effect
 */
export const WeatherSelector: FC<WeatherSelectorProps> = ({ value, onChange, className }) => {
  const { t } = useTranslation();
  const { light } = useHaptics();
  const [ripples, setRipples] = useState<Array<{ id: number; type: WeatherType }>>([]);

  const handleSelect = (weather: WeatherType) => {
    light();
    onChange(weather);

    // Create ripple effect
    const rippleId = Date.now();
    setRipples((prev) => [...prev, { id: rippleId, type: weather }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 600);
  };

  return (
    <div className={cn('flex flex-col gap-3 sm:gap-6', className)}>
      {/* Weather grid - 2 columns for balanced layout */}
      <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2 sm:gap-4">
        {weatherOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.type;
          const hasRipple = ripples.some((r) => r.type === option.type);

          return (
            <motion.button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={cn(
                'duration-400 relative flex flex-col items-center justify-center gap-1 rounded-2xl p-3 transition-all sm:gap-2 sm:p-6',
                'border border-white/10 backdrop-blur-glass',
                isSelected
                  ? `scale-105 bg-white/10 ${option.glowColor}`
                  : 'hover:bg-white/8 bg-white/5 hover:scale-[1.02]'
              )}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
              aria-label={`${t(`tideLog.weather.${option.type}`)} - ${t(`tideLog.weather.${option.type}_desc`)}`}
              aria-pressed={isSelected}
            >
              {/* Icon - responsive size */}
              <Icon
                className={cn(
                  'duration-400 h-8 w-8 transition-all sm:h-12 sm:w-12',
                  isSelected ? option.color : 'text-mist-white/60'
                )}
                strokeWidth={2.5}
              />

              {/* Label */}
              <span
                className={cn(
                  'duration-400 text-xs font-medium transition-colors',
                  isSelected ? option.color : 'text-mist-white/60'
                )}
              >
                {t(`tideLog.weather.${option.type}`)}
              </span>

              {/* Ripple effect */}
              {hasRipple && (
                <motion.div
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-2xl border-2',
                    option.color.replace('text-', 'border-')
                  )}
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Description - always reserve space to prevent layout shift */}
      <p className="h-5 text-center text-sm text-mist-white/70">
        {value ? t(`tideLog.weather.${value}_desc`) : '\u00A0'}
      </p>
    </div>
  );
};
