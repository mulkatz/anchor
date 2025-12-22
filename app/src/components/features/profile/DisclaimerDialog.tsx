import { type FC } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import { cn } from '../../../utils/cn';
import { useTranslation } from 'react-i18next';

/**
 * DisclaimerDialog Component
 * Critical mental health disclaimer - app is NOT a replacement for professional care
 * Shows on first launch and accessible from settings
 */

interface DisclaimerDialogProps {
  onClose: () => void;
}

export const DisclaimerDialog: FC<DisclaimerDialogProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { medium } = useHaptics();

  const handleAccept = async () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    logAnalyticsEvent(AnalyticsEvent.DISCLAIMER_ACCEPTED);
    await medium();
    onClose();
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
              'rounded-2xl border border-glass-border',
              'bg-void-blue/95 backdrop-blur-glass',
              'p-6 shadow-glass'
            )}
          >
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <AlertCircle className="text-warm-ember" size={48} />
            </div>

            {/* Title */}
            <h2 className="mb-4 text-center text-xl font-medium text-mist-white">
              {t('disclaimer.title')}
            </h2>

            {/* Content */}
            <div className="mb-6 space-y-3 text-sm text-mist-white/80">
              <p>
                <strong>{t('disclaimer.notSubstitute')}</strong>
              </p>

              <p>{t('disclaimer.description')}</p>

              <p>
                <strong>{t('disclaimer.crisisTitle')}</strong>
              </p>

              <ul className="ml-2 list-inside list-disc space-y-1">
                <li>{t('disclaimer.call988')}</li>
                <li>{t('disclaimer.call911')}</li>
                <li>{t('disclaimer.contactTherapist')}</li>
                <li>{t('disclaimer.goToER')}</li>
              </ul>

              <p>{t('disclaimer.acknowledgment')}</p>
            </div>

            {/* Accept button */}
            <button
              onClick={handleAccept}
              className={cn(
                'w-full rounded-full px-6 py-3',
                'bg-biolum-cyan font-semibold text-void-blue',
                'transition-all duration-300 ease-viscous active:scale-95',
                'shadow-glow-md'
              )}
            >
              {t('disclaimer.understand')}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};
