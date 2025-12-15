import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb, Loader2 } from 'lucide-react';
import type { DetectedDistortion, CognitiveDistortion } from '../../../models';
import { DISTORTION_INFO } from '../../../services/illuminate.service';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

interface PatternStepProps {
  isLoading: boolean;
  error: string | null;
  aiDetectedDistortions: DetectedDistortion[];
  userConfirmedDistortions: CognitiveDistortion[];
  userDismissedDistortions: CognitiveDistortion[];
  onConfirm: (type: CognitiveDistortion) => void;
  onDismiss: (type: CognitiveDistortion) => void;
}

/**
 * Step 3: The Pattern
 * Display AI-detected cognitive distortions and let user confirm/dismiss
 */
export const PatternStep: FC<PatternStepProps> = ({
  isLoading,
  error,
  aiDetectedDistortions,
  userConfirmedDistortions,
  userDismissedDistortions,
  onConfirm,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const { light, medium } = useHaptics();

  const handleConfirm = (type: CognitiveDistortion) => {
    medium();
    onConfirm(type);
  };

  const handleDismiss = (type: CognitiveDistortion) => {
    light();
    onDismiss(type);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={48} className="text-biolum-cyan" />
        </motion.div>
        <p className="text-center text-mist-white/70">
          {t('illuminate.pattern.analyzing', 'Analyzing your thoughts...')}
        </p>
        <p className="text-center text-sm text-mist-white/50">
          {t('illuminate.pattern.analyzingHint', 'Looking for thinking patterns')}
        </p>
      </div>
    );
  }

  // Error state (but still allow proceeding)
  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-warm-ember/20 p-4">
          <Lightbulb size={32} className="text-warm-ember" />
        </div>
        <p className="text-center text-mist-white">
          {t('illuminate.pattern.errorTitle', "Couldn't analyze patterns")}
        </p>
        <p className="text-center text-sm text-mist-white/60">
          {t(
            'illuminate.pattern.errorHint',
            "That's okay - you can still continue and write your own reframe"
          )}
        </p>
      </div>
    );
  }

  // No distortions detected
  if (aiDetectedDistortions.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="rounded-full bg-biolum-cyan/20 p-4"
        >
          <Check size={32} className="text-biolum-cyan" />
        </motion.div>
        <p className="text-center text-mist-white">
          {t('illuminate.pattern.noneFound', 'No obvious thinking patterns detected')}
        </p>
        <p className="text-center text-sm text-mist-white/60">
          {t(
            'illuminate.pattern.noneFoundHint',
            'Your thoughts seem balanced. You can still explore reframes.'
          )}
        </p>
      </div>
    );
  }

  // Show detected distortions
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-mist-white">
          {t('illuminate.pattern.title', 'Thinking patterns detected')}
        </h3>
        <p className="mt-1 text-sm text-mist-white/60">
          {t('illuminate.pattern.description', 'Do these resonate with you?')}
        </p>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {aiDetectedDistortions.map((distortion, index) => {
            const info = DISTORTION_INFO[distortion.type];
            const isConfirmed = userConfirmedDistortions.includes(distortion.type);
            const isDismissed = userDismissedDistortions.includes(distortion.type);

            return (
              <motion.div
                key={distortion.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isDismissed ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  isConfirmed
                    ? 'border-biolum-cyan/50 bg-biolum-cyan/10'
                    : isDismissed
                      ? 'border-glass-border/50 bg-glass-bg/50'
                      : 'border-glass-border bg-glass-bg'
                )}
              >
                {/* Header with name and actions */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info?.emoji || '💭'}</span>
                    <div>
                      <h4 className="font-medium text-mist-white">
                        {t(
                          `illuminate.distortions.${distortion.type}.name`,
                          info?.name || distortion.type
                        )}
                      </h4>
                      <p className="text-xs text-mist-white/50">
                        {t(
                          `illuminate.distortions.${distortion.type}.description`,
                          info?.description || ''
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Confirm/Dismiss buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleConfirm(distortion.type)}
                      className={cn(
                        'rounded-full p-1.5 transition-all',
                        isConfirmed
                          ? 'bg-biolum-cyan text-void-blue'
                          : 'bg-glass-bg text-mist-white/50 hover:bg-biolum-cyan/20 hover:text-biolum-cyan'
                      )}
                      title={t('illuminate.pattern.confirm', 'Yes, this resonates')}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleDismiss(distortion.type)}
                      className={cn(
                        'rounded-full p-1.5 transition-all',
                        isDismissed
                          ? 'bg-mist-white/20 text-mist-white'
                          : 'bg-glass-bg text-mist-white/50 hover:bg-mist-white/10 hover:text-mist-white'
                      )}
                      title={t('illuminate.pattern.dismiss', "No, doesn't fit")}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* AI explanation */}
                <p className="text-sm text-mist-white/70">{distortion.explanation}</p>

                {/* Highlighted text */}
                {distortion.highlightedText && (
                  <div className="mt-2 rounded-lg bg-void-blue/50 p-2">
                    <p className="text-xs italic text-mist-white/60">
                      "{distortion.highlightedText}"
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
