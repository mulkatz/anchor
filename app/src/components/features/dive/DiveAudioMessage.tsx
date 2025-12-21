import { type FC } from 'react';
import { AudioWaveform, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Message } from '../../../models';

interface DiveAudioMessageProps {
  message: Message;
  onRetry?: () => void;
}

/**
 * Dive Audio Message
 * Centered transcription with warm-ember tint
 * Matches user message styling
 */
export const DiveAudioMessage: FC<DiveAudioMessageProps> = ({ message, onRetry }) => {
  const { t } = useTranslation();
  const isTranscribing = message.transcriptionStatus === 'pending';
  const isFailed = message.transcriptionStatus === 'failed';
  const isCompleted = message.transcriptionStatus === 'completed';

  return (
    <div className="mb-14 flex justify-center px-8">
      <div className="max-w-[85%] text-center">
        {/* Transcribing State - minimal */}
        {isTranscribing && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AudioWaveform size={20} className="mx-auto text-warm-ember/50" />
          </motion.div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={18} className="text-danger/60" />
            <p className="text-sm text-mist-white/50">{t('audio.transcriptionFailed')}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 text-xs text-mist-white/40 transition-colors hover:text-mist-white/60"
              >
                <RefreshCw size={12} />
                <span>{t('audio.retry')}</span>
              </button>
            )}
          </div>
        )}

        {/* Completed State - warm-ember tinted text */}
        {isCompleted && (
          <p className="text-base leading-loose text-warm-ember/55">{message.text}</p>
        )}
      </div>
    </div>
  );
};
