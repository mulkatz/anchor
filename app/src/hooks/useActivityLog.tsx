import { useCallback, useRef } from 'react';
import { doc, setDoc, getDoc, Timestamp, arrayUnion } from 'firebase/firestore';
import { format } from 'date-fns';
import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';

/**
 * Activity types that count towards streaks.
 * Any of these activities on a given day counts as "active" for that day.
 */
export type ActivityType = 'chat' | 'dive' | 'lighthouse' | 'tidelog';

interface ActivityLogEntry {
  date: string; // YYYY-MM-DD format
  activities: ActivityType[];
  updatedAt: Date;
}

/**
 * Hook for logging daily activity (used for streak calculation).
 *
 * Streaks are calculated based on consecutive days of activity.
 * This hook logs when a user performs an activity, and a Cloud Function
 * (or client-side calculation) determines the streak from these logs.
 *
 * Usage:
 * ```tsx
 * const { logActivity } = useActivityLog();
 *
 * // When user sends a chat message
 * await logActivity('chat');
 *
 * // When user completes a dive lesson
 * await logActivity('dive');
 * ```
 */
export const useActivityLog = () => {
  const { userId } = useApp();

  // Track which activities we've already logged today (per session)
  const loggedToday = useRef<Set<ActivityType>>(new Set());
  const lastLoggedDate = useRef<string>('');

  /**
   * Log an activity for today.
   * Idempotent - calling multiple times with same activity type is safe.
   */
  const logActivity = useCallback(
    async (activityType: ActivityType): Promise<void> => {
      if (!userId) return;

      const today = format(new Date(), 'yyyy-MM-dd');

      // Reset tracking if it's a new day
      if (lastLoggedDate.current !== today) {
        loggedToday.current.clear();
        lastLoggedDate.current = today;
      }

      // Skip if already logged this activity today (client-side optimization)
      if (loggedToday.current.has(activityType)) {
        return;
      }

      try {
        const logRef = doc(firestore, `users/${userId}/activity_log/${today}`);

        // Use setDoc with merge to create or update
        await setDoc(
          logRef,
          {
            date: today,
            activities: arrayUnion(activityType),
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );

        // Mark as logged for this session
        loggedToday.current.add(activityType);

        console.log(`Activity logged: ${activityType} for ${today}`);
      } catch (error) {
        console.warn('Failed to log activity:', error);
        // Don't throw - activity logging is non-critical
      }
    },
    [userId]
  );

  /**
   * Check if any activity has been logged today.
   */
  const hasActivityToday = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const logRef = doc(firestore, `users/${userId}/activity_log/${today}`);
      const snapshot = await getDoc(logRef);

      return snapshot.exists() && (snapshot.data()?.activities?.length || 0) > 0;
    } catch (error) {
      console.warn('Failed to check activity:', error);
      return false;
    }
  }, [userId]);

  return {
    logActivity,
    hasActivityToday,
  };
};
