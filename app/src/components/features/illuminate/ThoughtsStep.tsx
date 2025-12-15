import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { TextareaWithMic } from '../../ui/TextareaWithMic';

interface ThoughtsStepProps {
  automaticThoughts: string;
  onThoughtsChange: (value: string) => void;
}

/**
 * Step 2: The Thoughts
 * Single focused textarea for automatic thoughts
 * With speech-to-text microphone button
 */
export const ThoughtsStep: FC<ThoughtsStepProps> = ({ automaticThoughts, onThoughtsChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col px-2">
      <div className="flex flex-1 flex-col">
        {/* Title */}
        <div className="mb-4 text-center">
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

        {/* Textarea with mic - fills available space */}
        <TextareaWithMic
          value={automaticThoughts}
          onChange={onThoughtsChange}
          placeholder={t(
            'illuminate.thoughts.placeholder',
            'What did you tell yourself? What thoughts came up?'
          )}
          className="min-h-[200px] flex-1"
          autoFocus
        />

        {/* Helper tip */}
        <p className="mt-3 text-center text-xs text-mist-white/50">
          {t('illuminate.thoughts.tip', 'Write exactly what went through your mind - no filtering')}
        </p>
      </div>
    </div>
  );
};
