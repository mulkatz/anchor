import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatInput } from '../chat/ChatInput';

interface SituationStepProps {
  situation: string;
  onSituationChange: (value: string) => void;
}

/**
 * Step 1: The Situation
 * Single focused textarea for "What happened?"
 * With speech-to-text microphone button
 */
export const SituationStep: FC<SituationStepProps> = ({ situation, onSituationChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full flex-col px-2">
      <div className="flex flex-1 flex-col">
        {/* Title */}
        <div className="mb-4 text-center">
          <h3 className="text-xl font-medium text-mist-white">
            {t('illuminate.situation.title', 'What happened?')}
          </h3>
          <p className="mt-2 text-sm text-mist-white/60">
            {t('illuminate.situation.description', 'Describe the situation or event')}
          </p>
        </div>

        {/* Textarea with mic - fills available space */}
        <ChatInput
          variant="form"
          value={situation}
          onChange={onSituationChange}
          placeholder={t(
            'illuminate.situation.placeholder',
            'What situation brought up these feelings?'
          )}
          className="min-h-[200px] flex-1"
        />

        {/* Helper tip */}
        <p className="mt-3 text-center text-xs text-mist-white/50">
          {t('illuminate.situation.tip', 'Be specific about what happened, when, and where')}
        </p>
      </div>
    </div>
  );
};
