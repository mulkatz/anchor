import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import { cn } from '../../../utils/cn';
import { useTranslation } from 'react-i18next';

/**
 * AppLikePromptDialog Component
 * Pre-rating prompt to filter users before showing native rating dialog
 */

interface AppLikePromptDialogProps {
  onLike: () => void;
  onDislike: () => void;
  onClose: () => void;
}

export const AppLikePromptDialog: FC<AppLikePromptDialogProps> = ({
  onLike,
  onDislike,
  onClose,
}) => {
  const { t } = useTranslation();
  const { light } = useHaptics();

  const handleLike = async () => {
    await light();
    logAnalyticsEvent(AnalyticsEvent.REVIEW_PROMPT_LIKED);
    onClose();
    onLike();
  };

  const handleDislike = async () => {
    await light();
    logAnalyticsEvent(AnalyticsEvent.REVIEW_PROMPT_DISLIKED);
    onClose();
    onDislike();
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
              <Anchor size={40} className="text-biolum-cyan" />
            </div>

            {/* Content */}
            <h2 className="mb-2 text-center text-xl font-medium text-mist-white">
              {t('appLikePrompt.title')}
            </h2>
            <p className="mb-6 text-center text-sm text-mist-white/70">
              {t('appLikePrompt.subtitle')}
            </p>

            {/* Actions - both neutral style for unbiased selection */}
            <div className="flex gap-3">
              <button
                onClick={handleDislike}
                className={cn(
                  'flex-1 rounded-full px-4 py-3',
                  'border border-glass-border bg-glass-bg',
                  'text-sm font-medium text-mist-white',
                  'transition-all duration-300 ease-viscous',
                  'hover:bg-glass-bg-hover active:scale-95'
                )}
              >
                {t('appLikePrompt.no')}
              </button>

              <button
                onClick={handleLike}
                className={cn(
                  'flex-1 rounded-full px-4 py-3',
                  'border border-glass-border bg-glass-bg',
                  'text-sm font-medium text-mist-white',
                  'transition-all duration-300 ease-viscous',
                  'hover:bg-glass-bg-hover active:scale-95'
                )}
              >
                {t('appLikePrompt.yes')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
