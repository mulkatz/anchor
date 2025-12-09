import { type FC, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import { EmptyState } from './EmptyState';
import { useNavbarHeight } from '../../../hooks/useNavbarHeight';
import type { Message } from '../../../models';

interface ChatContainerProps {
  messages: Message[];
  isThinking: boolean;
}

/**
 * Chat Container
 * Scrollable message list with auto-scroll to latest message
 */
export const ChatContainer: FC<ChatContainerProps> = ({ messages, isThinking }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navbarOffset = useNavbarHeight();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Calculate the space needed for input area: navbar offset + input height (~80px) + gap (16px)
  const inputAreaHeight = navbarOffset > 0 ? navbarOffset + 80 + 16 : 160;

  return (
    <div
      className="absolute left-0 right-0 top-0 overflow-y-auto px-4 pb-4 pt-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
      style={{
        bottom: `${inputAreaHeight}px`,
      }}
    >
      {messages.length === 0 && !isThinking ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {isThinking && <ThinkingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
