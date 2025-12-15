import { type FC, useRef, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { useDialog } from '../../contexts/DialogContext';
import { PermissionDenied } from '../features/dialogs/PermissionDenied';

interface TextareaWithMicProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Textarea with integrated speech-to-text microphone button
 * Mic button positioned at bottom-right corner
 * Appends transcribed text to existing value
 */
export const TextareaWithMic: FC<TextareaWithMicProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  autoFocus = false,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogs = useDialog();

  const speechToText = useSpeechToText();

  // Focus textarea on mount if autoFocus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * Handle mic button click
   * Toggle recording on/off
   */
  const handleMicClick = async () => {
    if (disabled) return;

    if (!speechToText.isRecording && !speechToText.isTranscribing) {
      // Start recording
      const result = await speechToText.startRecording();

      if (result === 'permission_denied') {
        dialogs.push(<PermissionDenied type="microphone" onClose={dialogs.pop} />);
      }
    } else if (speechToText.isRecording) {
      // Stop recording and transcribe
      const transcribedText = await speechToText.stopAndTranscribe();

      if (transcribedText) {
        // Append to existing text with space if needed
        const newValue = value.trim() ? `${value.trim()} ${transcribedText}` : transcribedText;
        onChange(newValue);
      }
    }
  };

  /**
   * Format duration for display (MM:SS)
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isActive = speechToText.isRecording || speechToText.isTranscribing;

  return (
    <div className={cn('relative flex flex-col', className)}>
      {/* Recording/Transcribing indicator */}
      {isActive && (
        <div className="absolute left-4 top-4 flex items-center gap-2 text-sm">
          {speechToText.isRecording && (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-danger" />
              <span className="text-danger">{formatDuration(speechToText.duration)}</span>
            </>
          )}
          {speechToText.isTranscribing && (
            <>
              <Loader2 size={14} className="animate-spin text-biolum-cyan" />
              <span className="text-biolum-cyan">{t('speechToText.transcribing')}</span>
            </>
          )}
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || speechToText.isTranscribing}
        className={cn(
          'w-full flex-1 resize-none',
          'rounded-2xl border border-glass-border bg-glass-bg',
          'p-4 pb-14', // Extra padding at bottom for mic button
          'text-base text-mist-white placeholder:text-mist-white/40',
          'focus:border-biolum-cyan/50 focus:outline-none focus:ring-2 focus:ring-biolum-cyan/20',
          'disabled:opacity-50',
          'transition-all duration-300',
          isActive && 'pt-12' // Extra top padding when showing indicator
        )}
      />

      {/* Mic button - bottom right */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={disabled || speechToText.isTranscribing}
        className={cn(
          'absolute bottom-3 right-3',
          'flex items-center justify-center',
          'h-10 w-10 rounded-full',
          'transition-all duration-300 ease-viscous',
          'disabled:cursor-not-allowed disabled:opacity-30',
          // Idle state
          !isActive && 'bg-biolum-cyan/20 text-biolum-cyan hover:bg-biolum-cyan/30 active:scale-95',
          // Recording state
          speechToText.isRecording && 'scale-110 animate-pulse bg-danger text-white shadow-glow-lg',
          // Transcribing state
          speechToText.isTranscribing && 'bg-biolum-cyan/20 text-biolum-cyan'
        )}
        title={
          speechToText.isRecording
            ? t('speechToText.tapToStop')
            : speechToText.isTranscribing
              ? t('speechToText.transcribing')
              : t('speechToText.tapToRecord')
        }
      >
        {speechToText.isTranscribing ? (
          <Loader2 size={20} className="animate-spin" />
        ) : speechToText.isRecording ? (
          <div className="h-3 w-3 rounded-sm bg-white" />
        ) : (
          <Mic size={20} />
        )}
      </button>
    </div>
  );
};
