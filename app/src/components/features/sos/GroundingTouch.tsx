import { type FC, useState, useEffect } from 'react';
import { Hand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHaptics } from '../../../hooks/useHaptics';

interface GroundingTouchProps {
  onComplete: () => void;
}

export const GroundingTouch: FC<GroundingTouchProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const { selectionStart, selectionChanged, selectionEnd } = useHaptics();
  const [isDragging, setIsDragging] = useState(false);
  const [dragDuration, setDragDuration] = useState(0);
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const REQUIRED_DURATION = 10; // 10 seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isDragging) {
      interval = setInterval(() => {
        setDragDuration((prev) => {
          const next = prev + 0.1;
          if (next >= REQUIRED_DURATION) {
            clearInterval(interval);
            selectionEnd();
            setTimeout(onComplete, 300);
            return REQUIRED_DURATION;
          }
          return next;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isDragging, onComplete, selectionEnd]);

  const handleDragStart = async () => {
    setIsDragging(true);
    await selectionStart();
  };

  const handleDragMove = async (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    await selectionChanged();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = 'clientX' in e ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = 'clientY' in e ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

    const newTrail = { id: Date.now(), x, y };
    setTrail((prev) => [...prev.slice(-20), newTrail]); // Keep last 20 points

    // Fade out trail
    setTimeout(() => {
      setTrail((prev) => prev.filter((t) => t.id !== newTrail.id));
    }, 1000);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragDuration(0);
    selectionEnd();
  };

  const progress = (dragDuration / REQUIRED_DURATION) * 100;

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center px-6"
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Textured background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-glass-bg to-transparent opacity-30" />

      {/* Icon */}
      <div className="mb-8">
        <Hand size={64} className="text-biolum-cyan drop-shadow-glow" />
      </div>

      {/* Instruction */}
      <h2 className="mb-4 text-center text-2xl font-light text-mist-white">
        {t('sos.groundingTouch.instruction')}
      </h2>
      <p className="mb-8 text-center text-sm text-mist-white/60">
        {t('sos.groundingTouch.description')}
      </p>

      {/* Progress bar */}
      <div className="h-2 w-64 overflow-hidden rounded-full bg-mist-white/20">
        <div
          className="h-full bg-biolum-cyan shadow-glow-sm transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-center text-sm text-mist-white/50">
        {Math.floor(dragDuration)}s / {REQUIRED_DURATION}s
      </p>

      {/* Particle trail */}
      {trail.map((point, i) => (
        <div
          key={point.id}
          className="pointer-events-none absolute h-2 w-2 animate-fade-out rounded-full bg-biolum-cyan/50"
          style={{
            left: point.x,
            top: point.y,
            opacity: i / trail.length,
          }}
        />
      ))}
    </div>
  );
};
