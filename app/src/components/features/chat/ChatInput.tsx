import { type FC, useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

/**
 * Chat Input Component
 * Auto-resizing textarea with glass morphism styling
 */
export const ChatInput: FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { light } = useHaptics();

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

  return (
    <div
      className={cn(
        'fixed bottom-20 left-0 right-0',
        'px-6 pb-3 pt-3',
        'bg-void-blue/90 backdrop-blur-glass',
        'border-t border-glass-border'
      )}
    >
      <div
        className={cn(
          'flex items-end gap-3',
          'bg-glass-bg backdrop-blur-glass',
          'rounded-3xl border border-glass-border',
          'px-4 py-3 shadow-glass'
        )}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What's on your mind?"
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent text-mist-white',
            'placeholder:text-mist-white/40',
            'resize-none outline-none',
            'max-h-32 min-h-[24px]',
            'disabled:opacity-50'
          )}
          rows={1}
        />

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
      </div>
    </div>
  );
};
