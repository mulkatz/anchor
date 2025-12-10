import { type FC, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHaptics } from '../../../hooks/useHaptics';

interface AcknowledgeScreenProps {
  onComplete: () => void;
}

export const AcknowledgeScreen: FC<AcknowledgeScreenProps> = ({ onComplete }) => {
  const { t } = useTranslation();
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
    <div className="flex h-full flex-col items-center justify-center bg-void-blue/50 px-6">
      {/* Breathing heart icon */}
      <div className="mb-12 animate-breathe">
        <Heart size={80} className="text-biolum-cyan drop-shadow-glow" fill="currentColor" />
      </div>

      {/* Acknowledgement message */}
      <h1 className="text-center text-4xl font-light text-mist-white">
        {t('sos.acknowledge.title')}
      </h1>

      <p className="mt-6 text-center text-lg text-mist-white/60">{t('sos.acknowledge.subtitle')}</p>
    </div>
  );
};
