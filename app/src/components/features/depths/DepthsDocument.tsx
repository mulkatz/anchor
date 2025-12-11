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
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastVisibleDateRef = useRef<string | null>(null);

  // Auto-scroll to bottom on mount (delayed to allow page transition animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'instant' });
      }
    }, 650); // After 0.6s page transition
    return () => clearTimeout(timer);
  }, []);

  // Set up intersection observer for lazy loading (scroll up)
  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasMore || !hasScrolled) return;

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
  }, [onLoadMore, isLoadingMore, hasMore, hasScrolled]);

  // Haptic feedback on day boundary scroll + track scroll state
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    // Track that user has scrolled (enables load-more trigger)
    if (!hasScrolled) {
      setHasScrolled(true);
    }

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
  }, [hasScrolled]);

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
    // Outer wrapper clips scrollbar at rounded corners
    <div className="mx-3 my-4 flex min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/25 shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:mx-4">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-6"
        onScroll={handleScroll}
      >
        {/* Invisible load-more trigger at top */}
        {hasMore && hasScrolled && <div ref={loadMoreTriggerRef} className="h-1" />}

        {/* Document content - flows naturally */}
        {sortedDates.map((date, index) => (
          <div key={date}>
            {/* Date divider */}
            <DateDivider date={date} isFirst={index === 0} />

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
          isFirstDateDivider={sortedDates.length === 0}
        />

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
};
