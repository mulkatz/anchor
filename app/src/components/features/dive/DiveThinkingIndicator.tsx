import { type FC } from 'react';
import { motion } from 'framer-motion';

interface DiveThinkingIndicatorProps {
  zoneColor: string;
}

/**
 * Dive Thinking Indicator
 * Subtle zone-colored pulse - like distant bioluminescence
 */
export const DiveThinkingIndicator: FC<DiveThinkingIndicatorProps> = ({ zoneColor }) => {
  // Convert hex to rgba for glow effects
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="mb-10 flex justify-center">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: zoneColor,
          boxShadow: `0 0 12px ${hexToRgba(zoneColor, 0.3)}`,
        }}
      />
    </div>
  );
};
