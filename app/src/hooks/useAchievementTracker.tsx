import { useEffect, useRef, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { format } from 'date-fns';
import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import { useAchievements } from '../contexts/AchievementContext';
import { useDive } from '../contexts/DiveContext';

/**
 * Activity types that count towards streaks.
 */
type ActivityType = 'chat' | 'dive' | 'lighthouse' | 'tidelog';

/**
 * Hook that tracks user activity across the app and triggers achievement unlocks.
 *
 * Listens to:
 * - conversations (chat count)
 * - illuminate_entries (lighthouse count)
 * - daily_logs (tide log count + released count)
 * - dive progress (completed lessons from DiveContext)
 *
 * This hook should be mounted once at the app level (e.g., in MainLayout).
 */
export const useAchievementTracker = () => {
  const { userId, isAuthLoading } = useApp();
  const { checkAndUnlockAchievements, summary } = useAchievements();
  const { progress: diveProgress } = useDive();

  // Track which activities we've already logged today (per session)
  const loggedToday = useRef<Set<ActivityType>>(new Set());
  const lastLoggedDate = useRef<string>('');

  /**
   * Log an activity for today (for streak tracking).
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
      } catch (error) {
        console.warn('Failed to log activity:', error);
        // Don't throw - activity logging is non-critical
      }
    },
    [userId]
  );

  // Track previous values to avoid unnecessary Firestore calls
  const prevCounts = useRef<{
    conversations: number;
    illuminate_entries: number;
    daily_logs: number;
    released_logs: number;
    dive_lessons: number;
  }>({
    conversations: 0,
    illuminate_entries: 0,
    daily_logs: 0,
    released_logs: 0,
    dive_lessons: 0,
  });

  // Initialize prevCounts from summary stats on first load
  useEffect(() => {
    if (summary?.stats) {
      prevCounts.current = {
        conversations: summary.stats.conversations,
        illuminate_entries: summary.stats.illuminate_entries,
        daily_logs: summary.stats.daily_logs,
        released_logs: summary.stats.released_logs,
        dive_lessons: summary.stats.dive_lessons,
      };
    }
  }, [summary?.stats]);

  // Track conversations count
  useEffect(() => {
    if (isAuthLoading || !userId) return;

    const conversationsRef = collection(firestore, `users/${userId}/conversations`);

    // Use onSnapshot to get real-time count
    const unsubscribe = onSnapshot(
      query(conversationsRef),
      async (snapshot) => {
        const count = snapshot.size;

        // Only trigger check if count increased
        if (count > prevCounts.current.conversations) {
          prevCounts.current.conversations = count;
          await checkAndUnlockAchievements('conversations', count);
          // Log chat activity for streak tracking
          logActivity('chat');
        }
      },
      (error) => {
        console.warn('Error tracking conversations:', error);
      }
    );

    return () => unsubscribe();
  }, [userId, isAuthLoading, checkAndUnlockAchievements, logActivity]);

  // Track illuminate entries count
  useEffect(() => {
    if (isAuthLoading || !userId) return;

    const entriesRef = collection(firestore, `users/${userId}/illuminate_entries`);

    const unsubscribe = onSnapshot(
      query(entriesRef),
      async (snapshot) => {
        const count = snapshot.size;

        if (count > prevCounts.current.illuminate_entries) {
          prevCounts.current.illuminate_entries = count;
          await checkAndUnlockAchievements('illuminate_entries', count);
          // Log lighthouse activity for streak tracking
          logActivity('lighthouse');
        }
      },
      (error) => {
        console.warn('Error tracking illuminate entries:', error);
      }
    );

    return () => unsubscribe();
  }, [userId, isAuthLoading, checkAndUnlockAchievements, logActivity]);

  // Track daily logs count (and released logs)
  useEffect(() => {
    if (isAuthLoading || !userId) return;

    const logsRef = collection(firestore, `users/${userId}/daily_logs`);

    const unsubscribe = onSnapshot(
      query(logsRef),
      async (snapshot) => {
        const count = snapshot.size;
        let releasedCount = 0;

        // Count released logs
        snapshot.forEach((docSnap) => {
          if (docSnap.data().is_released) {
            releasedCount++;
          }
        });

        // Check daily logs achievement
        if (count > prevCounts.current.daily_logs) {
          prevCounts.current.daily_logs = count;
          await checkAndUnlockAchievements('daily_logs', count);
          // Log tidelog activity for streak tracking
          logActivity('tidelog');
        }

        // Check released logs achievement
        if (releasedCount > prevCounts.current.released_logs) {
          prevCounts.current.released_logs = releasedCount;
          await checkAndUnlockAchievements('released_logs', releasedCount);
        }
      },
      (error) => {
        console.warn('Error tracking daily logs:', error);
      }
    );

    return () => unsubscribe();
  }, [userId, isAuthLoading, checkAndUnlockAchievements, logActivity]);

  // Track dive lessons from DiveContext
  useEffect(() => {
    if (!diveProgress) return;

    const completedCount = diveProgress.completedLessons?.length || 0;

    if (completedCount > prevCounts.current.dive_lessons) {
      prevCounts.current.dive_lessons = completedCount;
      checkAndUnlockAchievements('dive_lessons', completedCount);
      // Log dive activity for streak tracking
      logActivity('dive');
    }
  }, [diveProgress, checkAndUnlockAchievements, logActivity]);
};
