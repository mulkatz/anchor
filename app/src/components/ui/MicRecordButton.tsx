import { type FC } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

interface MicRecordButtonProps {
  isRecording: boolean;
  isTranscribing?: boolean;
  disabled?: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

/**
 * Reusable microphone record button component
 *
 * Used by ChatInput in both variants:
 * - Chat variant: records and sends voice messages
 * - Form variant: records, transcribes, and appends text
 *
 * Features:
 * - Consistent styling across the app (biolum-cyan theme)
 * - Recording state: scales up, pulses, danger color
 * - Transcribing state: loading spinner
 * - Prevents event propagation to avoid textarea focus issues
 */
export const MicRecordButton: FC<MicRecordButtonProps> = ({
  isRecording,
  isTranscribing = false,
  disabled = false,
  onClick,
  className,
}) => {
  const { t } = useTranslation();

  const handleClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent parent elements from receiving the click
    e.stopPropagation();
    e.preventDefault();
    onClick(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isTranscribing}
      className={cn(
        'flex items-center justify-center',
        'h-10 w-10 rounded-full',
        'bg-biolum-cyan text-void-blue',
        'transition-all duration-300 ease-viscous',
        'disabled:cursor-not-allowed disabled:opacity-30',
        // Idle state
        !isRecording && !isTranscribing && 'shadow-glow-md hover:shadow-glow-lg active:scale-95',
        // Recording state
        isRecording && 'scale-110 animate-pulse bg-danger text-white shadow-glow-lg',
        // Transcribing state
        isTranscribing && 'bg-biolum-cyan/50',
        className
      )}
      title={
        isRecording
          ? t('chat.stopRecording')
          : isTranscribing
            ? t('speechToText.transcribing')
            : t('chat.startRecording')
      }
    >
      {isTranscribing ? (
        <Loader2 size={20} className="animate-spin" />
      ) : isRecording ? (
        <div className="h-3 w-3 rounded-sm bg-white" />
      ) : (
        <Mic size={20} />
      )}
    </button>
  );
};
