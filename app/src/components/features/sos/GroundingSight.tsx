import { type FC, useState } from 'react';
import { Eye } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface GroundingSightProps {
  onComplete: () => void;
}

export const GroundingSight: FC<GroundingSightProps> = ({ onComplete }) => {
  const { light } = useHaptics();
  const [tapCount, setTapCount] = useState(0);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const TOTAL_TAPS = 5;

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (tapCount >= TOTAL_TAPS) return;

    // Get tap position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = 'clientY' in e ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

    // Light haptic on each tap
    light();

    // Add ripple effect
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);

    // Increment count
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Complete if done
    if (newCount >= TOTAL_TAPS) {
      setTimeout(onComplete, 600);
    }
  };

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center px-6"
      onClick={handleTap}
      onTouchStart={handleTap}
    >
      {/* Icon */}
      <div className="mb-8">
        <Eye size={64} className="text-biolum-cyan drop-shadow-glow" />
      </div>

      {/* Instruction */}
      <h2 className="mb-4 text-center text-2xl font-light text-mist-white">Tap 5 things you see</h2>

      {/* Counter */}
      <div className="flex items-center gap-2">
        {Array.from({ length: TOTAL_TAPS }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              i < tapCount ? 'bg-biolum-cyan shadow-glow-sm' : 'bg-mist-white/20'
            }`}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-mist-white/50">
        {tapCount}/{TOTAL_TAPS}
      </p>

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="pointer-events-none absolute animate-ping rounded-full border-2 border-biolum-cyan/50"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 40,
            height: 40,
            marginLeft: -20,
            marginTop: -20,
          }}
        />
      ))}
    </div>
  );
};
