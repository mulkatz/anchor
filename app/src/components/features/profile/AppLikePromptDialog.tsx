import { type FC } from 'react';
import { Heart, Meh } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import { cn } from '../../../utils/cn';
import { useTranslation } from 'react-i18next';

/**
 * AppLikePromptDialog Component
 * Pre-rating prompt to filter users before showing native rating dialog
 * Adapted from cap2cal's AppLikePrompt
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
    <div className="p-6">
      <h2 className="mb-6 text-center text-xl font-semibold text-mist-white">
        {t('appLikePrompt.title')}
      </h2>

      {/* Buttons */}
      <div className="flex gap-3">
        {/* No button */}
        <button
          onClick={handleDislike}
          className={cn(
            'flex flex-1 flex-col items-center gap-2 rounded-2xl p-6',
            'border border-glass-border bg-glass-bg',
            'transition-all duration-300 ease-viscous',
            'hover:bg-glass-bg-hover active:scale-95'
          )}
        >
          <Meh className="text-mist-white/60" size={32} />
          <span className="text-sm font-medium text-mist-white/80">{t('appLikePrompt.no')}</span>
        </button>

        {/* Yes button */}
        <button
          onClick={handleLike}
          className={cn(
            'flex flex-1 flex-col items-center gap-2 rounded-2xl p-6',
            'bg-biolum-cyan',
            'transition-all duration-300 ease-viscous',
            'shadow-glow-md active:scale-95'
          )}
        >
          <Heart className="text-void-blue" size={32} fill="currentColor" />
          <span className="text-sm font-medium text-void-blue">{t('appLikePrompt.yes')}</span>
        </button>
      </div>
    </div>
  );
};
