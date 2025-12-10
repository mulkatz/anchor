import { type FC } from 'react';
import { AlertCircle, Phone, ExternalLink } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useHaptics } from '../../../hooks/useHaptics';
import { logAnalyticsEvent, AnalyticsEvent } from '../../../services/analytics.service';
import { cn } from '../../../utils/cn';
import toast from 'react-hot-toast';

/**
 * CrisisContactCard Component
 * Prominent card with crisis hotline numbers
 * Critical for mental health app - provides immediate access to help
 */

export const CrisisContactCard: FC = () => {
  const { heavy } = useHaptics();

  const handleCrisisCall = async (number: string, type: 'crisis' | 'emergency') => {
    await heavy(); // Strong haptic warning

    // Platform-specific phone calling
    if (Capacitor.isNativePlatform()) {
      window.open(`tel:${number}`, '_system');
    } else {
      // Web fallback: Copy number to clipboard
      try {
        await navigator.clipboard.writeText(number);
        toast('Crisis hotline number copied', { duration: 3000 });
      } catch (error) {
        toast.error('Unable to copy number');
      }
    }

    // Analytics
    logAnalyticsEvent(
      type === 'crisis' ? AnalyticsEvent.CRISIS_HOTLINE_CALLED : AnalyticsEvent.EMERGENCY_CALLED,
      { number }
    );
  };

  return (
    <div
      className={cn(
        'mb-6 rounded-3xl p-6',
        'border-2 border-warm-ember',
        'bg-glass-bg backdrop-blur-glass',
        'shadow-[0_0_40px_rgba(255,179,138,0.3)]'
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <AlertCircle className="text-warm-ember" size={28} />
        <h3 className="text-lg font-semibold text-warm-ember">Crisis Resources</h3>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-mist-white/70">
        If you're in immediate danger, please reach out to professionals.
      </p>

      {/* Crisis Hotline Buttons */}
      <div className="flex flex-col gap-2">
        {/* 988 Crisis Hotline */}
        <button
          onClick={() => handleCrisisCall('988', 'crisis')}
          className={cn(
            'flex items-center justify-between p-4',
            'rounded-xl border border-warm-ember',
            'bg-warm-ember/10',
            'active:bg-warm-ember/20',
            'transition-all duration-300 ease-viscous'
          )}
        >
          <div className="flex items-center gap-3">
            <Phone className="text-warm-ember" size={20} />
            <div className="text-left">
              <p className="text-base font-semibold text-warm-ember">988 Crisis Hotline</p>
              <p className="text-xs text-mist-white/60">24/7 Mental Health Support</p>
            </div>
          </div>
          <ExternalLink className="text-warm-ember" size={16} />
        </button>

        {/* 911 Emergency */}
        <button
          onClick={() => handleCrisisCall('911', 'emergency')}
          className={cn(
            'flex items-center justify-between p-4',
            'rounded-xl border border-danger',
            'bg-danger/10',
            'active:bg-danger/20',
            'transition-all duration-300 ease-viscous'
          )}
        >
          <div className="flex items-center gap-3">
            <Phone className="text-danger" size={20} />
            <div className="text-left">
              <p className="text-base font-semibold text-danger">911 Emergency</p>
              <p className="text-xs text-mist-white/60">For Immediate Danger</p>
            </div>
          </div>
          <ExternalLink className="text-danger" size={16} />
        </button>
      </div>
    </div>
  );
};
