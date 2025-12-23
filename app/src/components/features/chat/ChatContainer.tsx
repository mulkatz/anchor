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
  // Voice flow tracking: each voice message flow gets a unique key
  // This prevents duplicate keys and avoids key changes that cause re-animation
  const voiceFlowCounterRef = useRef(0);
  const currentPendingIdRef = useRef<string | null>(null);
  const messageFlowMapRef = useRef<Map<string, number>>(new Map());
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
          {/* Detect new voice flow BEFORE the map loop */}
          {(() => {
            const pendingMsg = messages.find((m) => m.id.startsWith('pending-voice-'));
            if (pendingMsg && currentPendingIdRef.current !== pendingMsg.id) {
              // New pending message = new voice flow, increment counter
              voiceFlowCounterRef.current++;
              currentPendingIdRef.current = pendingMsg.id;
            } else if (!pendingMsg && currentPendingIdRef.current) {
              // Pending cleared, reset tracking (but keep the map for existing messages)
              currentPendingIdRef.current = null;
            }
            return null;
          })()}
          {messages.map((message, index) => {
            // Check if we need a date divider before this message
            const showDateDivider =
              index === 0 || !isSameDay(messages[index - 1].createdAt, message.createdAt);
            const isLastMessage = index === messages.length - 1;

            const isPendingAudio = message.id.startsWith('pending-voice-');

            // Determine the React key for this message
            // Voice messages use flow-based keys to prevent duplicate keys and re-animation
            let messageKey: string;
            if (isPendingAudio) {
              // Pending message uses current flow counter
              messageKey = `voice-flow-${voiceFlowCounterRef.current}`;
            } else if (message.hasAudio && messageFlowMapRef.current.has(message.id)) {
              // Previously associated with a flow, use that key forever
              messageKey = `voice-flow-${messageFlowMapRef.current.get(message.id)}`;
            } else if (
              message.hasAudio &&
              message.role === 'user' &&
              hasPendingVoice &&
              !initialMessageIdsRef.current.has(message.id)
            ) {
              // New real audio message replacing pending - associate with current flow
              // Check: hasAudio, is user message, pending flow active, not from initial load
              messageFlowMapRef.current.set(message.id, voiceFlowCounterRef.current);
              messageKey = `voice-flow-${voiceFlowCounterRef.current}`;
            } else {
              // Regular message or non-pending audio
              messageKey = message.id;
            }

            // Skip animation for messages from initial load
            // Note: voice messages sharing a key with pending don't re-animate (same React element)
            const isInitialMessage = initialMessageIdsRef.current.has(message.id);
            const shouldSkipAnimation = isInitialMessage;

            return (
              <div key={messageKey}>
                {showDateDivider && <DateDivider date={getDateDivider(message.createdAt)} />}
                <div ref={isLastMessage ? lastMessageRef : undefined}>
                  <MessageBubble
                    message={message}
                    index={index}
                    skipAnimation={shouldSkipAnimation}
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
