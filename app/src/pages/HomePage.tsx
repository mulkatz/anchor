import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves } from 'lucide-react';

export const HomePage: FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Logo/Icon */}
      <div className="mb-8 animate-breathe">
        <Waves size={80} className="text-biolum-cyan drop-shadow-glow" />
      </div>

      {/* Welcome Text */}
      <h1 className="mb-4 text-center text-4xl font-light tracking-wide text-mist-white">
        Anxiety Buddy
      </h1>
      <p className="mb-12 text-center text-lg text-mist-white/70">I'm here when you need me.</p>

      {/* Quick Actions */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/sos')}
          className="rounded-2xl bg-biolum-cyan px-8 py-4 text-lg font-medium text-void-blue shadow-glow-md transition-all duration-300 ease-viscous active:scale-95"
        >
          Start SOS Session
        </button>

        <button
          onClick={() => navigate('/vault')}
          className="rounded-2xl border border-glass-border bg-glass-bg px-8 py-4 text-lg font-medium text-mist-white backdrop-blur-glass transition-all duration-300 ease-viscous active:scale-95"
        >
          View Past Sessions
        </button>
      </div>
    </div>
  );
};
