import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  BarChart3,
  Music,
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
  Languages,
  ChevronRight,
  Circle,
  Shell,
  Anchor,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useDialogContext } from '../contexts/DialogContext';
import { useUI } from '../contexts/UIContext';
import { useAchievements } from '../contexts/AchievementContext';
import { useHaptics } from '../hooks/useHaptics';
import { useSettings } from '../hooks/useSettings';
import { useOnboarding } from '../hooks/useOnboarding';
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
import { showToast } from '../utils/toast';
import type { SupportedLanguage } from '../models';
import { getCrisisResources } from '../utils/crisisHotlines';

/**
 * ProfilePage Component
 * Complete settings/profile screen with all features
 */

export const ProfilePage: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { version } = useApp();
  const dialogs = useDialogContext();
  const { navbarBottom } = useUI();
  const { unlockedCount, totalCount } = useAchievements();
  const { light, medium, heavy } = useHaptics();
  const { settings, updateSetting } = useSettings();
  const { resetOnboarding } = useOnboarding();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogProps, setConfirmDialogProps] = useState<any>({});
  const [exporting, setExporting] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [crisisExpanded, setCrisisExpanded] = useState(false);

  // Check if developer mode is enabled
  const isDeveloperMode = import.meta.env.VITE_DEVELOPER_MODE === 'true';

  useEffect(() => {
    logAnalyticsEvent(AnalyticsEvent.PROFILE_PAGE_VIEWED);
  }, []);

  // Helper to show confirmation dialog
  const showConfirm = (props: any) => {
    setConfirmDialogProps(props);
    setConfirmDialogOpen(true);
  };

  // Settings handlers
  const handleLanguageChange = async () => {
    await light();
    // Toggle between English and German
    const newLanguage: SupportedLanguage = settings.language === 'en-US' ? 'de-DE' : 'en-US';
    updateSetting('language', newLanguage);
    logAnalyticsEvent(AnalyticsEvent.LANGUAGE_CHANGED, { language: newLanguage });
    showToast.success(t('toasts.languageChanged'));
  };

  const getLanguageDisplay = () => {
    return settings.language === 'en-US' ? t('languages.en-US') : t('languages.de-DE');
  };

  const handleHapticsToggle = async (enabled: boolean) => {
    updateSetting('hapticsEnabled', enabled);
    if (enabled) await light(); // Test haptic
    logAnalyticsEvent(AnalyticsEvent.HAPTICS_TOGGLED, { enabled });
    showToast.success(enabled ? t('toasts.hapticsEnabled') : t('toasts.hapticsDisabled'));
  };

  const handleAnalyticsToggle = async (enabled: boolean) => {
    updateSetting('analyticsEnabled', enabled);
    await light();
    logAnalyticsEvent(AnalyticsEvent.ANALYTICS_TOGGLED, { enabled });
    showToast.success(enabled ? t('toasts.analyticsEnabled') : t('toasts.analyticsDisabled'));
  };

  const handleSoundEffectsToggle = async (enabled: boolean) => {
    updateSetting('soundEffectsEnabled', enabled);
    await light();
    logAnalyticsEvent(AnalyticsEvent.SOUND_EFFECTS_TOGGLED, { enabled });
    showToast.success(t('toasts.settingsChanged'));
  };

  // Data management handlers
  const handleExportData = async () => {
    await light();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      showToast.error(t('toasts.notSignedIn'));
      return;
    }
    setExporting(true);
    try {
      await exportUserData(userId);
      await medium();
    } finally {
      setExporting(false);
    }
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
          showToast.error(t('toasts.notSignedIn'));
          return;
        }
        // Close dialog immediately so user can see the loading spinner
        setConfirmDialogOpen(false);
        setDeletingData(true);
        try {
          await deleteAllUserData(userId);
          await medium();
        } finally {
          setDeletingData(false);
        }
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
        // Close dialog immediately so user can see the loading spinner
        setConfirmDialogOpen(false);
        setDeletingAccount(true);
        try {
          await deleteUserAccount();
          await heavy();
        } finally {
          setDeletingAccount(false);
        }
      },
    });
  };

  // Support handlers
  const handleResetTutorial = async () => {
    await light();
    resetOnboarding();
    logAnalyticsEvent(AnalyticsEvent.ONBOARDING_RESET);
    showToast.success(t('toasts.tutorialReset'));
  };

  const handleViewAchievements = async () => {
    await light();
    navigate('/treasures');
  };

  const handleVisitWebsite = async () => {
    await light();
    window.open('https://anchor.franz.cx', '_blank');
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

  // Crisis resources handler
  const handleToggleCrisisExpanded = async () => {
    await light();
    setCrisisExpanded(!crisisExpanded);
  };

  // Legal handlers
  const handleDisclaimer = async () => {
    await light();
    logAnalyticsEvent(AnalyticsEvent.DISCLAIMER_VIEWED);
    dialogs.push(<DisclaimerDialog onClose={() => dialogs.pop()} />);
  };

  const handlePrivacyPolicy = async () => {
    await light();
    window.open('https://anchor.franz.cx/privacy', '_blank');
    logAnalyticsEvent(AnalyticsEvent.PRIVACY_POLICY_VIEWED);
  };

  const handleTerms = async () => {
    await light();
    window.open('https://anchor.franz.cx/terms', '_blank');
    logAnalyticsEvent(AnalyticsEvent.TERMS_VIEWED);
  };

  // Get crisis resources based on current language (uses i18next.language internally)
  const crisisResources = getCrisisResources();

  return (
    <div className="flex h-full flex-col bg-void-blue/75">
      {/* Sticky Header */}
      <header className="shrink-0 border-b border-glass-border bg-void-blue px-4 py-4 pt-safe sm:px-6">
        <h1 className="text-2xl font-light text-mist-white">{t('profile.title')}</h1>
        <p className="text-sm text-mist-white/60">{t('profile.subtitle')}</p>
      </header>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-6 sm:px-6"
        style={{ paddingBottom: `${navbarBottom + 24}px` }}
      >
        {/* Treasures Hero Card */}
        <motion.button
          onClick={handleViewAchievements}
          className="mb-6 w-full overflow-hidden rounded-3xl border border-glass-border bg-glass-bg text-left shadow-glass backdrop-blur-glass"
          whileTap={{ scale: 0.98 }}
        >
          {/* Content */}
          <div className="flex items-center gap-4 p-4">
            {/* Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mist-white/5">
              <Shell size={24} className="text-biolum-cyan" />
            </div>

            {/* Text & Progress */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-mist-white">
                  {t('settings.treasures')}
                </h3>
                <span className="text-sm font-medium text-biolum-cyan">
                  {unlockedCount}
                  <span className="text-mist-white/40">/{totalCount}</span>
                </span>
              </div>
              <p className="mt-0.5 text-xs text-mist-white/50">{t('settings.treasuresDesc')}</p>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-biolum-cyan/70 to-biolum-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight size={20} className="text-mist-white/40" />
          </div>
        </motion.button>

        {/* App Preferences */}
        <SettingSection title={t('settings.appPreferences')}>
          <SettingRow
            icon={<Languages size={24} />}
            label={t('settings.language')}
            description={t('settings.languageDesc')}
            value={getLanguageDisplay()}
            onClick={handleLanguageChange}
            hideChevron
          />
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
            icon={<Anchor size={24} />}
            label={t('settings.exportData')}
            description={t('settings.exportDataDesc')}
            onClick={handleExportData}
            loading={exporting}
          />
          {isDeveloperMode && (
            <SettingRow
              icon={<Trash2 size={24} />}
              label={t('settings.clearCache')}
              description={t('settings.clearCacheDesc')}
              onClick={handleClearCache}
            />
          )}
          <SettingRow
            icon={<Trash2 size={24} />}
            label={t('settings.deleteAllData')}
            description={t('settings.deleteAllDataDesc')}
            onClick={handleDeleteAllData}
            destructive
            loading={deletingData}
          />
          <SettingRow
            icon={<UserX size={24} />}
            label={t('settings.deleteAccount')}
            description={t('settings.deleteAccountDesc')}
            onClick={handleDeleteAccount}
            destructive
            loading={deletingAccount}
          />
        </SettingSection>

        {/* Support & Resources */}
        <SettingSection title={t('settings.supportResources')}>
          {/* Expandable Crisis Hotlines Section */}
          <div>
            {/* Header Row - Clickable to expand/collapse */}
            <button
              onClick={handleToggleCrisisExpanded}
              className="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-all duration-300 ease-viscous active:bg-glass-bg-hover"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex-shrink-0 text-biolum-cyan">
                  <Phone size={24} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-base font-semibold text-mist-white">
                    {t('settings.crisisHotlines')}
                  </span>
                  <span className="mt-0.5 text-xs text-mist-white/50">
                    {t('settings.crisisHotlinesDesc')}
                  </span>
                </div>
              </div>
              <motion.div
                className="ml-3 flex-shrink-0 text-mist-white/40"
                animate={{ rotate: crisisExpanded ? 90 : 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1], // ease-viscous
                }}
              >
                <ChevronRight size={20} />
              </motion.div>
            </button>

            {/* Expanded Content - Individual Crisis Resources */}
            <AnimatePresence initial={false}>
              {crisisExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1], // ease-viscous
                  }}
                  className="overflow-hidden border-t border-glass-border"
                >
                  <div className="bg-void-blue/20">
                    <SettingRow
                      icon={<Circle size={6} fill="currentColor" />}
                      label={crisisResources.primaryHotline.name}
                      description={crisisResources.primaryHotline.description}
                      onClick={async () => {
                        await heavy();
                        window.open(crisisResources.primaryHotline.telLink, '_system');
                        logAnalyticsEvent(AnalyticsEvent.CRISIS_HOTLINE_CALLED, {
                          number: crisisResources.primaryHotline.number,
                        });
                      }}
                    />
                    {crisisResources.secondaryHotline && (
                      <SettingRow
                        icon={<Circle size={6} fill="currentColor" />}
                        label={crisisResources.secondaryHotline.name}
                        description={crisisResources.secondaryHotline.description}
                        onClick={async () => {
                          await heavy();
                          window.open(crisisResources.secondaryHotline!.telLink, '_system');
                          logAnalyticsEvent(AnalyticsEvent.CRISIS_HOTLINE_CALLED, {
                            number: crisisResources.secondaryHotline!.number,
                          });
                        }}
                      />
                    )}
                    <SettingRow
                      icon={<Circle size={6} fill="currentColor" />}
                      label={crisisResources.emergency.name}
                      description={crisisResources.emergency.description}
                      onClick={async () => {
                        await heavy();
                        window.open(crisisResources.emergency.telLink, '_system');
                        logAnalyticsEvent(AnalyticsEvent.CRISIS_HOTLINE_CALLED, {
                          number: crisisResources.emergency.number,
                        });
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
        <div className="mt-4 text-center">
          <p className="text-xs text-mist-white/30">{t('general.version', { version })}</p>
        </div>
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
