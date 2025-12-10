import { FC, useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHaptics } from '../../../hooks/useHaptics';
import { cn } from '../../../utils/cn';

interface DepthSliderProps {
  value: number; // 0-100
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Custom vertical slider for mood depth
 * 0 = Deep/Calm (bottom)
 * 100 = Surface/Anxious (top)
 */
export const DepthSlider: FC<DepthSliderProps> = ({ value, onChange, className }) => {
  const { t } = useTranslation();
  const { light } = useHaptics();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastHapticValue, setLastHapticValue] = useState<number>(value);

  // Height of the slider track
  const TRACK_HEIGHT = 400;

  // Snap to 5-unit increments
  const snapValue = (rawValue: number): number => {
    return Math.round(rawValue / 5) * 5;
  };

  // Calculate thumb position from value (0-100)
  const getThumbTop = useCallback(
    (val: number): number => {
      // Invert: 100 (surface) at top (0%), 0 (deep) at bottom (100%)
      return ((100 - val) / 100) * TRACK_HEIGHT;
    },
    [TRACK_HEIGHT]
  );

  // Calculate value from Y position
  const calculateValueFromY = useCallback(
    (clientY: number): number => {
      if (!trackRef.current) return value;

      const rect = trackRef.current.getBoundingClientRect();
      const y = clientY - rect.top;
      const clampedY = Math.max(0, Math.min(TRACK_HEIGHT, y));

      // Invert: top = 100, bottom = 0
      const rawValue = ((TRACK_HEIGHT - clampedY) / TRACK_HEIGHT) * 100;
      return Math.max(0, Math.min(100, snapValue(rawValue)));
    },
    [value, TRACK_HEIGHT]
  );

  // Handle value change with haptic feedback
  const handleValueChange = useCallback(
    (newValue: number) => {
      if (newValue !== value) {
        onChange(newValue);

        // Haptic feedback every 5 ticks (debounced)
        if (newValue % 5 === 0 && newValue !== lastHapticValue) {
          light();
          setLastHapticValue(newValue);
        }
      }
    },
    [value, onChange, light, lastHapticValue]
  );

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const newValue = calculateValueFromY(e.clientY);
    handleValueChange(newValue);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const newValue = calculateValueFromY(e.clientY);
      handleValueChange(newValue);
    },
    [isDragging, calculateValueFromY, handleValueChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const newValue = calculateValueFromY(e.touches[0].clientY);
    handleValueChange(newValue);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const newValue = calculateValueFromY(e.touches[0].clientY);
      handleValueChange(newValue);
    },
    [isDragging, calculateValueFromY, handleValueChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue = value;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      newValue = Math.min(100, value + 5);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      newValue = Math.max(0, value - 5);
    } else if (e.key === 'Home') {
      e.preventDefault();
      newValue = 100; // Surface
    } else if (e.key === 'End') {
      e.preventDefault();
      newValue = 0; // Deep
    }

    if (newValue !== value) {
      handleValueChange(newValue);
    }
  };

  // Global mouse/touch listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const thumbTop = getThumbTop(value);

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Top label */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-base font-medium text-mist-white">
          {t('tideLog.depth.surfaceLabel')}
        </span>
        <span className="text-xs text-mist-white/50">{t('tideLog.depth.surfaceDesc')}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative w-12 cursor-pointer rounded-full"
        style={{ height: `${TRACK_HEIGHT}px` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={t('tideLog.depth.title')}
        aria-valuetext={`${value}, ${value > 66 ? t('tideLog.depth.surface') : value < 34 ? t('tideLog.depth.deep') : t('tideLog.depth.anchored')}`}
        tabIndex={0}
      >
        {/* Continuous gradient track (cyan at top → deep blue at bottom) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-biolum-cyan via-[#3d8fb5] to-void-blue opacity-80" />

        {/* Subtle tick marks */}
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {[100, 75, 50, 25, 0].map((tick) => (
            <div
              key={tick}
              className={cn(
                'h-[1px] w-full',
                tick === 50 ? 'bg-mist-white/30' : 'bg-mist-white/10'
              )}
            />
          ))}
        </div>

        {/* Glowing orb thumb */}
        <div
          className={cn(
            'absolute left-1/2 -translate-x-1/2 -translate-y-1/2',
            'h-12 w-12 rounded-full transition-all duration-150',
            'border-2 border-biolum-cyan/50 bg-biolum-cyan',
            'shadow-[0_0_20px_rgba(100,255,218,0.6),0_0_40px_rgba(100,255,218,0.3)]',
            isDragging ? 'shadow-glow-strong scale-110' : 'scale-100',
            'cursor-grab active:cursor-grabbing'
          )}
          style={{
            top: `${thumbTop}px`,
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-1 rounded-full bg-biolum-cyan/40" />
        </div>

        {/* Current value indicator */}
        <div
          className="absolute right-full mr-4 -translate-y-1/2 rounded-lg bg-biolum-cyan/20 px-2 py-1 text-xs font-medium text-biolum-cyan backdrop-blur-sm"
          style={{ top: `${thumbTop}px` }}
        >
          {value}
        </div>
      </div>

      {/* Bottom label */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-base font-medium text-mist-white">
          {t('tideLog.depth.deepLabel')}
        </span>
        <span className="text-xs text-mist-white/50">{t('tideLog.depth.deepDesc')}</span>
      </div>
    </div>
  );
};
