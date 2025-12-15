import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface SituationStepProps {
  situation: string;
  onSituationChange: (value: string) => void;
}

/**
 * Step 1: The Situation
 * Single focused textarea for "What happened?"
 */
export const SituationStep: FC<SituationStepProps> = ({ situation, onSituationChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-2">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-medium text-mist-white">
            {t('illuminate.situation.title', 'What happened?')}
          </h3>
          <p className="mt-2 text-sm text-mist-white/60">
            {t('illuminate.situation.description', 'Describe the situation or event')}
          </p>
        </div>

        {/* Single focused textarea */}
        <textarea
          value={situation}
          onChange={(e) => onSituationChange(e.target.value)}
          placeholder={t(
            'illuminate.situation.placeholder',
            'What situation brought up these feelings?'
          )}
          className="h-40 w-full resize-none rounded-2xl border border-glass-border bg-glass-bg p-4 text-base text-mist-white placeholder:text-mist-white/40 focus:border-biolum-cyan/50 focus:outline-none focus:ring-2 focus:ring-biolum-cyan/20"
          maxLength={500}
          autoFocus
        />

        {/* Character count */}
        <div className="mt-2 text-right text-xs text-mist-white/40">{situation.length}/500</div>

        {/* Helper tip */}
        <p className="mt-4 text-center text-xs text-mist-white/50">
          {t('illuminate.situation.tip', 'Be specific about what happened, when, and where')}
        </p>
      </div>
    </div>
  );
};
