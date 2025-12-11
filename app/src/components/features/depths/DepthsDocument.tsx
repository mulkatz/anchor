import { type FC, useRef, useEffect, useCallback, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { DateDivider } from './DateDivider';
import { SessionText } from './SessionText';
import { ActiveEditor } from './ActiveEditor';
import type { JournalEntry, JournalSession } from '../../../models';

interface DepthsDocumentProps {
  entries: JournalEntry[];
  todayEntry: JournalEntry | null;
  activeSession: JournalSession | null;
  onTextChange: (text: string) => void;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
}

export const DepthsDocument: FC<DepthsDocumentProps> = ({
  entries,
  todayEntry,
  activeSession,
  onTextChange,
  onLoadMore,
  hasMore,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastVisibleDateRef = useRef<string | null>(null);

  // Auto-scroll to bottom on mount
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, []);

  // Set up intersection observer for lazy loading (scroll up)
  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && hasMore) {
          setIsLoadingMore(true);
          await onLoadMore();
          setIsLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreTriggerRef.current);
    return () => observer.disconnect();
  }, [onLoadMore, isLoadingMore, hasMore]);

  // Haptic feedback on day boundary scroll
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    // Find all date dividers and check which one is visible
    const dateDividers = scrollContainerRef.current.querySelectorAll('[data-date]');
    const containerRect = scrollContainerRef.current.getBoundingClientRect();

    for (const divider of dateDividers) {
      const rect = divider.getBoundingClientRect();
      // Check if the divider is near the top of the visible area
      if (rect.top >= containerRect.top && rect.top <= containerRect.top + 100) {
        const date = divider.getAttribute('data-date');
        if (date && date !== lastVisibleDateRef.current) {
          lastVisibleDateRef.current = date;
          // Light haptic on day boundary
          Haptics.impact({ style: ImpactStyle.Light });
          break;
        }
      }
    }
  }, []);

  // Group entries by date for rendering
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Get all sessions across all entries, grouped by date
  const sessionsByDate = sortedEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(...entry.sessions);
      return acc;
    },
    {} as Record<string, JournalSession[]>
  );

  // Get sorted dates
  const sortedDates = Object.keys(sessionsByDate).sort();

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 sm:px-6"
      onScroll={handleScroll}
    >
      {/* Load more trigger at top */}
      {hasMore && (
        <div ref={loadMoreTriggerRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-biolum-cyan border-t-transparent" />
          )}
        </div>
      )}

      {/* Document content - flows naturally */}
      {sortedDates.map((date) => (
        <div key={date}>
          {/* Date divider */}
          <DateDivider date={date} />

          {/* Sessions for this date */}
          {sessionsByDate[date].map((session) => (
            <SessionText
              key={session.id}
              session={session}
              isActive={activeSession?.id === session.id}
            />
          ))}
        </div>
      ))}

      {/* Active editor for today */}
      <ActiveEditor
        activeSession={activeSession}
        todayEntry={todayEntry}
        onTextChange={onTextChange}
        showDateDivider={!sortedDates.includes(new Date().toISOString().split('T')[0])}
      />

      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
