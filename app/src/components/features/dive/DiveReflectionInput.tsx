import { type FC, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVoiceRecorder, type RecordingData } from '../../../hooks/useVoiceRecorder';
import { useHaptics } from '../../../hooks/useHaptics';
import { useUI } from '../../../contexts/UIContext';
import { zoneThemes, type DiveZone } from '../../../data/dive-lessons';
import { cn } from '../../../utils/cn';

interface DiveReflectionInputProps {
  onSendText: (text: string) => Promise<void>;
  onSendVoice: (recording: RecordingData) => Promise<void>;
  isDisabled: boolean;
  zone: DiveZone;
}

/**
 * Dive Reflection Input
 * Journal-style textarea for deep reflection
 * Supports voice-to-text for spoken reflections
 */
export const DiveReflectionInput: FC<DiveReflectionInputProps> = ({
  onSendText,
  onSendVoice,
  isDisabled,
  zone,
}) => {
  const { t } = useTranslation();
  const { light, medium } = useHaptics();
  const { navbarBottom } = useUI();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = zoneThemes[zone];

  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { isRecording, duration, startRecording, stopRecording, cancelRecording } =
    useVoiceRecorder();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if (!text.trim() || isDisabled || isSending) return;

    setIsSending(true);
    await medium();

    try {
      await onSendText(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicPress = async () => {
    await light();
    if (isRecording) {
      const recording = await stopRecording();
      if (recording) {
        await onSendVoice(recording);
      }
    } else {
      await startRecording();
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasText = text.trim().length > 0;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 px-4"
      style={{ paddingBottom: `${navbarBottom + 16}px` }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'flex items-end gap-3 rounded-2xl p-3',
          'bg-glass-bg backdrop-blur-glass',
          'border border-glass-border'
        )}
        style={{
          boxShadow: `0 -10px 40px ${theme.glow}`,
        }}
      >
        {/* Textarea */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('dive.reflectionPlaceholder')}
            disabled={isDisabled || isRecording}
            rows={1}
            className={cn(
              'w-full resize-none bg-transparent text-base text-mist-white',
              'placeholder:text-mist-white/40',
              'focus:outline-none',
              'disabled:opacity-50'
            )}
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-400">
            <motion.div
              className="h-2 w-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm">{formatDuration(duration)}</span>
          </div>
        )}

        {/* Action Button */}
        {hasText ? (
          <button
            onClick={handleSend}
            disabled={isDisabled || isSending}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full',
              'transition-all duration-300 ease-viscous',
              'disabled:opacity-50'
            )}
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 0 15px ${theme.glow}`,
            }}
          >
            <Send className="h-5 w-5 text-void-blue" />
          </button>
        ) : (
          <button
            onClick={handleMicPress}
            disabled={isDisabled}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full',
              'transition-all duration-300 ease-viscous',
              'disabled:opacity-50',
              isRecording ? 'bg-red-500' : 'border border-glass-border bg-glass-bg-hover'
            )}
          >
            {isRecording ? (
              <Square className="h-5 w-5 text-white" />
            ) : (
              <Mic className="h-5 w-5 text-mist-white" />
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
};
