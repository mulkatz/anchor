import { type FC, useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface BreachScreenProps {
  onComplete: () => void;
}

export const BreachScreen: FC<BreachScreenProps> = ({ onComplete }) => {
  const { heavy } = useHaptics();
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
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Pulsing SOS Icon */}
      <div className="mb-8 flex items-center justify-center">
        <style>
          {`
            @keyframes iconGlowPulse {
              0%, 100% {
                filter: drop-shadow(0 0 10px rgba(100, 255, 218, 0.4));
                transform: scale(1);
              }
              50% {
                filter: drop-shadow(0 0 30px rgba(100, 255, 218, 0.9));
                transform: scale(1.05);
              }
            }
            .icon-glow-pulse {
              animation: iconGlowPulse 2s ease-in-out infinite;
            }
          `}
        </style>
        <AlertCircle
          size={120}
          className="text-biolum-cyan icon-glow-pulse"
          strokeWidth={2}
        />
      </div>

      {/* Instruction */}
      <h2 className="mb-6 text-center text-2xl font-light text-mist-white">
        Hold to begin
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
          <span className="relative z-10">Press & Hold</span>

          {/* Progress indicator */}
          <div
            className="absolute inset-0 rounded-full bg-warm-ember opacity-50 transition-all duration-100"
            style={{
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
            }}
          />
        </button>

        <p className="mt-4 text-center text-sm text-mist-white/50">
          {progress > 0 ? `${Math.floor(progress)}%` : '(2 seconds)'}
        </p>
      </div>

      {/* Note */}
      <div className="absolute bottom-32 left-6 right-6">
        <p className="text-center text-sm text-mist-white/40">
          This will guide you through a 7-step grounding exercise
        </p>
      </div>
    </div>
  );
};
