import { useEffect, useCallback, useRef } from 'react';
import { useDialog } from '../contexts/DialogContext';
import { useApp } from '../contexts/AppContext';
import { UpdateDialog } from '../components/features/dialogs/UpdateDialog';
import {
  fetchRemoteConfig,
  getRemoteConfigValue,
  compareVersions,
} from '../services/firebase.service';
import { Capacitor } from '@capacitor/core';

/**
 * useUpdateDialog - Checks for app updates via Firebase Remote Config
 *
 * Remote Config keys (platform-specific):
 * - min_required_version_ios / min_required_version_android: Force update if below
 * - latest_version_ios / latest_version_android: Optional update if below
 * - update_url_ios / update_url_android: Store URLs
 *
 * Also exposes helper functions on window for testing:
 * - window.showUpdateRequired()
 * - window.showUpdateAvailable()
 * - window.checkForUpdates()
 */
export function useUpdateDialog() {
  const { push, pop } = useDialog();
  const { version } = useApp();
  const hasChecked = useRef(false);

  const showUpdateRequired = useCallback(() => {
    push(<UpdateDialog type="required" onClose={pop} />);
  }, [push, pop]);

  const showUpdateAvailable = useCallback(() => {
    push(<UpdateDialog type="available" onClose={pop} />);
  }, [push, pop]);

  /**
   * Check for updates using Firebase Remote Config
   */
  const checkForUpdates = useCallback(async () => {
    try {
      const platform = Capacitor.getPlatform();

      // Skip update check on web
      if (platform === 'web') {
        console.log('[UpdateCheck] Skipping update check on web');
        return 'web';
      }

      console.log('[UpdateCheck] Checking for updates...');
      console.log('[UpdateCheck] Platform:', platform);
      console.log('[UpdateCheck] Current app version:', version);

      // Fetch latest remote config
      await fetchRemoteConfig();

      // Get platform-specific version requirements
      const platformSuffix = platform === 'ios' ? 'ios' : 'android';
      const minRequiredVersion = getRemoteConfigValue(`min_required_version_${platformSuffix}`);
      const latestVersion = getRemoteConfigValue(`latest_version_${platformSuffix}`);

      console.log(`[UpdateCheck] min_required_version_${platformSuffix}:`, minRequiredVersion);
      console.log(`[UpdateCheck] latest_version_${platformSuffix}:`, latestVersion);

      // Check if update is required (current version < min required)
      if (minRequiredVersion && compareVersions(version, minRequiredVersion) < 0) {
        console.log('[UpdateCheck] Update REQUIRED - showing force update dialog');
        showUpdateRequired();
        return 'required';
      }

      // Check if update is available (current version < latest)
      if (latestVersion && compareVersions(version, latestVersion) < 0) {
        console.log('[UpdateCheck] Update AVAILABLE - showing optional update dialog');
        showUpdateAvailable();
        return 'available';
      }

      console.log('[UpdateCheck] App is up to date');
      return 'up-to-date';
    } catch (error) {
      console.error('[UpdateCheck] Failed to check for updates:', error);
      return 'error';
    }
  }, [version, showUpdateRequired, showUpdateAvailable]);

  // Check for updates on mount (once)
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Small delay to ensure app is fully loaded
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 2000);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  // Attach to window object for external access
  useEffect(() => {
    // Extend window type
    const win = window as Window & {
      showUpdateRequired?: () => void;
      showUpdateAvailable?: () => void;
      checkForUpdates?: () => Promise<string>;
    };

    win.showUpdateRequired = showUpdateRequired;
    win.showUpdateAvailable = showUpdateAvailable;
    win.checkForUpdates = checkForUpdates;

    // Log availability for debugging
    console.log('[UpdateDialog] Helper functions attached to window:');
    console.log('  - window.showUpdateRequired()');
    console.log('  - window.showUpdateAvailable()');
    console.log('  - window.checkForUpdates()');

    // Cleanup on unmount
    return () => {
      delete win.showUpdateRequired;
      delete win.showUpdateAvailable;
      delete win.checkForUpdates;
    };
  }, [showUpdateRequired, showUpdateAvailable, checkForUpdates]);

  return {
    showUpdateRequired,
    showUpdateAvailable,
    checkForUpdates,
  };
}
