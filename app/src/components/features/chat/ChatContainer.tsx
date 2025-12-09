import { type FC, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import { EmptyState } from './EmptyState';
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex-1 overflow-y-auto pb-40 pt-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
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
