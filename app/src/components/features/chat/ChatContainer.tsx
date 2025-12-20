import { type FC, useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { DateDivider } from './DateDivider';
import { ThinkingIndicator } from './ThinkingIndicator';
import { EmptyState } from './EmptyState';
import { useNavbarHeight } from '../../../hooks/useNavbarHeight';
import { getDateDivider } from '../../../utils/temporal';
import type { Message } from '../../../models';

interface ChatContainerProps {
  messages: Message[];
  isThinking: boolean;
}

/**
 * Chat Container
 * Scrollable message list with smart auto-scroll behavior
 * - Long messages: scroll to show the start so user can read from beginning
 * - Short messages: scroll to bottom as usual
 */
export const ChatContainer: FC<ChatContainerProps> = ({ messages, isThinking }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const navbarOffset = useNavbarHeight();

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

  // Handle scroll when messages change
  useEffect(() => {
    const messageCount = messages.length;
    const isNewMessage = messageCount > prevMessageCountRef.current;

    if (isNewMessage && messageCount > 0) {
      // Small delay to ensure the DOM has updated with the new message
      const timer = setTimeout(scrollToNewMessage, 100);
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
      {messages.length === 0 && !isThinking ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((message, index) => {
            // Check if we need a date divider before this message
            const showDateDivider =
              index === 0 || !isSameDay(messages[index - 1].createdAt, message.createdAt);
            const isLastMessage = index === messages.length - 1;

            return (
              <div key={message.id}>
                {showDateDivider && <DateDivider date={getDateDivider(message.createdAt)} />}
                <div ref={isLastMessage ? lastMessageRef : undefined}>
                  <MessageBubble message={message} index={index} />
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
