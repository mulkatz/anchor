import { type FC, useEffect, useState, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePinkNoise } from '../../../hooks/usePinkNoise';
import { WaveVisualizer } from '../../ui/WaveVisualizer';

interface GroundingSoundProps {
  onComplete: () => void;
}

export const GroundingSound: FC<GroundingSoundProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { isPlaying, start, stop, analyser } = usePinkNoise();
  const [timeLeft, setTimeLeft] = useState(20);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Start pink noise on mount
    start();

    // Timer countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          stop();
          setTimeout(() => onCompleteRef.current(), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      stop();
    };
  }, [start, stop]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-void-blue/50 px-6">
      {/* Wave Visualizer */}
      <div className="mb-8">
        {analyser && (
          <WaveVisualizer
            analyser={analyser}
            width={320}
            height={160}
            color="#64FFDA"
            glowColor="rgba(100, 255, 218, 0.6)"
          />
        )}
      </div>

      {/* Icon */}
      <Volume2
        size={48}
        className={`mb-6 transition-all duration-300 ${
          isPlaying ? 'text-biolum-cyan drop-shadow-glow' : 'text-biolum-cyan/50'
        }`}
      />

      {/* Instruction */}
      <h2 className="mb-4 text-center text-2xl font-light text-mist-white">
        {t('sos.groundingSound.instruction')}
      </h2>
      <p className="mb-8 text-center text-sm text-mist-white/40">{t('sos.groundingSound.note')}</p>

      {/* Timer */}
      <div className="flex flex-col items-center">
        <p className="text-4xl font-light text-biolum-cyan/60">{timeLeft}s</p>
        <div className="mt-4 h-1 w-64 overflow-hidden rounded-full bg-mist-white/10">
          <div
            className="h-full bg-biolum-cyan/50 transition-all duration-1000 ease-linear"
            style={{
              width: `${((20 - timeLeft) / 20) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
