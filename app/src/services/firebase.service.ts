import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(firestore).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Offline persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not available in this browser');
  } else {
    console.error('Offline persistence error:', err);
  }
});

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
