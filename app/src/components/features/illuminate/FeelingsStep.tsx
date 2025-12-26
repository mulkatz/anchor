import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { EmotionType } from '../../../models';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

interface FeelingsStepProps {
  primaryEmotions: EmotionType[];
  onEmotionsChange: (emotions: EmotionType[]) => void;
}

/**
 * Expanded emotion options - covering all spectrums, not just anxiety
 */
const EMOTION_OPTIONS: { type: EmotionType; emoji: string }[] = [
  // Anxiety/Fear spectrum
  { type: 'anxious', emoji: '😰' },
  { type: 'worried', emoji: '😟' },
  { type: 'nervous', emoji: '😬' },
  { type: 'panicked', emoji: '😱' },

  // Stress spectrum
  { type: 'stressed', emoji: '😓' },
  { type: 'overwhelmed', emoji: '😫' },
  { type: 'exhausted', emoji: '😩' },

  // Sadness spectrum
  { type: 'sad', emoji: '😢' },
  { type: 'hopeless', emoji: '😞' },
  { type: 'lonely', emoji: '🥺' },

  // Anger spectrum
  { type: 'angry', emoji: '😠' },
  { type: 'frustrated', emoji: '😤' },
  { type: 'irritated', emoji: '😒' },

  // Shame spectrum
  { type: 'ashamed', emoji: '😳' },
  { type: 'guilty', emoji: '😔' },
  { type: 'embarrassed', emoji: '🙈' },

  // Other
  { type: 'restless', emoji: '😖' },
  { type: 'numb', emoji: '😶' },
];

/**
 * Step 3: The Feelings
 * Spacious emotion selection grid
 */
export const FeelingsStep: FC<FeelingsStepProps> = ({ primaryEmotions, onEmotionsChange }) => {
  const { t } = useTranslation();
  const { light } = useHaptics();

  const toggleEmotion = (emotion: EmotionType) => {
    light();
    if (primaryEmotions.includes(emotion)) {
      onEmotionsChange(primaryEmotions.filter((e) => e !== emotion));
    } else {
      // Max 5 emotions
      if (primaryEmotions.length < 5) {
        onEmotionsChange([...primaryEmotions, emotion]);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center px-2 py-2">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="mb-4 text-center">
          <h3 className="text-xl font-medium text-mist-white">
            {t('illuminate.feelings.title', 'How are you feeling?')}
          </h3>
          <p className="mt-2 text-sm text-mist-white/60">
            {t('illuminate.feelings.description', 'Select the emotions that resonate')}
          </p>
        </div>

        {/* Selection count indicator */}
        <div className="mb-4 flex justify-center">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  index < primaryEmotions.length
                    ? 'bg-biolum-cyan shadow-glow-sm'
                    : 'bg-glass-border'
                )}
              />
            ))}
            <span className="ml-2 text-xs text-mist-white/50">
              {primaryEmotions.length}/5 {t('illuminate.feelings.selected', 'selected')}
            </span>
          </div>
        </div>

        {/* Emotion grid - 3 columns for spacious layout */}
        <div className="grid grid-cols-3 gap-2.5">
          {EMOTION_OPTIONS.map(({ type, emoji }, index) => {
            const isSelected = primaryEmotions.includes(type);
            return (
              <motion.button
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleEmotion(type)}
                disabled={!isSelected && primaryEmotions.length >= 5}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-2 py-3 transition-all duration-200',
                  isSelected
                    ? 'border-2 border-biolum-cyan bg-biolum-cyan/15 shadow-glow-sm'
                    : 'border border-glass-border bg-glass-bg',
                  !isSelected && primaryEmotions.length >= 5
                    ? 'opacity-40'
                    : 'hover:border-biolum-cyan/30 hover:bg-glass-bg-hover active:scale-95'
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isSelected ? 'text-biolum-cyan' : 'text-mist-white/70'
                  )}
                >
                  {t(`illuminate.emotions.${type}`, type.charAt(0).toUpperCase() + type.slice(1))}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Helper tip */}
        <p className="mt-4 pb-2 text-center text-xs text-mist-white/50">
          {t(
            'illuminate.feelings.tip',
            'You can select up to 5 emotions that best describe how you feel'
          )}
        </p>
      </div>
    </div>
  );
};
