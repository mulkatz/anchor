import { type FC } from 'react';
import { motion } from 'framer-motion';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { CrisisCard } from './CrisisCard';
import { AudioMessageBubble } from './AudioMessageBubble';
import type { Message } from '../../../models';

interface MessageBubbleProps {
  message: Message;
  index: number;
  skipAnimation?: boolean;
}

/**
 * Message Bubble Wrapper
 * Handles Framer Motion animations and routes to correct message component
 */
export const MessageBubble: FC<MessageBubbleProps> = ({ message, index, skipAnimation }) => {
  // Slide up + fade in animation
  const messageVariants = {
    initial: skipAnimation ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  // Cap stagger delay at 5 messages (0.25s max) so new messages appear quickly
  const staggerDelay = skipAnimation ? 0 : Math.min(index, 5) * 0.05;

  const messageTransition = {
    duration: skipAnimation ? 0 : 0.6,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Viscous easing
    delay: staggerDelay,
  };

  const renderMessage = () => {
    switch (message.role) {
      case 'user':
        // If message has audio, render audio bubble, otherwise regular user message
        if (message.hasAudio) {
          return <AudioMessageBubble message={message} />;
        }
        return <UserMessage text={message.text} timestamp={message.createdAt} />;

      case 'assistant':
        return <AssistantMessage text={message.text} timestamp={message.createdAt} />;

      case 'crisis':
        return <CrisisCard />;

      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      transition={messageTransition}
      layout // Smooth repositioning when new messages arrive
    >
      {renderMessage()}
    </motion.div>
  );
};
