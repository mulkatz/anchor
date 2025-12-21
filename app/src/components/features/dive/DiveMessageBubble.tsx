import { type FC, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DiveMessageBubbleProps {
  children: ReactNode;
  index: number;
  skipAnimation?: boolean;
}

/**
 * Dive Message Bubble Animation Wrapper
 * Slower, deeper animations than regular chat
 * Creates contemplative, underwater feeling
 */
export const DiveMessageBubble: FC<DiveMessageBubbleProps> = ({
  children,
  index,
  skipAnimation = false,
}) => {
  // Deeper rise from the depths animation
  const messageVariants = {
    initial: skipAnimation ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  // Slower stagger for contemplative pacing
  const staggerDelay = skipAnimation ? 0 : Math.min(index, 5) * 0.08;

  const messageTransition = {
    duration: skipAnimation ? 0 : 0.8, // Slower than chat (0.6)
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Viscous easing
    delay: staggerDelay,
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      transition={messageTransition}
      layout
    >
      {children}
    </motion.div>
  );
};
