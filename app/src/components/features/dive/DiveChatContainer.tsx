import { type FC, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, ChevronRight, Anchor } from 'lucide-react';
import { AssistantMessage } from '../chat/AssistantMessage';
import { UserMessage } from '../chat/UserMessage';
import { AudioMessageBubble } from '../chat/AudioMessageBubble';
import { ThinkingIndicator } from '../chat/ThinkingIndicator';
import { useNavbarHeight } from '../../../hooks/useNavbarHeight';
import type { DiveMessage, Message } from '../../../models';
import { cn } from '../../../utils/cn';

interface DiveChatContainerProps {
  messages: DiveMessage[];
  isThinking: boolean;
  isLessonComplete: boolean;
  onNavigateBack: () => void;
}

/**
 * Dive Chat Container
 * Reuses standard chat components for consistent UX
 * Displays messages from the Somatic Guide and user reflections
 */
export const DiveChatContainer: FC<DiveChatContainerProps> = ({
  messages,
  isThinking,
  isLessonComplete,
  onNavigateBack,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const navbarOffset = useNavbarHeight();

  // Smart scroll: show start of new long messages, scroll to bottom for short ones
  const scrollToNewMessage = useCallback(() => {
    if (!containerRef.current || !lastMessageRef.current) {
      // Fallback to bottom scroll
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const container = containerRef.current;
    const lastMessage = lastMessageRef.current;
    const containerRect = container.getBoundingClientRect();
    const messageRect = lastMessage.getBoundingClientRect();

    // If the message is taller than 60% of the visible container, scroll to show its top
    const visibleHeight = containerRect.height;
    const messageHeight = messageRect.height;

    if (messageHeight > visibleHeight * 0.6) {
      // Long message: scroll to show the start with some padding
      lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Short message: scroll to bottom as usual
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

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

  // Scroll to bottom when thinking starts or lesson completes
  useEffect(() => {
    if (isThinking || isLessonComplete) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isThinking, isLessonComplete]);

  // Calculate the space needed for input area: navbar offset + input height (~80px) + gap (16px)
  const inputAreaHeight = navbarOffset > 0 ? navbarOffset + 80 + 16 : 160;

  // Map DiveMessage to Message format for reusing chat components
  const mapToMessage = (msg: DiveMessage): Message => ({
    id: msg.id,
    conversationId: msg.sessionId,
    userId: msg.userId,
    text: msg.text,
    role: msg.role === 'guide' ? 'assistant' : 'user',
    createdAt: msg.createdAt,
    hasAudio: msg.hasAudio,
    audioPath: msg.audioPath,
    audioDuration: msg.audioDuration,
    transcriptionStatus: msg.transcriptionStatus,
    metadata: msg.metadata,
  });

  // Animation variants
  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  const messageTransition = (index: number) => ({
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    delay: index * 0.05,
  });

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-0 overflow-y-auto px-4 pb-4 pt-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-thumb]:transition-colors hover:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
      style={{
        bottom: `${inputAreaHeight}px`,
      }}
    >
      {messages.map((message, index) => {
        const mappedMessage = mapToMessage(message);
        const isLastMessage = index === messages.length - 1;

        return (
          <motion.div
            key={message.id}
            ref={isLastMessage ? lastMessageRef : undefined}
            variants={messageVariants}
            initial="initial"
            animate="animate"
            transition={messageTransition(index)}
            layout
          >
            {message.role === 'guide' ? (
              <AssistantMessage text={message.text} timestamp={message.createdAt} />
            ) : message.hasAudio ? (
              <AudioMessageBubble message={mappedMessage} />
            ) : (
              <UserMessage text={message.text} timestamp={message.createdAt} />
            )}
          </motion.div>
        );
      })}

      {isThinking && <ThinkingIndicator />}

      {/* Lesson Complete Card */}
      {isLessonComplete && !isThinking && <LessonCompleteCard onNavigateBack={onNavigateBack} />}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

/**
 * Lesson Complete Card
 * Shown when the AI marks the lesson as complete
 * Celebrates the user's progress and offers navigation back
 */
interface LessonCompleteCardProps {
  onNavigateBack: () => void;
}

const LessonCompleteCard: FC<LessonCompleteCardProps> = ({ onNavigateBack }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      }}
      className="mx-auto my-8 max-w-sm px-4"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-gradient-to-br from-biolum-cyan/20 via-glass-bg to-warm-ember/10',
          'border border-biolum-cyan/30',
          'p-6 text-center',
          'shadow-lg'
        )}
      >
        {/* Decorative background elements */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-biolum-cyan/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-warm-ember/10 blur-3xl" />

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center"
        >
          <div className="absolute inset-0 animate-pulse rounded-full bg-biolum-cyan/20" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-biolum-cyan to-biolum-cyan/80">
            <Anchor className="h-7 w-7 text-void-blue" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-1 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-warm-ember" />
            <span className="text-xs font-medium uppercase tracking-wider text-warm-ember">
              {t('dive.lessonComplete.label')}
            </span>
            <Sparkles className="h-4 w-4 text-warm-ember" />
          </div>
          <h3 className="text-xl font-medium text-mist-white">{t('dive.lessonComplete.title')}</h3>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 text-sm leading-relaxed text-mist-white/70"
        >
          {t('dive.lessonComplete.description')}
        </motion.p>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onNavigateBack}
          className={cn(
            'mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3',
            'bg-biolum-cyan font-medium text-void-blue',
            'transition-all duration-300 ease-viscous',
            'hover:shadow-glow-md active:scale-95'
          )}
        >
          {t('dive.lessonComplete.continue')}
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};
