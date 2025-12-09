import { format, formatDistance, formatRelative } from 'date-fns';

/**
 * Date/Time Utilities
 * Centralized date formatting and manipulation
 */

/**
 * Format date to readable string
 */
export const formatDate = (date: Date, pattern = 'PPP'): string => {
  return format(date, pattern);
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date): string => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

/**
 * Format date relative to now (e.g., "yesterday at 3:20 PM")
 */
export const formatRelativeDate = (date: Date): string => {
  return formatRelative(date, new Date());
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if date is within last N days
 */
export const isWithinDays = (date: Date, days: number): boolean => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  return daysDiff <= days;
};

/**
 * Get start of day
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};
