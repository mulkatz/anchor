import { type FC, useEffect } from 'react';
import { Phone, MessageCircle, User } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

/**
 * Crisis Card
 * Shown when crisis keywords are detected
 * Provides immediate access to crisis resources
 */
export const CrisisCard: FC = () => {
  const { heavy } = useHaptics();

  // Heavy haptic feedback when crisis card appears
  useEffect(() => {
    heavy();
  }, [heavy]);

  const handleCallHotline = () => {
    window.open('tel:988');
  };

  const handleTextHotline = () => {
    window.open('sms:741741&body=HOME');
  };

  const handleEmergencyContact = () => {
    // TODO: Integrate with user's saved emergency contact
    alert(
      'Emergency contact feature coming soon. Please call 988 or text 741741 for immediate help.'
    );
  };

  return (
    <div className="mb-6 px-6">
      <div
        className={cn(
          'rounded-3xl p-6',
          'bg-danger/20 backdrop-blur-glass',
          'border-2 border-danger/50',
          'shadow-lg'
        )}
      >
        <h3 className="mb-3 text-lg font-semibold text-mist-white">
          I'm deeply concerned about what you're sharing.
        </h3>

        <p className="mb-4 leading-relaxed text-mist-white/80">
          You deserve immediate support from a trained professional.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleCallHotline}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3',
              'rounded-2xl bg-danger',
              'font-medium text-white',
              'transition-all duration-300 ease-viscous',
              'active:scale-95'
            )}
          >
            <Phone size={20} />
            <div className="flex-1 text-left">
              <div>Call 988 Lifeline</div>
              <div className="text-xs opacity-80">Available 24/7</div>
            </div>
          </button>

          <button
            onClick={handleTextHotline}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3',
              'bg-glass-bg backdrop-blur-glass',
              'rounded-2xl border border-glass-border',
              'font-medium text-mist-white',
              'transition-all duration-300 ease-viscous',
              'active:scale-95'
            )}
          >
            <MessageCircle size={20} />
            <div className="flex-1 text-left">
              <div>Text HOME to 741741</div>
              <div className="text-xs opacity-80">Crisis Text Line</div>
            </div>
          </button>

          <button
            onClick={handleEmergencyContact}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3',
              'bg-glass-bg backdrop-blur-glass',
              'rounded-2xl border border-glass-border',
              'font-medium text-mist-white',
              'transition-all duration-300 ease-viscous',
              'active:scale-95'
            )}
          >
            <User size={20} />
            <div className="flex-1 text-left">
              <div>Call Emergency Contact</div>
              <div className="text-xs opacity-80">Your trusted person</div>
            </div>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-mist-white/60">
          You matter. Please reach out now.
        </p>
      </div>
    </div>
  );
};
