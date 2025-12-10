import { InAppReview } from '@capacitor-community/in-app-review';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';
import { logAnalyticsEvent, AnalyticsEvent } from './analytics.service';

/**
 * In-app rating service
 * Adapted from cap2cal's rating.service with placeholder URLs
 */

// Placeholder URLs - update when apps are published
const IOS_APP_STORE_URL = 'https://apps.apple.com/app/anxiety-buddy/idXXXXXXXXX';
const ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.cx.franz.anxietybuddy';

export const requestAppRating = async (showToastOnFallback: boolean = true): Promise<void> => {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    toast('Rating is only available on mobile apps');
    return;
  }

  try {
    await InAppReview.requestReview();
    logAnalyticsEvent(AnalyticsEvent.NATIVE_REVIEW_TRIGGERED, { platform });

    // Wait 1.5s, then show fallback option
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (showToastOnFallback) {
      // Show simple toast with option to open store directly
      toast.success("Didn't see the rating dialog? Opening the app store...", {
        duration: 3000,
      });

      // Open store after a brief delay
      setTimeout(() => {
        openAppStore(platform);
      }, 1000);

      logAnalyticsEvent(AnalyticsEvent.NATIVE_REVIEW_FALLBACK_SHOWN);
    }
  } catch (error) {
    console.error('Rating failed:', error);
    openAppStore(platform);
  }
};

const openAppStore = (platform: string) => {
  const url = platform === 'ios' ? IOS_APP_STORE_URL : ANDROID_PLAY_STORE_URL;
  window.open(url, '_system');
  logAnalyticsEvent(AnalyticsEvent.STORE_OPENED_DIRECTLY, { platform });
};

export const isRatingAvailable = (): boolean => {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
};
