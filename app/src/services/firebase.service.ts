import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { getAuth, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
