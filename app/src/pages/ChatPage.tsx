import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Archive, Plus } from 'lucide-react';
import { ChatContainer } from '../components/features/chat/ChatContainer';
import { ChatInput } from '../components/features/chat/ChatInput';
import { useChat } from '../hooks/useChat';
import { useConversation } from '../hooks/useConversation';
import { useHaptics } from '../hooks/useHaptics';
import { useApp } from '../contexts/AppContext';
import { cn } from '../utils/cn';

/**
 * Chat Page - "Deep Talk"
 * Main page for therapeutic AI chat with Anchor
 */
export const ChatPage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { light } = useHaptics();
  const { userId, isAuthLoading } = useApp();
  const {
    activeConversation,
    isLoading: conversationLoading,
    createNewConversation,
    error: conversationError,
  } = useConversation();

  const { messages, isThinking, error, sendMessage, sendVoiceMessage } = useChat({
    conversationId: activeConversation?.id || null,
  });

  // Auto-create first conversation if none exists (only when authenticated)
  useEffect(() => {
    if (!isAuthLoading && !conversationLoading && !activeConversation && userId) {
      console.log('Auto-creating first conversation...');
      createNewConversation().catch((err) => {
        console.error('Failed to auto-create conversation:', err);
      });
    }
  }, [isAuthLoading, conversationLoading, activeConversation, createNewConversation, userId]);

  const handleNewChat = async () => {
    await light();
    try {
      await createNewConversation();
      console.log('New conversation created successfully');
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleOpenArchive = async () => {
    await light();
    navigate('/archive');
  };

  return (
    <div className="flex h-screen w-full flex-col bg-void-blue/85">
      {/* Header */}
      <header className="safe-area-top flex shrink-0 items-center justify-between border-b border-glass-border px-6 py-4">
        <div>
          <h1 className="text-2xl font-light text-mist-white">{t('chat.title')}</h1>
          <p className="text-sm text-mist-white/60">{t('chat.subtitle')}</p>
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
            <span className="text-sm font-medium">{t('chat.newButton')}</span>
          </button>
        </div>
      </header>

      {/* Error Banner (if any) */}
      {(error || conversationError) && (
        <div className="shrink-0 border-b border-danger/50 bg-danger/20 px-6 py-3">
          <p className="text-sm text-mist-white">{error || conversationError}</p>
        </div>
      )}

      {/* Message List (scrollable) - This is the ONLY scrollable area */}
      <div className="relative flex-1 overflow-hidden">
        <ChatContainer messages={messages} isThinking={isThinking} />
        {/* Input Area (absolute positioned within the flex container) */}
        <ChatInput
          onSend={sendMessage}
          onSendVoice={sendVoiceMessage}
          disabled={isThinking || !activeConversation}
        />
      </div>
    </div>
  );
};
