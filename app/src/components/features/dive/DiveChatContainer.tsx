import { type FC, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { zoneThemes, type DiveZone } from '../../../data/dive-lessons';
import type { DiveMessage } from '../../../models';
import { cn } from '../../../utils/cn';
import { useUI } from '../../../contexts/UIContext';

interface DiveChatContainerProps {
  messages: DiveMessage[];
  isThinking: boolean;
  zone: DiveZone;
}

/**
 * Dive Chat Container
 * Displays messages from the Somatic Guide and user reflections
 * Zone-themed styling for atmospheric experience
 */
export const DiveChatContainer: FC<DiveChatContainerProps> = ({ messages, isThinking, zone }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { navbarBottom } = useUI();
  const theme = zoneThemes[zone];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 pt-4"
      style={{ paddingBottom: `${navbarBottom + 120}px` }}
    >
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.5 }}
          className={cn(
            'mb-6',
            message.role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[90%]'
          )}
        >
          {message.role === 'guide' ? (
            /* Guide Message - Centered, atmospheric */
            <div
              className={cn(
                'rounded-2xl p-5',
                'bg-glass-bg backdrop-blur-glass',
                'border border-glass-border'
              )}
              style={{
                boxShadow: `0 0 30px ${theme.glow}`,
              }}
            >
              <p className="whitespace-pre-wrap text-base leading-relaxed text-mist-white">
                {message.text}
              </p>
            </div>
          ) : (
            /* User Message - Right-aligned, warm */
            <div className={cn('ml-auto rounded-2xl px-5 py-3', 'bg-warm-ember text-void-blue')}>
              <p className="text-sm">{message.text}</p>
              {message.transcriptionStatus === 'pending' && (
                <span className="mt-1 block text-xs text-void-blue/60">Transcribing...</span>
              )}
            </div>
          )}
        </motion.div>
      ))}

      {/* Thinking Indicator */}
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 mr-auto max-w-[90%]"
        >
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl px-5 py-4',
              'bg-glass-bg backdrop-blur-glass',
              'border border-glass-border'
            )}
            style={{ boxShadow: `0 0 20px ${theme.glow}` }}
          >
            <ThinkingDots color={theme.primary} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Animated thinking dots
 */
const ThinkingDots: FC<{ color: string }> = ({ color }) => {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};
