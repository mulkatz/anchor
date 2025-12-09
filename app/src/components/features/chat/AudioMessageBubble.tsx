import { type FC } from 'react';
import { AudioWaveform, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';
import type { Message } from '../../../models';

interface AudioMessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

/**
 * Audio Message Bubble Component
 * Displays voice messages in three states: transcribing, completed, failed
 */
export const AudioMessageBubble: FC<AudioMessageBubbleProps> = ({ message, onRetry }) => {
  const isTranscribing = message.transcriptionStatus === 'pending';
  const isFailed = message.transcriptionStatus === 'failed';
  const isCompleted = message.transcriptionStatus === 'completed';

  const duration = message.audioDuration ? Math.floor(message.audioDuration / 1000) : 0;
  const formattedDuration = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;

  const showLowConfidenceWarning = message.metadata?.lowConfidenceWarning && isCompleted;

  return (
    <div
      className={cn(
        'max-w-[90%] rounded-3xl',
        'bg-warm-ember text-void-blue',
        'px-4 py-3',
        'shadow-md',
        'rounded-tr-md', // Sharp top-right corner for user messages
        'relative'
      )}
    >
      {/* Transcribing State */}
      {isTranscribing && (
        <div className="flex items-center gap-3">
          {/* Animated waveform icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex-shrink-0"
          >
            <AudioWaveform size={24} className="text-biolum-cyan" />
          </motion.div>

          {/* Transcribing text */}
          <div className="flex-1">
            <div className="text-sm font-medium">Transcribing your message...</div>
            <div className="mt-1 text-xs opacity-70">{formattedDuration}</div>
          </div>

          {/* Pulsing dots indicator */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-1.5 w-1.5 rounded-full bg-void-blue/50"
              />
            ))}
          </div>
        </div>
      )}

      {/* Failed State */}
      {isFailed && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle size={20} className="flex-shrink-0 text-danger" />
            <div className="text-sm font-medium">Transcription failed</div>
          </div>
          <div className="mb-3 text-xs opacity-70">
            Unable to transcribe audio. Please try typing your message instead.
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                'flex items-center gap-2',
                'text-xs font-medium',
                'rounded-full px-3 py-1.5',
                'bg-void-blue/10 hover:bg-void-blue/20',
                'transition-colors duration-200'
              )}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Completed State */}
      {isCompleted && (
        <div>
          {/* Low confidence warning banner */}
          {showLowConfidenceWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mb-3 rounded-lg border border-yellow-500/30 bg-yellow-500/20 p-2"
            >
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle size={14} className="flex-shrink-0 text-yellow-600" />
                <span className="text-yellow-700">
                  Audio was unclear. Transcription may not be accurate.
                </span>
              </div>
            </motion.div>
          )}

          {/* Transcribed text */}
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.text}
          </div>

          {/* Audio metadata footer */}
          <div className="mt-2 flex items-center gap-2 border-t border-void-blue/10 pt-2">
            {/* Waveform badge */}
            <AudioWaveform size={14} className="text-biolum-cyan" />

            {/* Duration badge */}
            <span className="font-mono text-xs opacity-70">{formattedDuration}</span>

            {/* Confidence indicator (if available) */}
            {message.metadata?.transcriptionConfidence !== undefined && (
              <span
                className={cn(
                  'ml-auto text-xs opacity-70',
                  message.metadata.transcriptionConfidence >= 0.9 && 'text-success',
                  message.metadata.transcriptionConfidence >= 0.7 &&
                    message.metadata.transcriptionConfidence < 0.9 &&
                    'text-yellow-600',
                  message.metadata.transcriptionConfidence < 0.7 && 'text-danger'
                )}
                title={`Confidence: ${(message.metadata.transcriptionConfidence * 100).toFixed(0)}%`}
              >
                {(message.metadata.transcriptionConfidence * 100).toFixed(0)}% confident
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
