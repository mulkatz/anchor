import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { useHaptics } from '../../../hooks/useHaptics';

interface CompletionScreenProps {
  duration: number; // Session duration in seconds
}

export const CompletionScreen: FC<CompletionScreenProps> = ({ duration }) => {
  const { medium } = useHaptics();
  const navigate = useNavigate();

  useEffect(() => {
    // Success haptic
    medium();
  }, [medium]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Success icon */}
      <div className="mb-8 animate-fade-in">
        <CheckCircle size={80} className="text-success drop-shadow-glow" />
      </div>

      {/* Message */}
      <h1 className="mb-4 text-center text-4xl font-light text-mist-white">
        You did it
      </h1>
      <p className="mb-8 text-center text-lg text-mist-white/70">
        You're safe. You're here.
      </p>

      {/* Session stats */}
      <div className="mb-12 rounded-2xl border border-glass-border bg-glass-bg p-6 backdrop-blur-glass">
        <p className="text-center text-sm text-mist-white/60">
          Session time
        </p>
        <p className="text-center text-3xl font-light text-biolum-cyan">
          {formatDuration(duration)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-biolum-cyan px-8 py-4 text-lg font-medium text-void-blue shadow-glow-md transition-all duration-300 ease-viscous active:scale-95"
        >
          <Home size={20} />
          Return Home
        </button>

        {/* Future: Save session button */}
        {/* <button
          onClick={() => {}}
          className="rounded-2xl border border-glass-border bg-glass-bg px-8 py-4 text-lg font-medium text-mist-white backdrop-blur-glass transition-all duration-300 ease-viscous active:scale-95"
        >
          Save Session
        </button> */}
      </div>

      {/* Optional: Feeling scale */}
      <div className="mt-12">
        <p className="mb-4 text-center text-sm text-mist-white/50">
          How do you feel now?
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              className="h-10 w-10 rounded-full border border-glass-border bg-glass-bg backdrop-blur-glass transition-all duration-300 ease-viscous hover:bg-biolum-cyan hover:text-void-blue active:scale-90"
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
