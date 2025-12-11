import { type FC, useRef, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { DateDivider } from './DateDivider';
import type { JournalEntry, JournalSession } from '../../../models';

interface ActiveEditorProps {
  activeSession: JournalSession | null;
  todayEntry: JournalEntry | null;
  onTextChange: (text: string) => void;
  showDateDivider: boolean;
}

export const ActiveEditor: FC<ActiveEditorProps> = ({
  activeSession,
  todayEntry,
  onTextChange,
  showDateDivider,
}) => {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localText, setLocalText] = useState(activeSession?.text || '');
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

  const today = format(new Date(), 'yyyy-MM-dd');

  // Render fixed sessions from today first, then the active editor
  const fixedTodaySessions = todayEntry?.sessions.filter((s) => s.fixedAt !== null) || [];

  return (
    <>
      {/* Show today's date divider if needed */}
      {showDateDivider && <DateDivider date={today} />}

      {/* Render fixed sessions from today */}
      {fixedTodaySessions.map((session) => (
        <p
          key={session.id}
          className="whitespace-pre-wrap break-words font-light leading-relaxed text-mist-white/60"
          style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
        >
          {session.text}
        </p>
      ))}

      {/* Active writing area */}
      <textarea
        ref={textareaRef}
        value={localText}
        onChange={handleTextChange}
        placeholder={t('depths.placeholder')}
        className="min-h-[120px] w-full resize-none overflow-hidden break-words bg-transparent font-light leading-relaxed text-biolum-cyan placeholder-mist-white/30 caret-biolum-cyan outline-none transition-colors duration-[600ms] ease-viscous"
        style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
        rows={1}
        autoFocus
      />
    </>
  );
};
