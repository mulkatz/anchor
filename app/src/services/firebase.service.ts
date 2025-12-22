import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { getAuth, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  type RemoteConfig,
} from 'firebase/remote-config';
import { Capacitor } from '@capacitor/core';
import { isWeb } from '../utils/platform';

/**
 * Firebase Service
 * Centralized Firebase initialization and utilities
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize auth with proper persistence for native platforms
// CRITICAL: Use initializeAuth with indexedDBLocalPersistence for iOS/Android WKWebView
const platform = Capacitor.getPlatform();
export const auth =
  platform === 'ios' || platform === 'android'
    ? initializeAuth(app, {
        persistence: indexedDBLocalPersistence,
      })
    : getAuth(app);

export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Helper for calling Cloud Functions
export { httpsCallable };

// Note: Firestore offline persistence (enableIndexedDbPersistence) is intentionally
// disabled. It caused excessive WebChannel requests (~100/sec) likely due to
// corrupted IndexedDB cache. The app uses Dexie for offline-first storage instead.

// Analytics (only on web)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (isWeb() && firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

/**
 * Log analytics event
 */
export const logAnalyticsEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  }
};

/**
 * Common analytics events
 */
export const AnalyticsEvents = {
  SCREEN_VIEW: 'screen_view',
  BUTTON_CLICK: 'button_click',
  FEATURE_USED: 'feature_used',
  ERROR_OCCURRED: 'error_occurred',
} as const;

// Remote Config
let remoteConfig: RemoteConfig | null = null;

/**
 * Initialize Remote Config with defaults
 */
export const initRemoteConfig = (): RemoteConfig => {
  if (remoteConfig) return remoteConfig;

  remoteConfig = getRemoteConfig(app);

  // Set minimum fetch interval (1 hour in production, 0 for development)
  remoteConfig.settings.minimumFetchIntervalMillis =
    import.meta.env.MODE === 'development' ? 0 : 3600000;

  // Set default values
  remoteConfig.defaultConfig = {
    min_required_version_ios: '0.0.0',
    min_required_version_android: '0.0.0',
    latest_version_ios: '0.0.0',
    latest_version_android: '0.0.0',
    update_url_ios: 'https://apps.apple.com/app/idXXXXXXXXXX',
    update_url_android: 'https://play.google.com/store/apps/details?id=cx.franz.anxietybuddy',
  };

  return remoteConfig;
};

/**
 * Fetch and activate remote config values
 */
export const fetchRemoteConfig = async (): Promise<boolean> => {
  try {
    const config = initRemoteConfig();
    const activated = await fetchAndActivate(config);
    console.log('[RemoteConfig] Fetched and activated:', activated);
    return activated;
  } catch (error) {
    console.error('[RemoteConfig] Fetch failed:', error);
    return false;
  }
};

/**
 * Get a string value from remote config
 */
export const getRemoteConfigValue = (key: string): string => {
  const config = initRemoteConfig();
  return getValue(config, key).asString();
};

/**
 * Compare semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
};
