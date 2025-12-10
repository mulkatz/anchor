import { useState, useCallback, useEffect } from 'react';
import type { AppSettings, SupportedLanguage } from '../models';
import i18next from '../utils/i18n';

/**
 * useSettings Hook
 * Manages app settings with localStorage persistence
 * Future: Can add Firestore sync with debouncing
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

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load from localStorage on mount
    const language = detectLanguage();
    return {
      hapticsEnabled: localStorage.getItem('hapticsEnabled') !== 'false',
      analyticsEnabled: localStorage.getItem('analyticsEnabled') !== 'false',
      soundEffectsEnabled: localStorage.getItem('soundEffectsEnabled') !== 'false',
      pinkNoiseVolume: parseInt(localStorage.getItem('pinkNoiseVolume') || '50'),
      language,
    };
  });

  const updateSetting = useCallback((key: keyof AppSettings, value: any) => {
    // Update local state
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Save to localStorage immediately
    localStorage.setItem(key, value.toString());

    // If language changed, update i18next
    if (key === 'language') {
      i18next.changeLanguage(value);
    }

    // TODO: Debounce Firestore sync (2s delay)
    // debouncedFirestoreSync(key, value);
  }, []);

  return { settings, updateSetting };
};
