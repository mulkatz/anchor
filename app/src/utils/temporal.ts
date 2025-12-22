/**
 * Temporal utilities for time-aware conversations
 * Formats timestamps for natural language AI context and UI display
 */

import i18next from 'i18next';

/**
 * Get the current locale for date formatting
 * Maps i18n language to locale string
 */
function getLocale(): string {
  const lang = i18next.language || 'en-US';
  // Map language codes to locale codes
  if (lang.startsWith('de')) return 'de-DE';
  return 'en-US';
}

/**
 * Get relative time description for AI context
 * Examples: "2 minutes ago", "5 hours ago", "yesterday at 3:42 PM", "last Monday at 10:15 AM"
 */
export function getRelativeTimeForAI(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Format time as HH:MM AM/PM
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Less than 1 hour ago
  if (diffMins < 60) {
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    return `${diffMins} minutes ago`;
  }

  // Less than 24 hours ago
  if (diffHours < 24 && isSameDay(date, now)) {
    if (diffHours === 1) return `1 hour ago (at ${timeStr})`;
    return `${diffHours} hours ago (at ${timeStr})`;
  }

  // Yesterday
  if (diffDays === 1 || (diffDays < 2 && !isSameDay(date, now))) {
    return `yesterday at ${timeStr}`;
  }

  // Within last week (2-6 days ago)
  if (diffDays < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `last ${dayName} at ${timeStr}`;
  }

  // Within last month
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago (${dayName} at ${timeStr})`;
  }

  // Older than a month
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `on ${dateStr} at ${timeStr}`;
}

/**
 * Get short relative time for UI display
 * Examples: "2m", "5h", "Yesterday", "Dec 8"
 */
export function getRelativeTimeForUI(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const locale = getLocale();

  // Less than 1 hour
  if (diffMins < 60) {
    if (diffMins < 1) return i18next.t('common.now');
    return `${diffMins}m`;
  }

  // Less than 24 hours
  if (diffHours < 24 && isSameDay(date, now)) {
    return `${diffHours}h`;
  }

  // Yesterday
  if (diffDays === 1 || (diffDays < 2 && !isSameDay(date, now))) {
    return i18next.t('common.yesterday');
  }

  // Within last week
  if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: 'short' });
  }

  // Older
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get full timestamp with relative context
 * Example: "Yesterday 3:42 PM", "Dec 8 at 10:15 AM"
 */
export function getFullTimestamp(date: Date, now: Date = new Date()): string {
  const locale = getLocale();
  const timeStr = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale === 'en-US',
  });

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  // Today
  if (isSameDay(date, now)) {
    return timeStr;
  }

  // Yesterday
  if (diffDays === 1 || (diffDays < 2 && !isSameDay(date, now))) {
    return `${i18next.t('common.yesterday')} ${timeStr}`;
  }

  // Within last week
  if (diffDays < 7) {
    const dayName = date.toLocaleDateString(locale, { weekday: 'long' });
    return `${dayName} ${timeStr}`;
  }

  // Older
  const dateStr = date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Get date divider text for chat UI
 * Examples: "Today", "Yesterday", "Last Monday", "December 8"
 */
export function getDateDivider(date: Date, now: Date = new Date()): string {
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  const locale = getLocale();

  // Today
  if (isSameDay(date, now)) {
    return i18next.t('common.today');
  }

  // Yesterday
  if (diffDays === 1 || (diffDays < 2 && !isSameDay(date, now))) {
    return i18next.t('common.yesterday');
  }

  // Within last week
  if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }

  // Within current year
  const sameYear = date.getFullYear() === now.getFullYear();
  if (sameYear) {
    return date.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
    });
  }

  // Different year
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Detect if there's a significant session break (>4 hours)
 */
export function detectSessionBreak(lastMessageTime: Date, now: Date = new Date()): boolean {
  const diffHours = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
  return diffHours >= 4;
}

/**
 * Get session break description for AI context
 * Examples: "after a 5-hour break", "after 2 days"
 */
export function getSessionBreakDescription(lastMessageTime: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - lastMessageTime.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    return diffDays === 1 ? 'after 1 day' : `after ${diffDays} days`;
  }

  return `after a ${diffHours}-hour break`;
}

/**
 * Get current context timestamp for AI system prompt
 * Example: "Today is Friday, December 8, 2024 at 3:42 PM"
 */
export function getCurrentContextTimestamp(now: Date = new Date()): string {
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `Today is ${dayName}, ${dateStr} at ${timeStr}`;
}

/**
 * Get time of day description
 * Examples: "morning", "afternoon", "evening", "night"
 */
export function getTimeOfDay(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Helper: Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
