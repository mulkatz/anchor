import { type FC, useState, useRef, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';
import { useNavbarHeight } from '../../../hooks/useNavbarHeight';
import { useVoiceRecorder, type RecordingData } from '../../../hooks/useVoiceRecorder';
import { useDialog } from '../../../contexts/DialogContext';
import { PermissionDenied } from '../dialogs/PermissionDenied';

interface ChatInputProps {
  onSend: (text: string) => void;
  onSendVoice?: (recordingData: RecordingData) => void;
  disabled?: boolean;
}

/**
 * Chat Input Component
 * Auto-resizing textarea with glass morphism styling
 * Supports both text and voice input with click-to-record toggle
 */
export const ChatInput: FC<ChatInputProps> = ({ onSend, onSendVoice, disabled }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);

  const { light } = useHaptics();
  const navbarOffset = useNavbarHeight();
  const voiceRecorder = useVoiceRecorder();
  const dialogs = useDialog();

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    await light(); // Haptic feedback
    onSend(trimmed);
    setText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Toggle recording on/off
   * First click: Start recording
   * Second click: Stop and send
   */
  const handleMicClick = async () => {
    if (disabled || !onSendVoice) return;

    if (!voiceRecorder.isRecording) {
      // Start recording
      const result = await voiceRecorder.startRecording();

      // Show permission denied dialog if permission was declined
      if (result === 'permission_denied') {
        dialogs.push(<PermissionDenied type="microphone" onClose={dialogs.pop} />);
      }
    } else {
      // Stop recording and send
      const recordingData = await voiceRecorder.stopRecording();

      // Send voice message if we got valid data
      if (recordingData) {
        onSendVoice(recordingData);
      }
    }
  };

  // Show mic button when input is empty, send button when there's text
  const showMicButton = !text.trim() && onSendVoice;

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40',
        'px-4 pb-4 pt-3 sm:px-6',
        'bg-void-blue/95 backdrop-blur-glass',
        'border-t border-glass-border',
        'pointer-events-auto',
        'touch-manipulation' // Improves touch handling on Android
      )}
      style={{
        marginBottom: navbarOffset > 0 ? `${navbarOffset + 8}px` : '96px', // +8px for gap
      }}
    >
      <div
        onClick={() => textareaRef.current?.focus()}
        className={cn(
          'flex items-center gap-3',
          'bg-glass-bg backdrop-blur-glass',
          'rounded-3xl border border-glass-border',
          'px-4 py-3 shadow-glass',
          'cursor-text' // Visual hint that clicking focuses input
        )}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          onTouchStart={() => textareaRef.current?.focus()}
          placeholder={t('chat.inputPlaceholder')}
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
          <button
            ref={micButtonRef}
            onClick={handleMicClick}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center',
              'h-10 w-10 shrink-0 rounded-full',
              'bg-biolum-cyan text-void-blue',
              'transition-all duration-300 ease-viscous',
              'disabled:cursor-not-allowed disabled:opacity-30',
              !disabled &&
                !voiceRecorder.isRecording &&
                'shadow-glow-md hover:shadow-glow-lg active:scale-95',
              voiceRecorder.isRecording && 'scale-110 animate-pulse bg-danger shadow-glow-lg'
            )}
            title={voiceRecorder.isRecording ? t('chat.stopRecording') : t('chat.startRecording')}
          >
            {voiceRecorder.isRecording ? (
              <div className="h-3 w-3 rounded-full bg-void-blue" />
            ) : (
              <Mic size={20} />
            )}
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || !text.trim()}
            className={cn(
              'flex items-center justify-center',
              'h-10 w-10 rounded-full',
              'bg-biolum-cyan text-void-blue',
              'transition-all duration-300 ease-viscous',
              'active:scale-90',
              'disabled:cursor-not-allowed disabled:opacity-30',
              !disabled && text.trim() && 'shadow-glow-md'
            )}
          >
            <Send size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
