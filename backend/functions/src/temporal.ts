/**
 * Temporal utilities for time-aware AI conversations (Backend)
 * Formats timestamps for natural language AI context with timezone awareness
 */

/**
 * Get relative time description for AI context
 * Examples: "2 minutes ago", "5 hours ago", "yesterday at 3:42 PM", "last Monday at 10:15 AM"
 * @param date - The date to format
 * @param now - Current date/time (default: new Date())
 * @param timezone - IANA timezone identifier (e.g., "Europe/Berlin") for proper DST handling
 */
export function getRelativeTimeForAI(
  date: Date,
  now: Date = new Date(),
  timezone?: string
): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Format time as HH:MM AM/PM in user's timezone
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone, // Use user's timezone for DST-aware formatting
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
    const dayName = date.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: timezone,
    });
    return `last ${dayName} at ${timeStr}`;
  }

  // Within last month
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const dayName = date.toLocaleDateString('en-US', {
      weekday: 'long',
      timeZone: timezone,
    });
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago (${dayName} at ${timeStr})`;
  }

  // Older than a month
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  });
  return `on ${dateStr} at ${timeStr}`;
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
 * @param now - Current date/time
 * @param timezone - IANA timezone identifier for DST-aware formatting
 */
export function getCurrentContextTimestamp(now: Date = new Date(), timezone?: string): string {
  const dayName = now.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: timezone,
  });
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });

  return `Today is ${dayName}, ${dateStr} at ${timeStr}`;
}

/**
 * Get time of day description
 * Examples: "morning", "afternoon", "evening", "night"
 * @param date - The date to check
 * @param timezone - IANA timezone identifier for DST-aware hour calculation
 */
export function getTimeOfDay(date: Date = new Date(), timezone?: string): string {
  // Get hour in user's timezone
  let hour: number;
  if (timezone) {
    // Format date in user's timezone and extract hour
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    });
    hour = parseInt(timeStr.split(':')[0], 10);
  } else {
    hour = date.getHours();
  }

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
