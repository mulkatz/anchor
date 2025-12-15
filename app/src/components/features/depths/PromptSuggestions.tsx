import { type FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, X } from 'lucide-react';

import { getRandomPrompts, type JournalingPrompt } from '../../../data/journaling-prompts';
import { useHaptics } from '../../../hooks/useHaptics';
import { cn } from '../../../utils/cn';

interface PromptSuggestionsProps {
  onSelectPrompt: (text: string) => void;
  visible: boolean;
  onDismiss: () => void;
}

/**
 * PromptSuggestions - Therapeutic journaling prompts for Depths (Soundings)
 * Shows 3 random CBT-based prompts to help guide reflection
 */
export const PromptSuggestions: FC<PromptSuggestionsProps> = ({
  onSelectPrompt,
  visible,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { light } = useHaptics();
  const [prompts, setPrompts] = useState<JournalingPrompt[]>(() => getRandomPrompts(3));

  const handleSelectPrompt = useCallback(
    (prompt: JournalingPrompt) => {
      light();
      const text = t(prompt.textKey, prompt.fallbackText);
      onSelectPrompt(text);
    },
    [light, onSelectPrompt, t]
  );

  const handleShuffle = useCallback(() => {
    light();
    setPrompts(getRandomPrompts(3));
  }, [light]);

  const handleDismiss = useCallback(() => {
    light();
    onDismiss();
  }, [light, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 rounded-xl border border-biolum-cyan/20 bg-biolum-cyan/5 p-4"
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-biolum-cyan" />
              <span className="text-xs font-medium text-biolum-cyan/80">
                {t('soundings.title', 'Need inspiration?')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="rounded-full p-1.5 text-mist-white/50 transition-colors hover:bg-biolum-cyan/10 hover:text-biolum-cyan"
                aria-label={t('soundings.shuffle', 'Get new prompts')}
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-full p-1.5 text-mist-white/50 transition-colors hover:bg-mist-white/10 hover:text-mist-white"
                aria-label={t('soundings.dismiss', 'Dismiss prompts')}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Prompts */}
          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <motion.button
                key={prompt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
                onClick={() => handleSelectPrompt(prompt)}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-left text-sm',
                  'border border-glass-border bg-glass-bg',
                  'text-mist-white/80 transition-all duration-200',
                  'hover:border-biolum-cyan/30 hover:bg-biolum-cyan/10 hover:text-mist-white',
                  'active:scale-[0.98]'
                )}
              >
                {t(prompt.textKey, prompt.fallbackText)}
              </motion.button>
            ))}
          </div>

          {/* Helper text */}
          <p className="mt-3 text-center text-xs text-mist-white/40">
            {t('soundings.helperText', 'Tap a prompt to start writing')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
