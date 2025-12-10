import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  BarChart3,
  Music,
  Download,
  Trash2,
  UserX,
  Phone,
  RotateCcw,
  Globe,
  MessageCircle,
  Star,
  AlertCircle,
  Shield,
  FileText,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useDialogContext } from '../contexts/DialogContext';
import { useUI } from '../contexts/UIContext';
import { useHaptics } from '../hooks/useHaptics';
import { useSettings } from '../hooks/useSettings';
import { SettingRow } from '../components/ui/SettingRow';
import { SettingSection } from '../components/ui/SettingSection';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { FeedbackDialog } from '../components/features/profile/FeedbackDialog';
import { DisclaimerDialog } from '../components/features/profile/DisclaimerDialog';
import { AppLikePromptDialog } from '../components/features/profile/AppLikePromptDialog';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';
import { requestAppRating, isRatingAvailable } from '../services/rating.service';
import {
  exportUserData,
  clearLocalStorage,
  deleteAllUserData,
  deleteUserAccount,
} from '../utils/dataManagement';
import { auth } from '../services/firebase.service';
import toast from 'react-hot-toast';

/**
 * ProfilePage Component
 * Complete settings/profile screen with all features
 */

export const ProfilePage: FC = () => {
  const { t } = useTranslation();
  const { version } = useApp();
  const dialogs = useDialogContext();
  const { navbarBottom } = useUI();
  const { light, medium, heavy } = useHaptics();
  const { settings, updateSetting } = useSettings();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogProps, setConfirmDialogProps] = useState<any>({});

  useEffect(() => {
    logAnalyticsEvent(AnalyticsEvent.PROFILE_PAGE_VIEWED);
  }, []);

  // Helper to show confirmation dialog
  const showConfirm = (props: any) => {
    setConfirmDialogProps(props);
    setConfirmDialogOpen(true);
  };

  // Settings handlers
  const handleHapticsToggle = async (enabled: boolean) => {
    updateSetting('hapticsEnabled', enabled);
    if (enabled) await light(); // Test haptic
    logAnalyticsEvent(AnalyticsEvent.HAPTICS_TOGGLED, { enabled });
    toast.success(enabled ? t('toasts.hapticsEnabled') : t('toasts.hapticsDisabled'));
  };

  const handleAnalyticsToggle = async (enabled: boolean) => {
    updateSetting('analyticsEnabled', enabled);
    await light();
    logAnalyticsEvent(AnalyticsEvent.ANALYTICS_TOGGLED, { enabled });
    toast.success(enabled ? t('toasts.analyticsEnabled') : t('toasts.analyticsDisabled'));
  };

  const handleSoundEffectsToggle = async (enabled: boolean) => {
    updateSetting('soundEffectsEnabled', enabled);
    await light();
    logAnalyticsEvent(AnalyticsEvent.SOUND_EFFECTS_TOGGLED, { enabled });
    toast.success(t('toasts.settingsChanged'));
  };

  // Data management handlers
  const handleExportData = async () => {
    await light();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error('Not signed in');
      return;
    }
    await exportUserData(userId);
    await medium();
  };

  const handleClearCache = async () => {
    await light();
    showConfirm({
      title: t('dialogs.confirmClearCache'),
      message: t('dialogs.confirmClearCacheMessage'),
      confirmText: t('dialogs.confirm'),
      cancelText: t('dialogs.cancel'),
      destructive: false,
      onConfirm: async () => {
        await clearLocalStorage();
        await medium();
        setConfirmDialogOpen(false);
      },
    });
  };

  const handleDeleteAllData = async () => {
    await heavy();
    showConfirm({
      title: t('dialogs.confirmDeleteAllData'),
      message: t('dialogs.confirmDeleteAllDataMessage'),
      confirmText: t('dialogs.delete'),
      cancelText: t('dialogs.cancel'),
      destructive: true,
      onConfirm: async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          toast.error('Not signed in');
          return;
        }
        await deleteAllUserData(userId);
        await medium();
        setConfirmDialogOpen(false);
      },
    });
  };

  const handleDeleteAccount = async () => {
    await heavy();
    showConfirm({
      title: t('dialogs.confirmDeleteAccount'),
      message: t('dialogs.confirmDeleteAccountMessage'),
      confirmText: t('dialogs.deleteAccount'),
      cancelText: t('dialogs.cancel'),
      destructive: true,
      onConfirm: async () => {
        await deleteUserAccount();
        await heavy();
        setConfirmDialogOpen(false);
      },
    });
  };

  // Support handlers
  const handleResetTutorial = async () => {
    await light();
    localStorage.setItem('hasSeenOnboarding', 'false');
    logAnalyticsEvent(AnalyticsEvent.ONBOARDING_RESET);
    toast.success('Tutorial will show on next launch');
  };

  const handleVisitWebsite = async () => {
    await light();
    window.open('https://franz.cx/p/anxiety-buddy', '_blank');
    logAnalyticsEvent(AnalyticsEvent.WEBSITE_VISITED);
  };

  const handleGiveFeedback = async () => {
    await light();
    logAnalyticsEvent(AnalyticsEvent.FEEDBACK_OPENED);
    dialogs.push(<FeedbackDialog onClose={() => dialogs.pop()} />);
  };

  const handleRateApp = async () => {
    await light();
    logAnalyticsEvent(AnalyticsEvent.RATE_APP_CLICKED);
    logAnalyticsEvent(AnalyticsEvent.REVIEW_PROMPT_SHOWN);

    dialogs.push(
      <AppLikePromptDialog
        onLike={async () => {
          await requestAppRating(true);
        }}
        onDislike={() => {
          dialogs.replace(<FeedbackDialog onClose={() => dialogs.pop()} />);
        }}
        onClose={() => dialogs.pop()}
      />
    );
  };

  // Legal handlers
  const handleDisclaimer = async () => {
    await light();
    logAnalyticsEvent(AnalyticsEvent.DISCLAIMER_VIEWED);
    dialogs.push(<DisclaimerDialog onClose={() => dialogs.pop()} />);
  };

  const handlePrivacyPolicy = async () => {
    await light();
    window.open('https://franz.cx/p/anxiety-buddy/privacy', '_blank');
    logAnalyticsEvent(AnalyticsEvent.PRIVACY_POLICY_VIEWED);
  };

  const handleTerms = async () => {
    await light();
    window.open('https://franz.cx/p/anxiety-buddy/terms', '_blank');
    logAnalyticsEvent(AnalyticsEvent.TERMS_VIEWED);
  };

  return (
    <div
      className="flex h-full flex-col overflow-y-auto bg-void-blue px-6 pb-8 pt-safe"
      style={{ paddingBottom: `${navbarBottom + 32}px` }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-light text-mist-white">{t('profile.title')}</h1>
        <p className="text-sm text-mist-white/60">{t('profile.subtitle')}</p>
      </div>

      {/* App Preferences */}
      <SettingSection title={t('settings.appPreferences')}>
        <SettingRow
          icon={<Zap size={24} />}
          label={t('settings.haptics')}
          description={t('settings.hapticsDesc')}
          toggle
          checked={settings.hapticsEnabled}
          onChange={handleHapticsToggle}
        />
        <SettingRow
          icon={<BarChart3 size={24} />}
          label={t('settings.analytics')}
          description={t('settings.analyticsDesc')}
          toggle
          checked={settings.analyticsEnabled}
          onChange={handleAnalyticsToggle}
        />
        <SettingRow
          icon={<Music size={24} />}
          label={t('settings.soundEffects')}
          description={t('settings.soundEffectsDesc')}
          toggle
          checked={settings.soundEffectsEnabled}
          onChange={handleSoundEffectsToggle}
        />
      </SettingSection>

      {/* Data & Privacy */}
      <SettingSection title={t('settings.dataPrivacy')}>
        <SettingRow
          icon={<Download size={24} />}
          label={t('settings.exportData')}
          description={t('settings.exportDataDesc')}
          onClick={handleExportData}
        />
        <SettingRow
          icon={<Trash2 size={24} />}
          label={t('settings.clearCache')}
          description={t('settings.clearCacheDesc')}
          onClick={handleClearCache}
        />
        <SettingRow
          icon={<Trash2 size={24} />}
          label={t('settings.deleteAllData')}
          description={t('settings.deleteAllDataDesc')}
          onClick={handleDeleteAllData}
          destructive
        />
        <SettingRow
          icon={<UserX size={24} />}
          label={t('settings.deleteAccount')}
          description={t('settings.deleteAccountDesc')}
          onClick={handleDeleteAccount}
          destructive
        />
      </SettingSection>

      {/* Support & Resources */}
      <SettingSection title={t('settings.supportResources')}>
        <SettingRow
          icon={<Phone size={24} />}
          label={t('settings.crisisHotline')}
          description={t('settings.crisisHotlineDesc')}
          onClick={async () => {
            await heavy();
            window.open('tel:988', '_system');
          }}
        />
        <SettingRow
          icon={<RotateCcw size={24} />}
          label={t('settings.resetTutorial')}
          description={t('settings.resetTutorialDesc')}
          onClick={handleResetTutorial}
        />
        <SettingRow
          icon={<Globe size={24} />}
          label={t('settings.visitWebsite')}
          description={t('settings.visitWebsiteDesc')}
          onClick={handleVisitWebsite}
        />
        <SettingRow
          icon={<MessageCircle size={24} />}
          label={t('settings.giveFeedback')}
          description={t('settings.giveFeedbackDesc')}
          onClick={handleGiveFeedback}
        />
        {isRatingAvailable() && (
          <SettingRow
            icon={<Star size={24} />}
            label={t('settings.rateApp')}
            description={t('settings.rateAppDesc')}
            onClick={handleRateApp}
          />
        )}
      </SettingSection>

      {/* Legal & Information */}
      <SettingSection title={t('settings.legalInfo')}>
        <SettingRow
          icon={<AlertCircle size={24} />}
          label={t('settings.disclaimer')}
          description={t('settings.disclaimerDesc')}
          onClick={handleDisclaimer}
        />
        <SettingRow
          icon={<Shield size={24} />}
          label={t('settings.privacyPolicy')}
          description={t('settings.privacyPolicyDesc')}
          onClick={handlePrivacyPolicy}
        />
        <SettingRow
          icon={<FileText size={24} />}
          label={t('settings.termsOfService')}
          description={t('settings.termsOfServiceDesc')}
          onClick={handleTerms}
        />
      </SettingSection>

      {/* Version Footer */}
      <div className="mt-4 pb-4 text-center">
        <p className="text-xs text-mist-white/30">{t('general.version', { version })}</p>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        {...confirmDialogProps}
      />
    </div>
  );
};
