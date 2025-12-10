import { useState, useCallback, useEffect } from 'react';
import type { AppSettings } from '../models';

/**
 * useSettings Hook
 * Manages app settings with localStorage persistence
 * Future: Can add Firestore sync with debouncing
 */

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  analyticsEnabled: true,
  soundEffectsEnabled: true,
  pinkNoiseVolume: 50,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load from localStorage on mount
    return {
      hapticsEnabled: localStorage.getItem('hapticsEnabled') !== 'false',
      analyticsEnabled: localStorage.getItem('analyticsEnabled') !== 'false',
      soundEffectsEnabled: localStorage.getItem('soundEffectsEnabled') !== 'false',
      pinkNoiseVolume: parseInt(localStorage.getItem('pinkNoiseVolume') || '50'),
    };
  });

  const updateSetting = useCallback((key: keyof AppSettings, value: any) => {
    // Update local state
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Save to localStorage immediately
    localStorage.setItem(key, value.toString());

    // TODO: Debounce Firestore sync (2s delay)
    // debouncedFirestoreSync(key, value);
  }, []);

  return { settings, updateSetting };
};
