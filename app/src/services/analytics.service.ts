import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase.service';

/**
 * Analytics events for tracking user interactions
 * Adapted from cap2cal with anxiety-buddy specific events
 */

export enum AnalyticsEvent {
  // Profile Page Events
  PROFILE_PAGE_VIEWED = 'profile_page_viewed',

  // Settings Events
  SETTINGS_CHANGED = 'settings_changed', // { setting: string, value: any }
  LANGUAGE_CHANGED = 'language_changed', // { language: string }
  HAPTICS_TOGGLED = 'haptics_toggled', // { enabled: boolean }
  ANALYTICS_TOGGLED = 'analytics_toggled', // { enabled: boolean }
  PINK_NOISE_VOLUME_CHANGED = 'pink_noise_volume_changed', // { volume: number }
  SOUND_EFFECTS_TOGGLED = 'sound_effects_toggled', // { enabled: boolean }

  // Profile Events
  PROFILE_PHOTO_UPLOADED = 'profile_photo_uploaded',
  PROFILE_PHOTO_UPLOAD_FAILED = 'profile_photo_upload_failed',
  DISPLAY_NAME_UPDATED = 'display_name_updated',

  // Data Management Events
  DATA_EXPORTED = 'data_exported',
  DATA_EXPORT_FAILED = 'data_export_failed',
  CACHE_CLEARED = 'cache_cleared',
  CACHE_CLEAR_FAILED = 'cache_clear_failed',
  DATA_DELETED = 'data_deleted',
  DATA_DELETE_FAILED = 'data_delete_failed',
  ACCOUNT_DELETED = 'account_deleted',
  ACCOUNT_DELETE_FAILED = 'account_delete_failed',

  // Crisis Events
  CRISIS_HOTLINE_CALLED = 'crisis_hotline_called', // { number: string }
  EMERGENCY_CALLED = 'emergency_called',

  // Feedback Events
  FEEDBACK_OPENED = 'feedback_opened',
  FEEDBACK_SUBMITTED = 'feedback_submitted', // { kind: 'idea' | 'bug' }
  FEEDBACK_SUBMISSION_FAILED = 'feedback_submission_failed',

  // Rating Events
  RATE_APP_CLICKED = 'rate_app_clicked',
  REVIEW_PROMPT_SHOWN = 'review_prompt_shown',
  REVIEW_PROMPT_LIKED = 'review_prompt_liked',
  REVIEW_PROMPT_DISLIKED = 'review_prompt_disliked',
  NATIVE_REVIEW_TRIGGERED = 'native_review_triggered', // { platform: string }
  NATIVE_REVIEW_FALLBACK_SHOWN = 'native_review_fallback_shown',
  STORE_OPENED_DIRECTLY = 'store_opened_directly', // { platform: string }

  // Legal Events
  DISCLAIMER_VIEWED = 'disclaimer_viewed',
  DISCLAIMER_ACCEPTED = 'disclaimer_accepted',
  PRIVACY_POLICY_VIEWED = 'privacy_policy_viewed',
  TERMS_VIEWED = 'terms_viewed',

  // Onboarding Events
  ONBOARDING_RESET = 'onboarding_reset',
  TUTORIAL_STARTED = 'tutorial_started',

  // Website Events
  WEBSITE_VISITED = 'website_visited',

  // SOS Events (for completeness)
  SOS_SESSION_STARTED = 'sos_session_started',
  SOS_SESSION_COMPLETED = 'sos_session_completed',
  SOS_SESSION_ABANDONED = 'sos_session_abandoned',

  // Chat Events (for completeness)
  CONVERSATION_STARTED = 'conversation_started',
  MESSAGE_SENT = 'message_sent',
  VOICE_MESSAGE_SENT = 'voice_message_sent',

  // Tide Log (Journaling) Events
  TIDE_LOG_CREATED = 'tide_log_created', // { weather: string, mood_depth: number, has_note: boolean, is_released: boolean }
  TIDE_LOG_UPDATED = 'tide_log_updated', // { weather: string, mood_depth: number, is_released: boolean }
  TIDE_LOG_DELETED = 'tide_log_deleted',
  TIDE_LOG_VIEWED = 'tide_log_viewed', // { log_id: string }
  CHECK_IN_MODAL_OPENED = 'check_in_modal_opened',
  CHECK_IN_MODAL_CLOSED = 'check_in_modal_closed',
  RELEASE_ANIMATION_TRIGGERED = 'release_animation_triggered',
  REEF_ORB_CLICKED = 'reef_orb_clicked',
}

/**
 * Log an analytics event
 * Only logs if analytics is enabled in settings
 */
export const logAnalyticsEvent = (event: AnalyticsEvent | string, params?: Record<string, any>) => {
  try {
    // Check if analytics is enabled
    const analyticsEnabled = localStorage.getItem('analyticsEnabled') !== 'false';

    // Always log ANALYTICS_TOGGLED event (even if analytics is disabled)
    // so we can track opt-outs
    if (!analyticsEnabled && event !== AnalyticsEvent.ANALYTICS_TOGGLED) {
      return;
    }

    // Only log on web (Firebase Analytics only works in browser)
    if (analytics) {
      logEvent(analytics, event, params);
    }
  } catch (error) {
    // Silently fail - analytics should never break the app
    console.warn('Analytics logging failed:', error);
  }
};

/**
 * Set user properties for analytics
 */
export const setAnalyticsUserProperty = (property: string, value: string) => {
  try {
    const analyticsEnabled = localStorage.getItem('analyticsEnabled') !== 'false';
    if (!analyticsEnabled) return;

    if (analytics) {
      // Firebase Analytics setUserProperties method
      logEvent(analytics, 'user_property_set', { [property]: value });
    }
  } catch (error) {
    console.warn('Analytics user property failed:', error);
  }
};
