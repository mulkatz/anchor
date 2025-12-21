import { type FC, useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';
import { useNavbarHeight } from '../../../hooks/useNavbarHeight';
import { useVoiceRecorder, type RecordingData } from '../../../hooks/useVoiceRecorder';
import { useSpeechToText } from '../../../hooks/useSpeechToText';
import { useDialog } from '../../../contexts/DialogContext';
import { PermissionDenied } from '../dialogs/PermissionDenied';
import { MicRecordButton } from '../../ui/MicRecordButton';

interface ChatInputBaseProps {
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface ChatVariantProps extends ChatInputBaseProps {
  variant?: 'chat' | 'dive';
  onSend: (text: string) => void;
  onSendVoice?: (recordingData: RecordingData) => void;
  zoneColor?: string; // For dive variant - subtle accent color
  value?: undefined;
  onChange?: undefined;
}

interface FormVariantProps extends ChatInputBaseProps {
  variant: 'form';
  value: string;
  onChange: (value: string) => void;
  onSend?: undefined;
  onSendVoice?: undefined;
}

type ChatInputProps = ChatVariantProps | FormVariantProps;

/**
 * Chat Input Component
 * Supports three variants:
 * - "chat": Positioned at bottom, auto-resizing, with send/mic button (default)
 * - "dive": Like chat but with meditative placeholder for The Dive feature
 * - "form": Inline, stretched textarea with mic button, externally controlled
 */
export const ChatInput: FC<ChatInputProps> = (props) => {
  const { variant = 'chat', disabled, placeholder, className } = props;
  const isFormVariant = variant === 'form';
  const isDiveVariant = variant === 'dive';
  const zoneColor = !isFormVariant ? (props as ChatVariantProps).zoneColor : undefined;

  const { t } = useTranslation();
  const [internalText, setInternalText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { light } = useHaptics();
  const navbarOffset = useNavbarHeight();
  const voiceRecorder = useVoiceRecorder();
  const speechToText = useSpeechToText();
  const dialogs = useDialog();

  // Track mic interaction to disable textarea before async operations
  const [isMicActive, setIsMicActive] = useState(false);

  // Use internal or external text based on variant
  const text = isFormVariant ? (props as FormVariantProps).value : internalText;
  const setText = (value: string) => {
    if (isFormVariant) {
      (props as FormVariantProps).onChange(value);
    } else {
      setInternalText(value);
    }
  };

  // Auto-resize textarea based on content (only for chat variant)
  useEffect(() => {
    if (!isFormVariant && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text, isFormVariant]);

  const handleSend = async () => {
    if (isFormVariant) return;

    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    await light();
    (props as ChatVariantProps).onSend(trimmed);
    setInternalText('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!isFormVariant && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  /**
   * Toggle recording on/off
   * Behavior differs by variant:
   * - chat: sends voice recording directly
   * - form: transcribes and appends text
   */
  const handleMicClick = async (e: React.MouseEvent) => {
    // Stop propagation to prevent parent onClick from focusing textarea
    e.stopPropagation();

    if (disabled) return;

    // Blur textarea to dismiss keyboard
    textareaRef.current?.blur();

    if (!isFormVariant) {
      // Chat variant: record and send voice directly
      const chatProps = props as ChatVariantProps;
      if (!chatProps.onSendVoice) return;

      if (!voiceRecorder.isRecording) {
        const result = await voiceRecorder.startRecording();
        if (result === 'permission_denied') {
          dialogs.push(<PermissionDenied type="microphone" onClose={dialogs.pop} />);
        }
      } else {
        const recordingData = await voiceRecorder.stopRecording();
        if (recordingData) {
          chatProps.onSendVoice(recordingData);
        }
      }
    } else {
      // Form variant: record, transcribe, and append text
      if (!speechToText.isRecording && !speechToText.isTranscribing) {
        setIsMicActive(true);

        const result = await speechToText.startRecording();
        if (result === 'permission_denied') {
          setIsMicActive(false);
          dialogs.push(<PermissionDenied type="microphone" onClose={dialogs.pop} />);
        }
      } else if (speechToText.isRecording) {
        const transcribedText = await speechToText.stopAndTranscribe();
        if (transcribedText) {
          const newValue = text.trim() ? `${text.trim()} ${transcribedText}` : transcribedText;
          setText(newValue);
        }
        setIsMicActive(false);
      }
    }
  };

  // Determine if mic is active based on variant
  const isRecording = isFormVariant ? speechToText.isRecording : voiceRecorder.isRecording;
  const isTranscribing = isFormVariant && speechToText.isTranscribing;
  const isActive = isMicActive || isRecording || isTranscribing;

  // Show mic button when input is empty (chat) or always (form)
  const showMicButton = isFormVariant || (!text.trim() && (props as ChatVariantProps).onSendVoice);

  // Form variant: stretched textarea with mic button inside
  if (isFormVariant) {
    return (
      <div className={cn('relative flex flex-col', className)}>
        {/* Recording/Transcribing indicator */}
        {isActive && (
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-sm">
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
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          readOnly={isActive}
          disabled={disabled}
          inputMode={isActive ? 'none' : 'text'}
          className={cn(
            'h-full w-full flex-1 resize-none',
            'rounded-2xl border border-glass-border bg-glass-bg',
            'p-4 pb-16', // Extra padding at bottom for mic button
            'text-base text-mist-white placeholder:text-mist-white/40',
            'focus:border-biolum-cyan/50 focus:outline-none focus:ring-2 focus:ring-biolum-cyan/20',
            'disabled:opacity-50',
            'transition-all duration-300',
            isActive && 'pointer-events-none pt-12'
          )}
        />

        {/* Mic button - positioned inside textarea at bottom right */}
        <MicRecordButton
          isRecording={speechToText.isRecording}
          isTranscribing={speechToText.isTranscribing}
          disabled={disabled}
          onClick={handleMicClick}
          className="absolute bottom-3 right-3"
        />
      </div>
    );
  }

  // Chat/Dive variant: positioned at bottom
  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40',
        'px-4 pb-4 sm:px-6',
        'pointer-events-auto',
        'touch-manipulation',
        'border-t border-glass-border bg-void-blue/95 pt-3 backdrop-blur-glass',
        className
      )}
      style={{
        marginBottom: navbarOffset > 0 ? `${navbarOffset + 8}px` : '96px',
      }}
    >
      <div
        onClick={() => textareaRef.current?.focus()}
        className={cn(
          'flex items-center gap-3',
          'rounded-3xl px-4 py-3',
          'cursor-text',
          'transition-all duration-300',
          'border border-glass-border bg-glass-bg shadow-glass backdrop-blur-glass'
        )}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          onTouchStart={() => textareaRef.current?.focus()}
          placeholder={
            placeholder || t(isDiveVariant ? 'dive.input.placeholder' : 'chat.inputPlaceholder')
          }
          disabled={disabled}
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="on"
          className={cn(
            'flex-1 bg-transparent text-mist-white',
            'placeholder:text-mist-white/40',
            'resize-none outline-none',
            'max-h-32 min-h-[24px]',
            'py-1 leading-6',
            'disabled:opacity-50',
            'touch-manipulation'
          )}
          rows={1}
        />

        {showMicButton ? (
          <MicRecordButton
            isRecording={isRecording}
            disabled={disabled}
            onClick={handleMicClick}
            className="shrink-0 self-end"
          />
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className={cn(
              'flex items-center justify-center self-end',
              'h-10 w-10 shrink-0 rounded-full',
              'transition-all duration-300 ease-viscous',
              'active:scale-90',
              'disabled:cursor-not-allowed disabled:opacity-30',
              // Dive variant: very subtle send button
              isDiveVariant
                ? 'bg-white/10 text-mist-white/60 hover:bg-white/15 hover:text-mist-white/80'
                : cn('bg-biolum-cyan text-void-blue', !disabled && text.trim() && 'shadow-glow-md')
            )}
          >
            <Send size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
