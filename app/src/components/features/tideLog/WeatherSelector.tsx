import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudRain, CloudFog, Sun, Sparkles, Wind } from 'lucide-react';
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
    type: 'turbulent',
    icon: Wind,
    color: 'text-biolum-cyan',
    glowColor: 'shadow-glow-md',
  },
];

/**
 * Weather selector with 5 atmospheric icons
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
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Weather grid */}
      <div className="grid grid-cols-3 gap-4">
        {weatherOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.type;
          const hasRipple = ripples.some((r) => r.type === option.type);

          return (
            <motion.button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 rounded-2xl p-6 transition-all duration-300',
                'border backdrop-blur-glass',
                isSelected
                  ? `border-current ${option.color} ${option.glowColor} scale-110`
                  : 'border-glass-border bg-glass-bg hover:bg-glass-bg-hover'
              )}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              aria-label={`${t(`tideLog.weather.${option.type}`)} - ${t(`tideLog.weather.${option.type}_desc`)}`}
              aria-pressed={isSelected}
            >
              {/* Icon */}
              <Icon
                size={48}
                className={cn(
                  'transition-all duration-300',
                  isSelected ? option.color : 'text-mist-white/70'
                )}
              />

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  isSelected ? option.color : 'text-mist-white/70'
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
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Description */}
      {value && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-sm text-mist-white/70"
        >
          {t(`tideLog.weather.${value}_desc`)}
        </motion.p>
      )}
    </div>
  );
};
