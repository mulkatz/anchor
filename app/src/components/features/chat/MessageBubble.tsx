import { type FC } from 'react';
import { motion } from 'framer-motion';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { CrisisCard } from './CrisisCard';
import type { Message } from '../../../models';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

/**
 * Message Bubble Wrapper
 * Handles Framer Motion animations and routes to correct message component
 */
export const MessageBubble: FC<MessageBubbleProps> = ({ message, index }) => {
  // Slide up + fade in animation
  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  const messageTransition = {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Viscous easing
    delay: index * 0.05, // Stagger delay
  };

  const renderMessage = () => {
    switch (message.role) {
      case 'user':
        return <UserMessage text={message.text} />;

      case 'assistant':
        return <AssistantMessage text={message.text} />;

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
