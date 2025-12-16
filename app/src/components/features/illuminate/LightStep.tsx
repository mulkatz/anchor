import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Edit3, Lightbulb } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

interface LightStepProps {
  aiSuggestedReframes: string[];
  selectedReframe: string;
  customReframe: boolean;
  onSelectReframe: (reframe: string, isCustom: boolean) => void;
}

/**
 * Step 4: The Light
 * Select or write a balanced reframe
 */
export const LightStep: FC<LightStepProps> = ({
  aiSuggestedReframes,
  selectedReframe,
  customReframe,
  onSelectReframe,
}) => {
  const { t } = useTranslation();
  const { light, medium } = useHaptics();
  const [showCustomInput, setShowCustomInput] = useState(customReframe);
  const [customText, setCustomText] = useState(customReframe ? selectedReframe : '');

  const handleSelectSuggestion = (reframe: string) => {
    medium();
    setShowCustomInput(false);
    onSelectReframe(reframe, false);
  };

  const handleCustomClick = () => {
    light();
    setShowCustomInput(true);
    if (customText) {
      onSelectReframe(customText, true);
    }
  };

  const handleCustomChange = (value: string) => {
    setCustomText(value);
    if (value.trim()) {
      onSelectReframe(value, true);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-mist-white">
          {t('illuminate.light.title', 'Find a balanced perspective')}
        </h3>
        <p className="mt-1 text-sm text-mist-white/60">
          {t('illuminate.light.description', 'Choose a reframe that feels true to you')}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {/* AI Suggestions */}
        {aiSuggestedReframes.map((reframe, index) => {
          const isSelected = !customReframe && selectedReframe === reframe;

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectSuggestion(reframe)}
              className={cn(
                'relative w-full rounded-xl border p-4 text-left transition-all',
                isSelected
                  ? 'border-biolum-cyan bg-biolum-cyan/10 shadow-glow-sm'
                  : 'border-glass-border bg-glass-bg hover:bg-glass-bg-hover'
              )}
            >
              {/* Suggestion badge */}
              <div className="mb-2 flex items-center gap-1.5">
                <Lightbulb size={14} className="text-biolum-cyan" />
                <span className="text-xs text-biolum-cyan">
                  {t('illuminate.light.suggestion', 'Suggestion')}
                </span>
              </div>

              <p className="text-sm text-mist-white">{reframe}</p>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 rounded-full bg-biolum-cyan p-1"
                >
                  <Check size={14} className="text-void-blue" />
                </motion.div>
              )}
            </motion.button>
          );
        })}

        {/* Custom reframe option */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: aiSuggestedReframes.length * 0.1 }}
          className={cn(
            'rounded-xl border p-4 transition-all',
            showCustomInput || customReframe
              ? 'border-warm-ember bg-warm-ember/10'
              : 'border-glass-border bg-glass-bg'
          )}
        >
          <button
            onClick={handleCustomClick}
            className="mb-2 flex w-full items-center gap-1.5 text-left"
          >
            <Edit3 size={14} className="text-warm-ember" />
            <span className="text-xs text-warm-ember">
              {t('illuminate.light.writeOwn', 'Write your own')}
            </span>
            {customReframe && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto rounded-full bg-warm-ember p-1"
              >
                <Check size={14} className="text-void-blue" />
              </motion.div>
            )}
          </button>

          {showCustomInput ? (
            <textarea
              value={customText}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder={t(
                'illuminate.light.customPlaceholder',
                'Write a balanced thought that feels true to you...'
              )}
              className="w-full resize-none rounded-lg border border-glass-border bg-void-blue/50 p-3 text-sm text-mist-white placeholder:text-mist-white/40 focus:border-warm-ember/50 focus:outline-none"
              rows={3}
              autoFocus
            />
          ) : (
            <p className="text-sm text-mist-white/50">
              {t('illuminate.light.customHint', 'Tap to write your own balanced perspective')}
            </p>
          )}
        </motion.div>
      </div>

      {/* Helpful tips */}
      <div className="mt-2 rounded-lg bg-glass-bg p-3">
        <p className="text-xs text-mist-white/50">
          {t(
            'illuminate.light.tips',
            '💡 A good reframe is realistic, acknowledges your feelings, and introduces a balanced perspective.'
          )}
        </p>
      </div>
    </div>
  );
};
