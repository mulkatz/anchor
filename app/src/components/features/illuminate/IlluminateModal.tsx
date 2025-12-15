import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { SituationStep } from './SituationStep';
import { ThoughtsStep } from './ThoughtsStep';
import { FeelingsStep } from './FeelingsStep';
import { IntensityStep } from './IntensityStep';
import { PatternStep } from './PatternStep';
import { LightStep } from './LightStep';
import { useIlluminateFlow } from '../../../hooks/useIlluminateFlow';
import { useIlluminate } from '../../../hooks/useIlluminate';
import { useHaptics } from '../../../hooks/useHaptics';
import { useApp } from '../../../contexts/AppContext';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import { cn } from '../../../utils/cn';

interface IlluminateModalProps {
  onClose: () => void;
  onComplete?: () => void;
}

const TOTAL_STEPS = 6;

/**
 * 6-step Illuminate wizard modal
 * Step 1: The Situation (what happened)
 * Step 2: The Thoughts (automatic thoughts)
 * Step 3: The Feelings (emotion selection)
 * Step 4: The Intensity (emotional intensity)
 * Step 5: The Pattern (AI distortion detection)
 * Step 6: The Reframe (balanced perspective)
 */
export const IlluminateModal: FC<IlluminateModalProps> = ({ onClose, onComplete }) => {
  const { t, i18n } = useTranslation();
  const { light, medium, heavy } = useHaptics();
  const { userProfile } = useApp();
  const { createEntry } = useIlluminate();

  const {
    step,
    direction,
    data,
    isLoading,
    error,
    nextStep,
    prevStep,
    canProceed,
    updateData,
    confirmDistortion,
    dismissDistortion,
    selectReframe,
    processWithAI,
    getEntryDuration,
    reset,
  } = useIlluminateFlow();

  const [isSaving, setIsSaving] = useState(false);

  // Log that modal was opened
  useEffect(() => {
    logAnalyticsEvent(AnalyticsEvent.ILLUMINATE_STARTED);
  }, []);

  // Step transition variants
  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const stepTransition = {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  // Step titles
  const stepTitles = [
    t('illuminate.steps.situation', 'The Situation'),
    t('illuminate.steps.thoughts', 'The Thoughts'),
    t('illuminate.steps.feelings', 'The Feelings'),
    t('illuminate.steps.intensity', 'The Intensity'),
    t('illuminate.steps.pattern', 'The Pattern'),
    t('illuminate.steps.reframe', 'The Reframe'),
  ];

  const handleClose = () => {
    light();
    if (step > 1) {
      logAnalyticsEvent(AnalyticsEvent.ILLUMINATE_ABANDONED, { step });
    }
    onClose();
  };

  const handleNext = async () => {
    light();

    // If moving from step 4 to step 5, trigger AI processing
    if (step === 4) {
      const language = userProfile?.language || i18n.language || 'en-US';
      await processWithAI(language);
    }

    nextStep();
  };

  const handleBack = () => {
    light();
    prevStep();
  };

  const handleSave = async () => {
    if (isSaving || !canProceed) return;

    try {
      setIsSaving(true);
      heavy();

      await createEntry(
        // Input data
        {
          situation: data.situation,
          automaticThoughts: data.automaticThoughts,
          primaryEmotions: data.primaryEmotions,
          emotionalIntensity: data.emotionalIntensity,
        },
        // AI data
        {
          aiDetectedDistortions: data.aiDetectedDistortions,
          aiSuggestedReframes: data.aiSuggestedReframes,
        },
        // Completion data
        {
          userConfirmedDistortions: data.userConfirmedDistortions,
          userDismissedDistortions: data.userDismissedDistortions,
          selectedReframe: data.selectedReframe,
          customReframe: data.customReframe,
          reframeHelpfulness: data.reframeHelpfulness,
          entryDurationSeconds: getEntryDuration(),
        }
      );

      toast.success(t('illuminate.saved', 'Reflection saved'));
      medium();
      onComplete?.();
      onClose();
    } catch (err) {
      console.error('Error saving illuminate entry:', err);
      // Error toast already shown by hook
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-4 pt-safe pb-safe">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-void-blue/80 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg"
        style={{ height: 'clamp(550px, 75dvh, 90dvh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-glass-border bg-glass-bg p-4 shadow-glass backdrop-blur-glass sm:p-6">
          {/* Header */}
          <div className="mb-4 flex flex-shrink-0 items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-mist-white">{stepTitles[step - 1]}</h2>
              <p className="text-sm text-mist-white/60">
                {t('illuminate.stepOf', 'Step {{current}} of {{total}}', {
                  current: step,
                  total: TOTAL_STEPS,
                })}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-mist-white/70 transition-colors hover:bg-mist-white/10 hover:text-mist-white"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Step indicator dots */}
          <div className="mb-4 flex flex-shrink-0 justify-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  s === step
                    ? 'w-5 bg-biolum-cyan shadow-glow-sm'
                    : s < step
                      ? 'w-2 bg-biolum-cyan/50'
                      : 'w-2 bg-mist-white/20'
                )}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="absolute inset-0 flex items-center justify-center overflow-y-auto px-1"
                >
                  <SituationStep
                    situation={data.situation}
                    onSituationChange={(situation) => updateData({ situation })}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="absolute inset-0 flex items-center justify-center overflow-y-auto px-1"
                >
                  <ThoughtsStep
                    automaticThoughts={data.automaticThoughts}
                    onThoughtsChange={(automaticThoughts) => updateData({ automaticThoughts })}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="absolute inset-0 overflow-y-auto px-1"
                >
                  <FeelingsStep
                    primaryEmotions={data.primaryEmotions}
                    onEmotionsChange={(primaryEmotions) => updateData({ primaryEmotions })}
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step-4"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <IntensityStep
                    emotionalIntensity={data.emotionalIntensity}
                    onIntensityChange={(emotionalIntensity) => updateData({ emotionalIntensity })}
                  />
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step-5"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="absolute inset-0 overflow-y-auto px-1"
                >
                  <PatternStep
                    isLoading={isLoading}
                    error={error}
                    aiDetectedDistortions={data.aiDetectedDistortions}
                    userConfirmedDistortions={data.userConfirmedDistortions}
                    userDismissedDistortions={data.userDismissedDistortions}
                    onConfirm={confirmDistortion}
                    onDismiss={dismissDistortion}
                  />
                </motion.div>
              )}

              {step === 6 && (
                <motion.div
                  key="step-6"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  className="absolute inset-0 overflow-y-auto px-1"
                >
                  <LightStep
                    aiSuggestedReframes={data.aiSuggestedReframes}
                    selectedReframe={data.selectedReframe}
                    customReframe={data.customReframe}
                    onSelectReframe={selectReframe}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="mt-4 flex flex-shrink-0 gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-bg px-4 py-3 text-mist-white backdrop-blur-glass transition-colors hover:bg-glass-bg-hover disabled:opacity-50"
              >
                <ArrowLeft size={20} />
                <span>{t('illuminate.back', 'Back')}</span>
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                disabled={!canProceed || isLoading}
                className={cn(
                  'ml-auto flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all',
                  canProceed && !isLoading
                    ? 'border border-biolum-cyan bg-biolum-cyan/10 text-biolum-cyan hover:bg-biolum-cyan/20 hover:shadow-glow-sm'
                    : 'cursor-not-allowed border border-glass-border bg-glass-bg text-mist-white/30'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{t('illuminate.analyzing', 'Analyzing...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('illuminate.next', 'Next')}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canProceed || isSaving}
                className={cn(
                  'ml-auto flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all',
                  canProceed && !isSaving
                    ? 'hover:shadow-glow border border-biolum-cyan bg-biolum-cyan text-void-blue'
                    : 'cursor-not-allowed border border-glass-border bg-glass-bg text-mist-white/30'
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{t('illuminate.saving', 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>{t('illuminate.complete', 'Complete')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
