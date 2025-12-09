import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Empty State Component
 * Shown when no messages exist yet
 */
export const EmptyState: FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col items-center justify-center px-8"
    >
      {/* Bioluminescent orb */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="mb-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-biolum-cyan/20 shadow-glow-md">
          <Sparkles size={32} className="text-biolum-cyan drop-shadow-glow" />
        </div>
      </motion.div>

      {/* Greeting text */}
      <h2 className="mb-2 text-center text-2xl font-light text-mist-white">Hi, I'm Anchor</h2>
      <p className="max-w-xs text-center text-base text-mist-white/60">What's on your mind?</p>
    </motion.div>
  );
};
