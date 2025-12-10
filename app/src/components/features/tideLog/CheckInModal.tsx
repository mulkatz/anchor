import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { DepthSlider } from './DepthSlider';
import { WeatherSelector } from './WeatherSelector';
import { JournalInput } from './JournalInput';
import { ReleaseAnimation } from './ReleaseAnimation';
import { useCheckInFlow } from '../../../hooks/useCheckInFlow';
import { useDailyLogs } from '../../../hooks/useDailyLogs';
import { useHaptics } from '../../../hooks/useHaptics';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import type { DailyLog } from '../../../models';
import { cn } from '../../../utils/cn';

interface CheckInModalProps {
  existingLog?: DailyLog | null;
  onClose: () => void;
}

/**
 * 3-step check-in wizard modal
 * Step 1: Depth slider
 * Step 2: Weather selector
 * Step 3: Journal input + Keep/Release
 */
export const CheckInModal: FC<CheckInModalProps> = ({ existingLog, onClose }) => {
  const { t } = useTranslation();
  const { light, medium } = useHaptics();
  const { createLog, updateLog } = useDailyLogs();
  const { step, data, nextStep, prevStep, updateData, canProceed, direction } =
    useCheckInFlow(existingLog);
  const [isSaving, setIsSaving] = useState(false);
  const [showReleaseAnimation, setShowReleaseAnimation] = useState(false);

  const isEditing = !!existingLog;

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

  const handleClose = () => {
    light();
    logAnalyticsEvent(AnalyticsEvent.CHECK_IN_MODAL_CLOSED);
    onClose();
  };

  const handleNext = () => {
    light();
    nextStep();
  };

  const handleBack = () => {
    light();
    prevStep();
  };

  const handleSave = async (is_released: boolean) => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      if (isEditing && existingLog) {
        // Update existing entry
        await updateLog(existingLog.id, {
          mood_depth: data.mood_depth,
          weather: data.weather!,
          note_text: data.note_text,
          is_released,
        });
      } else {
        // Create new entry
        await createLog({
          mood_depth: data.mood_depth,
          weather: data.weather!,
          note_text: data.note_text,
          is_released,
        });
      }

      if (is_released) {
        // Show release animation
        logAnalyticsEvent(AnalyticsEvent.RELEASE_ANIMATION_TRIGGERED);
        setShowReleaseAnimation(true);
        // Animation will call handleReleaseComplete when done
      } else {
        // No animation, close immediately
        toast.success(t('tideLog.saved'));
        medium();
        onClose();
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
      // Error toast already shown by useDailyLogs hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleReleaseComplete = () => {
    toast.success(t('tideLog.saved'));
    medium();
    onClose();
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

      {/* Modal - responsive height: min 500px or 70dvh, max 90dvh */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg"
        style={{ height: 'clamp(500px, 70dvh, 90dvh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-glass-border bg-glass-bg p-4 shadow-glass backdrop-blur-glass sm:p-6">
          {/* Header - fixed, doesn't shrink */}
          <div className="mb-4 flex flex-shrink-0 items-center justify-between sm:mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-mist-white">
                {isEditing ? t('tideLog.checkIn') : t('tideLog.checkIn')}
              </h2>
              <p className="text-sm text-mist-white/60">
                {t('tideLog.steps.stepOf', { current: step, total: 3 })}
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

          {/* Step indicator dots - fixed, doesn't shrink */}
          <div className="mb-4 flex flex-shrink-0 justify-center gap-2 sm:mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-300',
                  s === step
                    ? 'w-6 bg-biolum-cyan shadow-glow-sm'
                    : s < step
                      ? 'bg-biolum-cyan/50'
                      : 'bg-mist-white/20'
                )}
              />
            ))}
          </div>

          {/* Step content - fills remaining space, content centered via absolute positioning */}
          <div className="relative min-h-0 flex-1">
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
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex w-full flex-col items-center gap-2 sm:gap-4">
                    <h3 className="text-center text-lg font-medium text-mist-white">
                      {t('tideLog.depth.title')}
                    </h3>
                    <p className="text-center text-xs text-mist-white/70 sm:text-sm">
                      {t('tideLog.depth.description')}
                    </p>
                    <DepthSlider
                      value={data.mood_depth}
                      onChange={(value) => updateData({ mood_depth: value })}
                    />
                  </div>
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
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex w-full flex-col items-center gap-3 sm:gap-6">
                    <h3 className="text-center text-lg font-medium text-mist-white">
                      {t('tideLog.weather.title')}
                    </h3>
                    <WeatherSelector
                      value={data.weather}
                      onChange={(weather) => updateData({ weather })}
                    />
                  </div>
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
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex w-full flex-col items-center gap-3 sm:gap-6">
                    <h3 className="text-center text-lg font-medium text-mist-white">
                      {t('tideLog.journal.title')}
                    </h3>
                    <JournalInput
                      value={data.note_text}
                      onChange={(note_text) => updateData({ note_text })}
                      onKeep={() => handleSave(false)}
                      onRelease={() => handleSave(true)}
                      disabled={isSaving}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons (steps 1-2 only) - fixed, doesn't shrink */}
          {step < 3 && (
            <div className="mt-4 flex flex-shrink-0 gap-3 sm:mt-6">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-xl border border-glass-border bg-glass-bg px-6 py-3 text-mist-white backdrop-blur-glass transition-colors hover:bg-glass-bg-hover"
                >
                  <ArrowLeft size={20} />
                  <span>{t('tideLog.steps.back')}</span>
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  'ml-auto flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all',
                  canProceed
                    ? 'border border-biolum-cyan bg-biolum-cyan/10 text-biolum-cyan hover:bg-biolum-cyan/20 hover:shadow-glow-sm'
                    : 'cursor-not-allowed border border-glass-border bg-glass-bg text-mist-white/30'
                )}
              >
                <span>{t('tideLog.steps.next')}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Release Animation */}
      {showReleaseAnimation && (
        <ReleaseAnimation text={t('tideLog.releasing')} onComplete={handleReleaseComplete} />
      )}
    </div>
  );
};
