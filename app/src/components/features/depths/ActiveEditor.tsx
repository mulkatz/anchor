import { type FC, useRef, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { DateDivider } from './DateDivider';
import { PromptSuggestions } from './PromptSuggestions';
import { cn } from '../../../utils/cn';
import type { JournalEntry, JournalSession } from '../../../models';

interface ActiveEditorProps {
  activeSession: JournalSession | null;
  todayEntry: JournalEntry | null;
  onTextChange: (text: string) => void;
  showDateDivider: boolean;
  isFirstDateDivider?: boolean;
}

export const ActiveEditor: FC<ActiveEditorProps> = ({
  activeSession,
  todayEntry,
  onTextChange,
  showDateDivider,
  isFirstDateDivider,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localText, setLocalText] = useState(activeSession?.text || '');
  const [showPrompts, setShowPrompts] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local text with active session
  useEffect(() => {
    setLocalText(activeSession?.text || '');
  }, [activeSession?.id]);

  // Auto-resize textarea and scroll into view
  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    resizeTextarea();
    // Scroll textarea into view when content changes
    if (textareaRef.current && localText) {
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [localText, resizeTextarea]);

  // Handle text input with debounce
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setLocalText(newText);

      // Debounce the actual save
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onTextChange(newText);
      }, 300);
    },
    [onTextChange]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Handle prompt selection
  const handleSelectPrompt = useCallback(
    (promptText: string) => {
      const newText = promptText + '\n\n';
      setLocalText(newText);
      onTextChange(newText);
      setShowPrompts(false);
      // Focus textarea after selecting prompt
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newText.length, newText.length);
        }
      }, 100);
    },
    [onTextChange]
  );

  const today = format(new Date(), 'yyyy-MM-dd');

  // Render fixed sessions from today first, then the active editor
  const fixedTodaySessions = todayEntry?.sessions.filter((s) => s.fixedAt !== null) || [];

  return (
    <>
      {/* Show today's date divider if needed */}
      {showDateDivider && <DateDivider date={today} isFirst={isFirstDateDivider} />}

      {/* Render fixed sessions from today */}
      {fixedTodaySessions.map((session) => (
        <p
          key={session.id}
          className="whitespace-pre-wrap break-words font-light leading-relaxed text-mist-white/70"
          style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
        >
          {session.text}
        </p>
      ))}

      {/* Active writing area with subtle dashed border */}
      {/* Sized and positioned for balanced spacing */}
      <div
        className={cn(
          'relative mt-6 rounded-xl px-[10px] py-4',
          'border border-dashed border-biolum-cyan/20'
        )}
        style={{ width: 'calc(100% + 20px)', marginLeft: '-10px' }}
      >
        {/* Prompt Suggestions (Soundings) - show when empty */}
        <PromptSuggestions
          visible={showPrompts && !localText.trim()}
          onSelectPrompt={handleSelectPrompt}
          onDismiss={() => setShowPrompts(false)}
        />

        {/* Subtle text glow animation styles */}
        <style>{`
          @keyframes textGlow {
            0%, 100% { text-shadow: 0 0 4px rgba(100, 255, 218, 0.3); }
            50% { text-shadow: 0 0 8px rgba(100, 255, 218, 0.5); }
          }
          .text-glow-pulse { animation: textGlow 3s ease-in-out infinite; }
        `}</style>

        <textarea
          ref={textareaRef}
          value={localText}
          onChange={handleTextChange}
          placeholder={t('depths.placeholder')}
          className={cn(
            'min-h-[100px] w-full resize-none overflow-hidden',
            'break-words bg-transparent font-light leading-relaxed',
            'text-biolum-cyan placeholder-mist-white/25',
            'caret-biolum-cyan outline-none',
            // Subtle pulsing text glow when has content
            localText && 'text-glow-pulse'
          )}
          style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
          rows={1}
        />
      </div>
    </>
  );
};
