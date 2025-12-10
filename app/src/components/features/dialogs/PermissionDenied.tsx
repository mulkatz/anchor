import { type FC } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { cn } from '../../../utils/cn';

export type PermissionType = 'microphone';

interface PermissionDeniedProps {
  type: PermissionType;
  onClose?: () => void;
}

/**
 * Permission Denied Dialog
 * Shows when a permission was declined and guides user to OS settings
 * Styled to match the app's glass morphism design system
 */
export const PermissionDenied: FC<PermissionDeniedProps> = ({ type, onClose }) => {
  const { t } = useTranslation();

  const openAppSettings = async () => {
    await NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
    onClose?.();
  };

  const getMessage = () => {
    switch (type) {
      case 'microphone':
        return t('dialogs.permissionDenied.microphoneAdvice');
      default:
        return t('dialogs.permissionDenied.microphoneAdvice');
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'microphone':
        return <Mic size={32} className="text-biolum-cyan" />;
      default:
        return <Mic size={32} className="text-biolum-cyan" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pt-safe pb-safe">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-void-blue/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            'rounded-3xl border border-glass-border',
            'bg-glass-bg p-6 shadow-glass backdrop-blur-glass'
          )}
        >
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-biolum-cyan/20 p-3">{getIcon()}</div>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-center text-xl font-semibold text-mist-white">
            {t('dialogs.permissionDenied.title')}
          </h2>

          {/* Message */}
          <p className="mb-6 text-center text-sm text-mist-white/70">{getMessage()}</p>

          {/* Actions */}
          <div className="flex gap-3">
            {/* Cancel button */}
            <button
              onClick={onClose}
              className={cn(
                'flex-1 rounded-full px-4 py-3',
                'border border-glass-border bg-glass-bg',
                'text-sm font-medium text-mist-white',
                'transition-all duration-300 ease-viscous',
                'hover:bg-glass-bg-hover active:scale-95'
              )}
            >
              {t('general.cancel')}
            </button>

            {/* Go to Settings button */}
            <button
              onClick={openAppSettings}
              className={cn(
                'flex-1 rounded-full px-4 py-3',
                'bg-biolum-cyan text-sm font-medium text-void-blue',
                'transition-all duration-300 ease-viscous',
                'shadow-glow-md active:scale-95'
              )}
            >
              {t('dialogs.permissionDenied.toSettings')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
