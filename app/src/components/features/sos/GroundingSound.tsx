import { type FC, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

interface GroundingSoundProps {
  onComplete: () => void;
}

export const GroundingSound: FC<GroundingSoundProps> = ({ onComplete }) => {
  useEffect(() => {
    // TODO: Play pink noise audio
    // For now, just auto-advance after 20 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 20000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-void-blue px-6">
      {/* Minimal pulsing orb */}
      <div className="mb-12 animate-breathe">
        <div className="h-24 w-24 rounded-full bg-biolum-cyan/20 shadow-inner-glow" />
      </div>

      {/* Icon */}
      <Volume2 size={48} className="mb-6 text-biolum-cyan/50" />

      {/* Instruction */}
      <h2 className="mb-4 text-center text-2xl font-light text-mist-white">
        Just listen
      </h2>
      <p className="text-center text-sm text-mist-white/40">
        Close your eyes if you feel safe
      </p>

      {/* Visual timer (subtle) */}
      <div className="absolute bottom-32">
        <div className="flex gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-mist-white/20 animate-pulse"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
