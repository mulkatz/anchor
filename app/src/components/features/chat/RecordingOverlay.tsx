import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

interface RecordingOverlayProps {
  duration: number; // seconds
  onCancel: () => void;
}

/**
 * Recording Overlay Component
 * Fullscreen overlay shown during voice recording
 * Features pulsing microphone icon, waveform, timer, and slide-to-cancel indicator
 */
export const RecordingOverlay: FC<RecordingOverlayProps> = ({ duration, onCancel }) => {
  const { t } = useTranslation();
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Calculate progress (max 60 seconds)
  const progressPercent = Math.min((duration / 60) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void-blue/95 backdrop-blur-glass"
    >
      {/* Pulsing Microphone Icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative mb-8"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 -m-8 rounded-full bg-biolum-cyan blur-2xl"
        />

        {/* Mic icon container */}
        <div
          className={cn(
            'relative flex items-center justify-center',
            'h-24 w-24 rounded-full',
            'border-2 border-biolum-cyan bg-biolum-cyan/20',
            'shadow-glow-lg'
          )}
        >
          <Mic size={48} className="text-biolum-cyan" strokeWidth={2} />
        </div>
      </motion.div>

      {/* Recording indicator text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-3 text-xl font-light text-mist-white"
      >
        {t('recording.title')}
      </motion.div>

      {/* Timer display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-6 font-mono text-5xl font-bold tabular-nums text-biolum-cyan"
      >
        {formattedTime}
      </motion.div>

      {/* Waveform visualization (simplified bars) */}
      <div className="mb-12 flex h-12 items-center gap-1">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scaleY: [0.3, Math.random() * 0.7 + 0.5, 0.3],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.05,
            }}
            className="w-1 origin-center rounded-full bg-biolum-cyan"
            style={{ height: '100%' }}
          />
        ))}
      </div>

      {/* Progress bar (60 second max) */}
      <div className="mb-8 h-1 w-64 overflow-hidden rounded-full bg-glass-bg">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-biolum-cyan to-warm-ember"
        />
      </div>

      {/* Slide to cancel instruction */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center gap-2 text-sm text-mist-white/60"
      >
        <ChevronLeft size={20} className="animate-pulse" />
        <span>{t('recording.slideToCancel')}</span>
      </motion.div>

      {/* Max duration warning (appears after 50 seconds) */}
      {duration >= 50 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-24 text-sm text-warm-ember"
        >
          {duration >= 60
            ? t('recording.maxLengthReached')
            : t('recording.timeRemaining', { seconds: 60 - Math.floor(duration) })}
        </motion.div>
      )}

      {/* Tap anywhere to cancel (mobile) */}
      <button
        onClick={onCancel}
        className="absolute right-8 top-8 text-sm text-mist-white/60 transition-colors hover:text-mist-white"
      >
        {t('recording.cancel')}
      </button>
    </motion.div>
  );
};
