import { type FC } from 'react';
import { ChatContainer } from '../components/features/chat/ChatContainer';
import { ChatInput } from '../components/features/chat/ChatInput';
import { useChat } from '../hooks/useChat';

/**
 * Chat Page - "Deep Talk"
 * Main page for therapeutic AI chat with Anchor
 */
export const ChatPage: FC = () => {
  const { messages, isThinking, error, sendMessage } = useChat();

  return (
    <div className="flex h-full flex-col bg-void-blue">
      {/* Header */}
      <header className="safe-area-top border-b border-glass-border px-6 py-4">
        <h1 className="text-2xl font-light text-mist-white">Deep Talk</h1>
        <p className="text-sm text-mist-white/60">with Anchor</p>
      </header>

      {/* Error Banner (if any) */}
      {error && (
        <div className="border-b border-danger/50 bg-danger/20 px-6 py-3">
          <p className="text-sm text-mist-white">{error}</p>
        </div>
      )}

      {/* Message List (scrollable) */}
      <ChatContainer messages={messages} isThinking={isThinking} />

      {/* Input Area (fixed bottom) */}
      <ChatInput onSend={sendMessage} disabled={isThinking} />
    </div>
  );
};
