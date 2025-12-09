import { type FC, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface AcknowledgeScreenProps {
  onComplete: () => void;
}

export const AcknowledgeScreen: FC<AcknowledgeScreenProps> = ({ onComplete }) => {
  const { heartbeat } = useHaptics();

  useEffect(() => {
    // Start heartbeat pattern (5 seconds at 60 BPM)
    heartbeat(5000);

    // Auto-advance after 5 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete, heartbeat]);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Breathing heart icon */}
      <div className="mb-12 animate-breathe">
        <Heart size={80} className="text-biolum-cyan drop-shadow-glow" fill="currentColor" />
      </div>

      {/* Acknowledgement message */}
      <h1 className="text-center text-4xl font-light text-mist-white">I've got you.</h1>

      <p className="mt-6 text-center text-lg text-mist-white/60">
        You're safe. Let's take this together.
      </p>
    </div>
  );
};
