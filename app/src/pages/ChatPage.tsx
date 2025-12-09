import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Plus } from 'lucide-react';
import { ChatContainer } from '../components/features/chat/ChatContainer';
import { ChatInput } from '../components/features/chat/ChatInput';
import { useChat } from '../hooks/useChat';
import { useConversation } from '../hooks/useConversation';
import { useHaptics } from '../hooks/useHaptics';
import { cn } from '../utils/cn';

/**
 * Chat Page - "Deep Talk"
 * Main page for therapeutic AI chat with Anchor
 */
export const ChatPage: FC = () => {
  const navigate = useNavigate();
  const { light } = useHaptics();
  const {
    activeConversation,
    isLoading: conversationLoading,
    createNewConversation,
  } = useConversation();

  const { messages, isThinking, error, sendMessage } = useChat({
    conversationId: activeConversation?.id || null,
  });

  // Auto-create first conversation if none exists
  useEffect(() => {
    if (!conversationLoading && !activeConversation) {
      createNewConversation();
    }
  }, [conversationLoading, activeConversation, createNewConversation]);

  const handleNewChat = async () => {
    await light();
    await createNewConversation();
    // Cloud function will auto-archive current conversation
  };

  const handleOpenArchive = async () => {
    await light();
    navigate('/archive');
  };

  return (
    <div className="flex h-full flex-col bg-void-blue">
      {/* Header */}
      <header className="safe-area-top flex items-center justify-between border-b border-glass-border px-6 py-4">
        <div>
          <h1 className="text-2xl font-light text-mist-white">Deep Talk</h1>
          <p className="text-sm text-mist-white/60">with Anchor</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Archive Button */}
          <button
            onClick={handleOpenArchive}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2',
              'bg-glass-bg backdrop-blur-glass',
              'border border-glass-border',
              'text-mist-white/80 transition-all duration-300 ease-viscous',
              'hover:bg-glass-bg-hover active:scale-95'
            )}
          >
            <Archive size={18} />
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2',
              'bg-biolum-cyan text-void-blue',
              'shadow-glow-md transition-all duration-300 ease-viscous',
              'active:scale-95'
            )}
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New</span>
          </button>
        </div>
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
      <ChatInput onSend={sendMessage} disabled={isThinking || !activeConversation} />
    </div>
  );
};
