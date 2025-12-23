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
  isInitialLoad?: boolean; // True only during first render batch
}

/**
 * Message Bubble Wrapper
 * Handles Framer Motion animations and routes to correct message component
 */
export const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  index,
  skipAnimation,
  isInitialLoad,
}) => {
  // Slide up + fade in animation
  const messageVariants = {
    initial: skipAnimation ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  // Stagger delay ONLY applies during initial load (when many messages load at once)
  // New messages during conversation should animate immediately (no delay)
  const staggerDelay = skipAnimation || !isInitialLoad ? 0 : Math.min(index, 5) * 0.05;

  const messageTransition = {
    duration: skipAnimation ? 0 : 0.4, // Reduced from 0.6 for snappier feel
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
      // Removed 'layout' prop - it was causing existing messages to animate
      // when new messages arrived, making it look like the wrong message was animating
    >
      {renderMessage()}
    </motion.div>
  );
};
