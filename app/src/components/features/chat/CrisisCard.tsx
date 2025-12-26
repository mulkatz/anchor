import { type FC, useEffect } from 'react';
import { Phone, MessageCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../utils/cn';
import { useHaptics } from '../../../hooks/useHaptics';

/**
 * Crisis Card
 * Shown when crisis keywords are detected
 * Provides immediate access to crisis resources
 */
export const CrisisCard: FC = () => {
  const { t } = useTranslation();
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
    alert(t('crisis.card.comingSoon'));
  };

  return (
    <div className="mb-6">
      <div
        className={cn(
          'rounded-3xl p-6',
          'bg-danger/20 backdrop-blur-glass',
          'border-2 border-danger/50',
          'shadow-lg'
        )}
      >
        <h3 className="mb-3 text-lg font-semibold text-mist-white">
          {t('crisis.card.concernedTitle')}
        </h3>

        <p className="mb-4 leading-relaxed text-mist-white/80">
          {t('crisis.card.concernedMessage')}
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
              <div>{t('crisis.card.call988')}</div>
              <div className="text-xs opacity-80">{t('crisis.card.available247')}</div>
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
              <div>{t('crisis.card.text741741')}</div>
              <div className="text-xs opacity-80">{t('crisis.card.crisisTextLine')}</div>
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
              <div>{t('crisis.card.emergencyContact')}</div>
              <div className="text-xs opacity-80">{t('crisis.card.trustedPerson')}</div>
            </div>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-mist-white/60">{t('crisis.card.footer')}</p>
      </div>
    </div>
  );
};
