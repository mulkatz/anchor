import { type FC } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';
import { Capacitor } from '@capacitor/core';

interface UpdateDialogProps {
  type: 'required' | 'available';
  onClose: () => void;
}

/**
 * UpdateDialog - Shows update required or update available prompts
 *
 * - "required": Force update, no dismiss option
 * - "available": Optional update with "Later" button
 */
export const UpdateDialog: FC<UpdateDialogProps> = ({ type, onClose }) => {
  const { t } = useTranslation();
  const { medium, light } = useHaptics();
  const isRequired = type === 'required';

  const handleUpdate = async () => {
    await medium();

    // Get the appropriate store URL based on platform
    const platform = Capacitor.getPlatform();
    let storeUrl = '';

    if (platform === 'ios') {
      // Replace with your App Store URL
      storeUrl = 'https://apps.apple.com/app/idXXXXXXXXXX';
    } else if (platform === 'android') {
      // Replace with your Play Store URL
      storeUrl = 'https://play.google.com/store/apps/details?id=cx.franz.anxietybuddy';
    } else {
      // Web - just close the dialog
      onClose();
      return;
    }

    // Open the store
    window.open(storeUrl, '_blank');

    // For optional updates, close the dialog after opening store
    if (!isRequired) {
      onClose();
    }
  };

  const handleLater = async () => {
    await light();
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
        // Only allow closing on backdrop click if not required
        onClick={isRequired ? undefined : onClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center px-4 pt-safe pb-safe"
      >
        <div className="pointer-events-auto w-full max-w-md">
          <div
            className={cn(
              'rounded-2xl border border-glass-border',
              'bg-void-blue/95 backdrop-blur-glass',
              'p-6 shadow-glass'
            )}
          >
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-biolum-cyan/20 p-3">
                <Download size={32} className="text-biolum-cyan" />
              </div>
            </div>

            {/* Content */}
            <h2 className="mb-2 text-center text-xl font-medium text-mist-white">
              {t(`dialogs.${isRequired ? 'updateRequired' : 'updateAvailable'}.title`)}
            </h2>
            <p className="mb-6 text-center text-sm text-mist-white/70">
              {t(`dialogs.${isRequired ? 'updateRequired' : 'updateAvailable'}.message`)}
            </p>

            {/* Actions */}
            <div className={cn('flex gap-3', isRequired ? 'flex-col' : 'flex-row')}>
              {!isRequired && (
                <button
                  onClick={handleLater}
                  className={cn(
                    'flex-1 rounded-full px-4 py-3',
                    'border border-glass-border bg-glass-bg',
                    'text-sm font-medium text-mist-white',
                    'transition-all duration-300 ease-viscous',
                    'hover:bg-glass-bg-hover active:scale-95'
                  )}
                >
                  {t('dialogs.updateAvailable.later')}
                </button>
              )}

              <button
                onClick={handleUpdate}
                className={cn(
                  'flex-1 rounded-full px-4 py-3',
                  'bg-biolum-cyan text-sm font-medium text-void-blue',
                  'shadow-glow-md',
                  'transition-all duration-300 ease-viscous',
                  'active:scale-95'
                )}
              >
                {t(`dialogs.${isRequired ? 'updateRequired' : 'updateAvailable'}.button`)}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
