import { type FC, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { firestore } from '../../../services/firebase.service';
import { auth } from '../../../services/firebase.service';
import { useApp } from '../../../contexts/AppContext';
import { useHaptics } from '../../../hooks/useHaptics';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import { cn } from '../../../utils/cn';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

/**
 * FeedbackDialog Component
 * Allows users to submit ideas or bug reports to Firestore
 * Adapted from cap2cal's FeedbackDialog
 */

interface FeedbackDialogProps {
  onClose: () => void;
}

export const FeedbackDialog: FC<FeedbackDialogProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { version } = useApp();
  const { light, medium } = useHaptics();
  const [kind, setKind] = useState<'idea' | 'bug'>('idea');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSubmitting(true);

    try {
      await addDoc(collection(firestore, 'feedback'), {
        userId: auth.currentUser?.uid || 'anonymous',
        kind,
        text: text.trim(),
        timestamp: Timestamp.now(),
        platform: Capacitor.getPlatform(),
        appVersion: version,
        resolved: false,
      });

      logAnalyticsEvent(AnalyticsEvent.FEEDBACK_SUBMITTED, { kind });
      toast.success(t('toasts.feedbackSubmitted'));
      await medium();
      onClose();
    } catch (error) {
      console.error('Feedback submission failed:', error);
      logAnalyticsEvent(AnalyticsEvent.FEEDBACK_SUBMISSION_FAILED);
      toast.error(t('toasts.feedbackFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] bg-void-blue/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center px-4 pt-safe pb-safe"
      >
        <div className="pointer-events-auto w-full max-w-lg">
          <div
            className={cn(
              'relative rounded-2xl border border-glass-border',
              'bg-void-blue/95 backdrop-blur-glass',
              'p-6 shadow-glass'
            )}
          >
            {/* Close button */}
            <button
              onClick={async () => {
                await light();
                onClose();
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-mist-white/60 transition-all duration-300 hover:bg-glass-bg-hover hover:text-mist-white"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="mb-4 pt-2">
              <h2 className="text-center text-xl font-medium text-mist-white">
                {t('feedback.title')}
              </h2>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-center text-sm text-mist-white/70">{t('feedback.description')}</p>
            </div>

            {/* Segmented control */}
            <div className="mb-4 flex gap-2 rounded-xl bg-void-blue p-1">
              <button
                onClick={async () => {
                  setKind('idea');
                  await light();
                }}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2 text-sm font-semibold',
                  'transition-all duration-300 ease-viscous',
                  kind === 'idea'
                    ? 'bg-biolum-cyan text-void-blue shadow-glow-sm'
                    : 'text-mist-white/60'
                )}
              >
                {t('feedback.idea')}
              </button>
              <button
                onClick={async () => {
                  setKind('bug');
                  await light();
                }}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2 text-sm font-semibold',
                  'transition-all duration-300 ease-viscous',
                  kind === 'bug'
                    ? 'bg-biolum-cyan text-void-blue shadow-glow-sm'
                    : 'text-mist-white/60'
                )}
              >
                {t('feedback.bug')}
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={1000}
              placeholder={
                kind === 'idea' ? t('feedback.ideaPlaceholder') : t('feedback.bugPlaceholder')
              }
              className={cn(
                'w-full rounded-xl p-3',
                'border border-glass-border bg-void-blue',
                'text-mist-white placeholder-mist-white/30',
                'focus:border-biolum-cyan focus:outline-none',
                'transition-colors duration-300'
              )}
            />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isSubmitting}
              className={cn(
                'mt-4 w-full rounded-full px-6 py-3',
                'bg-biolum-cyan font-semibold text-void-blue',
                'transition-all duration-300 ease-viscous active:scale-95',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'shadow-glow-md'
              )}
            >
              {isSubmitting ? t('feedback.sending') : t('feedback.submit')}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
