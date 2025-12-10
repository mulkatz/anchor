import { type FC, useState, useEffect, useRef } from 'react';
import { Anchor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHaptics } from '../../../hooks/useHaptics';
import { useUI } from '../../../contexts/UIContext';

interface BreachScreenProps {
  onComplete: () => void;
}

export const BreachScreen: FC<BreachScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { heavy } = useHaptics();
  const { navbarBottom } = useUI();
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const LONG_PRESS_DURATION = 2000; // 2 seconds

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPressed) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          clearInterval(interval);
          heavy(); // Heavy haptic on trigger
          setTimeout(() => onCompleteRef.current(), 300);
        }
      }, 16); // ~60fps
    } else {
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPressed, heavy]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-void-blue/50 px-6">
      {/* Pulsing Anchor Icon - represents grounding & stability */}
      <div className="mb-8 flex items-center justify-center">
        <style>
          {`
            @keyframes iconGlowPulse {
              0%, 100% {
                filter: drop-shadow(0 0 15px rgba(100, 255, 218, 0.5));
                transform: scale(1);
              }
              50% {
                filter: drop-shadow(0 0 35px rgba(100, 255, 218, 0.8));
                transform: scale(1.03);
              }
            }
            .icon-glow-pulse {
              animation: iconGlowPulse 3s ease-in-out infinite;
            }
          `}
        </style>
        <Anchor size={120} className="icon-glow-pulse text-biolum-cyan" strokeWidth={1.5} />
      </div>

      {/* Instruction */}
      <h2 className="mb-6 text-center text-2xl font-light text-mist-white">
        {t('sos.breach.instruction')}
      </h2>

      {/* Long-press button */}
      <div className="relative">
        <button
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          className="relative rounded-full bg-biolum-cyan px-12 py-6 text-xl font-medium text-void-blue shadow-glow-lg transition-all duration-300 ease-viscous active:scale-95"
        >
          <span className="relative z-10">{t('sos.breach.buttonText')}</span>

          {/* Progress indicator */}
          <div
            className="absolute inset-0 rounded-full bg-warm-ember opacity-50 transition-all duration-100"
            style={{
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
            }}
          />
        </button>

        <p className="mt-4 text-center text-sm text-mist-white/50">
          {progress > 0 ? `${Math.floor(progress)}%` : t('sos.breach.duration')}
        </p>
      </div>

      {/* Note - positioned above navbar */}
      <div
        className="absolute left-6 right-6"
        style={{ bottom: `${Math.max(navbarBottom + 16, 96)}px` }}
      >
        <p className="text-center text-sm text-mist-white/40">{t('sos.breach.note')}</p>
      </div>
    </div>
  );
};
