import type { TFunction } from 'i18next';

/**
 * Format date to relative time string with i18n support
 * Uses i18next pluralization for proper singular/plural forms
 *
 * @param date - The date to format
 * @param t - i18next translation function
 * @returns Localized relative time string (e.g., "2 hours ago", "just now")
 *
 * @example
 * const relativeTime = getRelativeTime(new Date(), t);
 * // "just now"
 *
 * const twoHoursAgo = getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000), t);
 * // "2 hours ago" (English) or "vor 2 Stunden" (German)
 */
export const getRelativeTime = (date: Date, t: TFunction): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Just now (< 1 minute)
  if (diffSecs < 60) {
    return t('time.justNow');
  }

  // Minutes ago (1-59 minutes)
  if (diffMins < 60) {
    return t('time.minutesAgo', { count: diffMins });
  }

  // Hours ago (1-23 hours)
  if (diffHours < 24) {
    return t('time.hoursAgo', { count: diffHours });
  }

  // Days ago (1-29 days)
  if (diffDays < 30) {
    return t('time.daysAgo', { count: diffDays });
  }

  // Months ago (1-11 months)
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return t('time.monthsAgo', { count: diffMonths });
  }

  // Years ago (12+ months)
  const diffYears = Math.floor(diffMonths / 12);
  return t('time.yearsAgo', { count: diffYears });
};

/**
 * Format date to locale-aware readable string
 * Uses the current i18n locale for formatting
 *
 * @param date - The date to format
 * @param locale - Current locale (e.g., 'en-US', 'de-DE')
 * @returns Localized date string (e.g., "Dec 9, 2025" or "9. Dez 2025")
 *
 * @example
 * const formatted = formatDate(new Date(), 'en-US');
 * // "Dec 9, 2025"
 *
 * const formattedDE = formatDate(new Date(), 'de-DE');
 * // "9. Dez. 2025"
 */
export const formatDate = (date: Date, locale: string): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date to locale-aware short date (without year)
 * Uses the current i18n locale for formatting
 *
 * @param date - The date to format
 * @param locale - Current locale (e.g., 'en-US', 'de-DE')
 * @returns Localized short date string (e.g., "Dec 9" or "9. Dez.")
 *
 * @example
 * const formatted = formatShortDate(new Date(), 'en-US');
 * // "Dec 9"
 *
 * const formattedDE = formatShortDate(new Date(), 'de-DE');
 * // "9. Dez."
 */
export const formatShortDate = (date: Date, locale: string): string => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time to locale-aware time string
 * Uses the current i18n locale for formatting (12h vs 24h)
 *
 * @param date - The date to format
 * @param locale - Current locale (e.g., 'en-US', 'de-DE')
 * @returns Localized time string (e.g., "1:30 PM" or "13:30")
 *
 * @example
 * const formatted = formatTime(new Date(), 'en-US');
 * // "1:30 PM"
 *
 * const formattedDE = formatTime(new Date(), 'de-DE');
 * // "13:30"
 */
export const formatTime = (date: Date, locale: string): string => {
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
};
