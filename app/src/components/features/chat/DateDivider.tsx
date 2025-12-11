import { type FC } from 'react';
import { motion } from 'framer-motion';

interface DateDividerProps {
  date: string; // e.g., "Today", "Yesterday", "December 8"
}

/**
 * Date Divider
 * Shows date labels between message groups in the chat
 */
export const DateDivider: FC<DateDividerProps> = ({ date }) => {
  return (
    <motion.div
      className="my-6 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Viscous easing
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/10" />
        <span className="text-xs font-medium text-mist-white/40">{date}</span>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/10" />
      </div>
    </motion.div>
  );
};
