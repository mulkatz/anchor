import { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface ThoughtsStepProps {
  automaticThoughts: string;
  onThoughtsChange: (value: string) => void;
}

/**
 * Step 2: The Thoughts
 * Single focused textarea for automatic thoughts
 */
export const ThoughtsStep: FC<ThoughtsStepProps> = ({ automaticThoughts, onThoughtsChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-2">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="mb-6 text-center">
          <h3 className="text-xl font-medium text-mist-white">
            {t('illuminate.thoughts.title', 'What went through your mind?')}
          </h3>
          <p className="mt-2 text-sm text-mist-white/60">
            {t(
              'illuminate.thoughts.description',
              'Write your automatic thoughts exactly as they came'
            )}
          </p>
        </div>

        {/* Single focused textarea */}
        <textarea
          value={automaticThoughts}
          onChange={(e) => onThoughtsChange(e.target.value)}
          placeholder={t(
            'illuminate.thoughts.placeholder',
            'What did you tell yourself? What thoughts came up?'
          )}
          className="h-48 w-full resize-none rounded-2xl border border-glass-border bg-glass-bg p-4 text-base text-mist-white placeholder:text-mist-white/40 focus:border-biolum-cyan/50 focus:outline-none focus:ring-2 focus:ring-biolum-cyan/20"
          maxLength={1000}
          autoFocus
        />

        {/* Character count */}
        <div className="mt-2 text-right text-xs text-mist-white/40">
          {automaticThoughts.length}/1000
        </div>

        {/* Helper tip */}
        <p className="mt-4 text-center text-xs text-mist-white/50">
          {t('illuminate.thoughts.tip', 'Write exactly what went through your mind - no filtering')}
        </p>
      </div>
    </div>
  );
};
