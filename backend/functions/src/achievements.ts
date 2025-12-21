import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

/**
 * Achievement definitions for streak achievements
 */
const STREAK_ACHIEVEMENTS = [
  { id: 'gentle_current', target: 3 },
  { id: 'steady_tide', target: 7 },
  { id: 'moon_cycle', target: 30 },
];

/**
 * Calculate streak from activity log documents
 * Returns { currentStreak, longestStreak }
 */
function calculateStreak(activityDates: string[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort dates in descending order (most recent first)
  const sortedDates = [...activityDates].sort((a, b) => b.localeCompare(a));

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Calculate current streak (must include today or yesterday)
  let currentStreak = 0;
  const mostRecentDate = sortedDates[0];

  // Only count current streak if there's activity today or yesterday
  if (mostRecentDate === today || mostRecentDate === yesterday) {
    currentStreak = 1;
    let expectedDate = mostRecentDate;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevExpected = getPreviousDate(expectedDate);
      if (sortedDates[i] === prevExpected) {
        currentStreak++;
        expectedDate = prevExpected;
      } else if (sortedDates[i] === expectedDate) {
        // Same date, skip duplicate
        continue;
      } else {
        // Streak broken
        break;
      }
    }
  }

  // Calculate longest streak (historical)
  let longestStreak = 0;
  let tempStreak = 1;

  // Sort ascending for longest streak calculation
  const ascendingDates = [...new Set(sortedDates)].sort((a, b) => a.localeCompare(b));

  for (let i = 1; i < ascendingDates.length; i++) {
    const expectedNext = getNextDate(ascendingDates[i - 1]);
    if (ascendingDates[i] === expectedNext) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Current streak could be the longest
  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

/**
 * Get the previous date (YYYY-MM-DD)
 */
function getPreviousDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z'); // Use noon to avoid DST issues
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Get the next date (YYYY-MM-DD)
 */
function getNextDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00Z');
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * Cloud Function: Calculate streak when activity log is updated
 *
 * Triggered on any write to activity_log/{date}
 * - Fetches all activity log documents for the user
 * - Calculates current and longest streak
 * - Updates achievements/summary with streak stats
 * - Unlocks streak achievements if thresholds are met
 */
export const onActivityLogWrite = onDocumentWritten(
  'users/{userId}/activity_log/{date}',
  async (event): Promise<void> => {
    const userId = event.params.userId;
    const date = event.params.date;

    // Skip if document was deleted
    if (!event.data?.after.exists) {
      logger.info('Activity log deleted, skipping streak calculation', { userId, date });
      return;
    }

    logger.info('Activity log updated, calculating streak', { userId, date });

    const db = admin.firestore();

    try {
      // Fetch all activity log documents for this user
      const activityLogsSnapshot = await db
        .collection(`users/${userId}/activity_log`)
        .orderBy('date', 'desc')
        .limit(365) // Limit to last year for performance
        .get();

      const activityDates = activityLogsSnapshot.docs.map((doc) => doc.data().date as string);

      // Calculate streaks
      const { currentStreak, longestStreak } = calculateStreak(activityDates);

      logger.info('Streak calculated', { userId, currentStreak, longestStreak });

      // Get current achievements summary
      const summaryRef = db.doc(`users/${userId}/achievements/summary`);
      const summarySnap = await summaryRef.get();

      if (!summarySnap.exists) {
        logger.warn('Achievement summary not found, skipping streak update', { userId });
        return;
      }

      const summaryData = summarySnap.data()!;
      const unlockedAchievements: string[] = summaryData.unlockedAchievements || [];

      // Check for new streak achievements to unlock
      const newUnlocks: string[] = [];
      const achievementDates: Record<string, admin.firestore.Timestamp> = {};

      for (const achievement of STREAK_ACHIEVEMENTS) {
        if (!unlockedAchievements.includes(achievement.id) && currentStreak >= achievement.target) {
          newUnlocks.push(achievement.id);
          achievementDates[`achievementDates.${achievement.id}`] = admin.firestore.Timestamp.now();
          logger.info('Unlocking streak achievement', {
            userId,
            achievementId: achievement.id,
            currentStreak,
          });
        }
      }

      // Prepare update object
      const updateData: Record<string, unknown> = {
        'stats.current_streak': currentStreak,
        'stats.longest_streak': Math.max(longestStreak, summaryData.stats?.longest_streak || 0),
        'stats.last_activity_date': date,
        updatedAt: admin.firestore.Timestamp.now(),
      };

      // Add new unlocks if any
      if (newUnlocks.length > 0) {
        updateData.unlockedAchievements = admin.firestore.FieldValue.arrayUnion(...newUnlocks);
        Object.assign(updateData, achievementDates);
      }

      // Update achievements summary
      await summaryRef.update(updateData);

      logger.info('Achievement summary updated', {
        userId,
        currentStreak,
        longestStreak,
        newUnlocks: newUnlocks.length > 0 ? newUnlocks : 'none',
      });
    } catch (error) {
      logger.error('Error calculating streak', { userId, error });
      throw error;
    }
  }
);
