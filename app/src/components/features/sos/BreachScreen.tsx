import { type FC, useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface BreachScreenProps {
  onComplete: () => void;
}

export const BreachScreen: FC<BreachScreenProps> = ({ onComplete }) => {
  const { heavy } = useHaptics();
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const LONG_PRESS_DURATION = 2000; // 2 seconds

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
          setTimeout(onComplete, 300);
        }
      }, 16); // ~60fps
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isPressed, onComplete, heavy]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Pulsing SOS Icon */}
      <div className="mb-8 animate-pulse-glow">
        <AlertCircle size={120} className="text-biolum-cyan drop-shadow-glow-strong" />
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
