import { type FC, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { DateDivider } from './DateDivider';
import { ThinkingIndicator } from './ThinkingIndicator';
import { EmptyState } from './EmptyState';
import { useNavbarHeight } from '../../../hooks/useNavbarHeight';
import { getDateDivider } from '../../../utils/temporal';
import type { Message } from '../../../models';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  isThinking: boolean;
  hasPendingVoice?: boolean;
}

/**
 * Chat Container
 * Scrollable message list with smart auto-scroll behavior
 * - Long messages: scroll to show the start so user can read from beginning
 * - Short messages: scroll to bottom as usual
 */
export const ChatContainer: FC<ChatContainerProps> = ({
  messages,
  isLoading,
  isThinking,
  hasPendingVoice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  // Track if this is the initial load (to skip animation and scroll instantly)
  const isInitialLoadRef = useRef(true);
  // Track message IDs that existed on initial load (skip their animation)
  const initialMessageIdsRef = useRef<Set<string>>(new Set());
  // Track which real message ID has taken over the pending audio slot
  const stableKeyMessageIdRef = useRef<string | null>(null);
  const navbarOffset = useNavbarHeight();

  // Capture initial message IDs synchronously during render (before effects run)
  // This ensures we know which messages to skip animation for
  if (isInitialLoadRef.current && messages.length > 0 && initialMessageIdsRef.current.size === 0) {
    messages.forEach((msg) => initialMessageIdsRef.current.add(msg.id));
  }

  /**
   * Smart scroll behavior:
   * - User messages: scroll to bottom (they just sent something, show it)
   * - AI messages: scroll to show the message START with padding from top
   *   This way user can read from the beginning without scrolling up
   */
  const scrollToNewMessage = useCallback(() => {
    if (!containerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const container = containerRef.current;
    const lastMsgData = messages[messages.length - 1];

    // For user messages or if ref not available, scroll to bottom
    if (lastMsgData?.role === 'user' || !lastMessageRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // For AI messages, scroll to position message start near top of visible area
    const lastMessage = lastMessageRef.current;
    const containerRect = container.getBoundingClientRect();
    const messageRect = lastMessage.getBoundingClientRect();

    // Calculate scroll position to place message top ~24px from container top
    const topPadding = 24;
    const scrollTarget = container.scrollTop + (messageRect.top - containerRect.top) - topPadding;

    container.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: 'smooth',
    });
  }, [messages]);

  // Initial scroll: use useLayoutEffect to scroll before browser paints
  // This prevents the visible "jump" when navigating back to the chat
  useLayoutEffect(() => {
    if (isInitialLoadRef.current && messages.length > 0 && containerRef.current) {
      isInitialLoadRef.current = false;
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length]);

  // Handle scroll for new messages during conversation
  useEffect(() => {
    const messageCount = messages.length;
    const prevCount = prevMessageCountRef.current;
    const isNewMessage = messageCount > prevCount;

    if (isNewMessage && messageCount > 0) {
      // New message during conversation: use smooth scroll
      const timer = setTimeout(scrollToNewMessage, 100);
      prevMessageCountRef.current = messageCount;
      return () => clearTimeout(timer);
    }

    prevMessageCountRef.current = messageCount;
  }, [messages, scrollToNewMessage]);

  // Scroll to bottom when thinking starts
  useEffect(() => {
    if (isThinking) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isThinking]);

  // Calculate the space needed for input area: navbar offset + input height (~80px) + gap (16px)
  const inputAreaHeight = navbarOffset > 0 ? navbarOffset + 80 + 16 : 160;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-0 overflow-y-auto px-4 pb-4 pt-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
      style={{
        bottom: `${inputAreaHeight}px`,
      }}
    >
      {messages.length === 0 && !isThinking && !isLoading ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((message, index) => {
            // Check if we need a date divider before this message
            const showDateDivider =
              index === 0 || !isSameDay(messages[index - 1].createdAt, message.createdAt);
            const isLastMessage = index === messages.length - 1;

            // Use stable key for audio messages in "pending voice" flow
            // This prevents re-animation when real message replaces pending
            const isPendingAudio = message.id.startsWith('pending-voice-');

            // When real audio message takes over pending slot, remember its ID
            const isReplacingPending =
              isLastMessage && message.hasAudio && hasPendingVoice && !isPendingAudio;
            if (isReplacingPending) {
              stableKeyMessageIdRef.current = message.id;
            }

            // Use stable key for pending audio OR for the message that replaced it
            const usesStableSlot = isPendingAudio || message.id === stableKeyMessageIdRef.current;
            const messageKey = usesStableSlot ? 'pending-audio-slot' : message.id;
            // Skip animation for: messages from initial load, or audio message replacements
            const isInitialMessage = initialMessageIdsRef.current.has(message.id);
            const shouldSkipAnimation =
              isInitialMessage ||
              isReplacingPending ||
              message.id === stableKeyMessageIdRef.current;

            return (
              <div key={messageKey}>
                {showDateDivider && <DateDivider date={getDateDivider(message.createdAt)} />}
                <div ref={isLastMessage ? lastMessageRef : undefined}>
                  <MessageBubble
                    message={message}
                    index={index}
                    skipAnimation={shouldSkipAnimation && !isPendingAudio}
                    isInitialLoad={isInitialMessage}
                  />
                </div>
              </div>
            );
          })}

          {isThinking && <ThinkingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

/**
 * Helper: Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
