import { type FC } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

/**
 * Thinking Indicator
 * Bioluminescent pulse animation (NOT three dots)
 * Shows when AI is generating a response
 */
export const ThinkingIndicator: FC = () => {
  // Bioluminescent pulse animation
  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.6, 1, 0.6],
      boxShadow: [
        '0 0 20px rgba(100, 255, 218, 0.4)',
        '0 0 40px rgba(100, 255, 218, 0.6)',
        '0 0 20px rgba(100, 255, 218, 0.4)',
      ],
    },
  };

  return (
    <div className="mb-4 flex justify-start">
      <div
        className={cn(
          'rounded-3xl rounded-tl-lg px-6 py-4',
          'bg-glass-bg backdrop-blur-glass',
          'border border-glass-border shadow-glass'
        )}
      >
        <motion.div
          variants={pulseVariants}
          animate="pulse"
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-3 w-3 rounded-full bg-biolum-cyan"
        />
      </div>
    </div>
  );
};
