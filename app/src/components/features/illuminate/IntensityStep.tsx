import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useHaptics } from '../../../hooks/useHaptics';
import { cn } from '../../../utils/cn';

interface IntensityStepProps {
  emotionalIntensity: number;
  onIntensityChange: (value: number) => void;
}

/**
 * Step 4: The Intensity
 * Capture emotional intensity (0-100) - situation-agnostic
 */
export const IntensityStep: FC<IntensityStepProps> = ({
  emotionalIntensity,
  onIntensityChange,
}) => {
  const { t } = useTranslation();
  const { selectionChanged } = useHaptics();

  // Get intensity label based on value
  const getIntensityLabel = (value: number): string => {
    if (value <= 20) return t('illuminate.intensity.minimal', 'Minimal');
    if (value <= 40) return t('illuminate.intensity.mild', 'Mild');
    if (value <= 60) return t('illuminate.intensity.moderate', 'Moderate');
    if (value <= 80) return t('illuminate.intensity.strong', 'Strong');
    return t('illuminate.intensity.intense', 'Intense');
  };

  // Get color based on intensity
  const getIntensityColor = (value: number): string => {
    if (value <= 20) return 'text-green-400';
    if (value <= 40) return 'text-biolum-cyan';
    if (value <= 60) return 'text-yellow-400';
    if (value <= 80) return 'text-orange-400';
    return 'text-red-400';
  };

  // Get glow color based on intensity
  const getGlowStyle = (value: number): string => {
    if (value <= 20) return 'shadow-[0_0_20px_rgba(74,222,128,0.3)]';
    if (value <= 40) return 'shadow-[0_0_20px_rgba(100,255,218,0.3)]';
    if (value <= 60) return 'shadow-[0_0_20px_rgba(250,204,21,0.3)]';
    if (value <= 80) return 'shadow-[0_0_25px_rgba(251,146,60,0.4)]';
    return 'shadow-[0_0_30px_rgba(248,113,113,0.5)]';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    // Snap to 5-unit increments
    const snapped = Math.round(newValue / 5) * 5;
    selectionChanged();
    onIntensityChange(snapped);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
      <div className="text-center">
        <h3 className="text-xl font-medium text-mist-white">
          {t('illuminate.intensity.title', 'How intense is this feeling?')}
        </h3>
        <p className="mt-2 text-sm text-mist-white/60">
          {t('illuminate.intensity.description', 'Rate your current emotional intensity')}
        </p>
      </div>

      {/* Intensity display */}
      <motion.div
        key={emotionalIntensity}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <div
          className={cn(
            'flex h-28 w-28 items-center justify-center rounded-full border-2 border-current transition-all duration-300',
            getIntensityColor(emotionalIntensity),
            getGlowStyle(emotionalIntensity)
          )}
        >
          <span className="text-4xl font-bold">{emotionalIntensity}</span>
        </div>
        <span className={cn('text-lg font-medium', getIntensityColor(emotionalIntensity))}>
          {getIntensityLabel(emotionalIntensity)}
        </span>
      </motion.div>

      {/* Slider */}
      <div className="w-full max-w-xs px-4">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={emotionalIntensity}
          onChange={handleChange}
          className="w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-white [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-gradient-to-r [&::-moz-range-track]:from-green-400 [&::-moz-range-track]:via-yellow-400 [&::-moz-range-track]:to-red-400 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-green-400 [&::-webkit-slider-runnable-track]:via-yellow-400 [&::-webkit-slider-runnable-track]:to-red-400 [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="mt-2 flex justify-between text-xs text-mist-white/50">
          <span>{t('illuminate.intensity.low', 'Low')}</span>
          <span>{t('illuminate.intensity.high', 'High')}</span>
        </div>
      </div>

      {/* Helper tip */}
      <p className="text-center text-xs text-mist-white/50">
        {t(
          'illuminate.intensity.tip',
          'This helps track how strongly this situation is affecting you'
        )}
      </p>
    </div>
  );
};
