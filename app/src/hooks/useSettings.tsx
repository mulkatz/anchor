import { useState, useCallback, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import type { AppSettings, SupportedLanguage } from '../models';
import i18next from '../utils/i18n';

/**
 * useSettings Hook
 * Manages app settings with localStorage for instant access
 * and Firestore for cross-device sync
 *
 * Architecture:
 * - localStorage: Instant access, offline support
 * - Firestore: Cross-device sync, source of truth when authenticated
 * - On mount: Load from localStorage immediately, then sync with Firestore
 * - On change: Update localStorage immediately, debounce Firestore sync
 */

// Detect browser language and map to supported language
const detectLanguage = (): SupportedLanguage => {
  const stored = localStorage.getItem('language') as SupportedLanguage | null;
  if (stored) return stored;

  const browserLang = navigator.language;
  if (browserLang.startsWith('de')) return 'de-DE';
  return 'en-US'; // Default fallback
};

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  analyticsEnabled: true,
  soundEffectsEnabled: true,
  pinkNoiseVolume: 50,
  language: detectLanguage(),
};

/**
 * Load settings from localStorage
 */
function loadLocalSettings(): AppSettings {
  const language = detectLanguage();
  return {
    hapticsEnabled: localStorage.getItem('hapticsEnabled') !== 'false',
    analyticsEnabled: localStorage.getItem('analyticsEnabled') !== 'false',
    soundEffectsEnabled: localStorage.getItem('soundEffectsEnabled') !== 'false',
    pinkNoiseVolume: parseInt(localStorage.getItem('pinkNoiseVolume') || '50'),
    language,
  };
}

/**
 * Save settings to localStorage
 */
function saveLocalSettings(settings: AppSettings): void {
  localStorage.setItem('hapticsEnabled', settings.hapticsEnabled.toString());
  localStorage.setItem('analyticsEnabled', settings.analyticsEnabled.toString());
  localStorage.setItem('soundEffectsEnabled', settings.soundEffectsEnabled.toString());
  localStorage.setItem('pinkNoiseVolume', settings.pinkNoiseVolume.toString());
  localStorage.setItem('language', settings.language);
}

export const useSettings = () => {
  const { userId } = useApp();
  const [settings, setSettings] = useState<AppSettings>(loadLocalSettings);
  const firestoreSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialSyncDoneRef = useRef(false);

  // Sync with Firestore when user is authenticated
  useEffect(() => {
    if (!userId) {
      isInitialSyncDoneRef.current = false;
      return;
    }

    const settingsRef = doc(firestore, `users/${userId}/profile/settings`);

    // Initial load: merge Firestore settings with local settings
    // Firestore is source of truth, but respect local settings if Firestore is empty
    const loadInitialSettings = async () => {
      try {
        const snapshot = await getDoc(settingsRef);

        if (snapshot.exists()) {
          const firestoreSettings = snapshot.data() as Partial<AppSettings>;

          // Merge: Firestore wins for each field that exists
          const mergedSettings: AppSettings = {
            ...settings,
            ...firestoreSettings,
          };

          setSettings(mergedSettings);
          saveLocalSettings(mergedSettings);

          // Update i18next if language differs
          if (firestoreSettings.language && firestoreSettings.language !== i18next.language) {
            i18next.changeLanguage(firestoreSettings.language);
          }
        } else {
          // No Firestore settings - push local settings to Firestore
          await setDoc(settingsRef, settings);
        }

        isInitialSyncDoneRef.current = true;
      } catch (error) {
        console.error('Failed to load settings from Firestore:', error);
        // Keep using local settings
        isInitialSyncDoneRef.current = true;
      }
    };

    loadInitialSettings();

    // Listen for real-time updates (e.g., settings changed on another device)
    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        // Skip if this is the initial load (we already handled it)
        if (!isInitialSyncDoneRef.current) return;

        if (snapshot.exists()) {
          const firestoreSettings = snapshot.data() as AppSettings;
          setSettings(firestoreSettings);
          saveLocalSettings(firestoreSettings);

          // Update i18next if language changed
          if (firestoreSettings.language !== i18next.language) {
            i18next.changeLanguage(firestoreSettings.language);
          }
        }
      },
      (error) => {
        console.error('Error listening to settings:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const updateSetting = useCallback(
    (key: keyof AppSettings, value: any) => {
      // Update local state
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };

        // Save to localStorage immediately
        saveLocalSettings(newSettings);

        return newSettings;
      });

      // If language changed, update i18next
      if (key === 'language') {
        i18next.changeLanguage(value);
      }

      // Debounce Firestore sync (500ms delay to batch rapid changes)
      if (userId) {
        if (firestoreSyncTimeoutRef.current) {
          clearTimeout(firestoreSyncTimeoutRef.current);
        }

        firestoreSyncTimeoutRef.current = setTimeout(async () => {
          try {
            const settingsRef = doc(firestore, `users/${userId}/profile/settings`);
            const currentSettings = loadLocalSettings();
            await setDoc(settingsRef, currentSettings);
          } catch (error) {
            console.error('Failed to sync settings to Firestore:', error);
          }
        }, 500);
      }
    },
    [userId]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (firestoreSyncTimeoutRef.current) {
        clearTimeout(firestoreSyncTimeoutRef.current);
      }
    };
  }, []);

  return { settings, updateSetting };
};
