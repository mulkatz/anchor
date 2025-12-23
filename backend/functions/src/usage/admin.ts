/**
 * Usage Admin Functions
 *
 * Scheduled functions for:
 * - Daily platform-wide aggregation
 * - Monthly period archival
 * - Old daily records cleanup (30-day retention)
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { AdminDailyAggregate, DailyUsage, UsagePeriod } from './types';

// ============================================
// Scheduled Functions
// ============================================

/**
 * Daily Usage Aggregation
 * Runs at 00:05 UTC daily
 * Aggregates all users' daily usage into platform-wide stats
 */
export const aggregateDailyUsage = onSchedule(
  {
    schedule: '5 0 * * *', // 00:05 UTC daily
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async () => {
    const db = admin.firestore();

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    logger.info('Starting daily usage aggregation', { date: dateStr });

    try {
      // Query all users' daily docs for yesterday
      const dailyDocs = await db.collectionGroup('daily').where('date', '==', dateStr).get();

      let totalCost = 0;
      let totalAiCalls = 0;
      let totalSpeechMinutes = 0;
      let activeUsers = 0;

      for (const doc of dailyDocs.docs) {
        const data = doc.data() as DailyUsage;
        totalCost += data.totalCostUsd || 0;
        totalAiCalls += data.ai?.calls || 0;
        totalSpeechMinutes += (data.speech?.durationMs || 0) / 60000;
        activeUsers++;
      }

      // Write admin aggregate
      const aggregate: AdminDailyAggregate = {
        date: dateStr,
        totalCostUsd: totalCost,
        totalAiCalls,
        totalSpeechMinutes,
        activeUsers,
        averageCostPerUser: activeUsers > 0 ? totalCost / activeUsers : 0,
        createdAt: admin.firestore.Timestamp.now(),
      };

      await db.doc(`usage_admin/daily/${dateStr}`).set(aggregate);

      logger.info('Daily usage aggregation completed', {
        date: dateStr,
        activeUsers,
        totalCost,
        totalAiCalls,
      });
    } catch (error) {
      logger.error('Daily usage aggregation failed', { date: dateStr, error });
      throw error;
    }
  }
);

/**
 * Monthly Period Archival
 * Runs on 1st of each month at 01:00 UTC
 * Moves last month's current period docs to history
 */
export const archiveMonthlyUsage = onSchedule(
  {
    schedule: '0 1 1 * *', // 01:00 UTC on 1st of month
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 540,
  },
  async () => {
    const db = admin.firestore();

    // Get last month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodStr = `${lastMonth.getFullYear()}_${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    logger.info('Starting monthly usage archival', { period: periodStr });

    try {
      // Find all current period docs from last month
      // Note: collectionGroup query requires index on 'period' field
      const currentDocs = await db
        .collectionGroup('current')
        .where('period', '==', periodStr)
        .get();

      logger.info('Found period docs to archive', { count: currentDocs.docs.length });

      // Process in batches to avoid timeout
      const batchSize = 100;
      let processed = 0;

      for (let i = 0; i < currentDocs.docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = currentDocs.docs.slice(i, i + batchSize);

        for (const doc of chunk) {
          const data = doc.data() as UsagePeriod;
          const userId = doc.ref.parent.parent?.id;

          if (!userId) {
            logger.warn('Could not extract userId from path', { path: doc.ref.path });
            continue;
          }

          // Create history doc
          const historyRef = db.doc(`usage/${userId}/history/${periodStr}`);
          batch.set(historyRef, {
            ...data,
            status: 'archived',
            archivedAt: admin.firestore.Timestamp.now(),
          });

          // Delete current doc
          batch.delete(doc.ref);
          processed++;
        }

        await batch.commit();
        logger.info('Batch archived', { processed, total: currentDocs.docs.length });
      }

      logger.info('Monthly usage archival completed', { period: periodStr, archived: processed });
    } catch (error) {
      logger.error('Monthly usage archival failed', { period: periodStr, error });
      throw error;
    }
  }
);

/**
 * Cleanup Old Daily Records
 * Runs daily at 02:00 UTC
 * Deletes daily records older than 30 days (rolling retention)
 */
export const cleanupOldDailyRecords = onSchedule(
  {
    schedule: '0 2 * * *', // 02:00 UTC daily
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async () => {
    const db = admin.firestore();

    // Calculate cutoff date (30 days ago)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    logger.info('Starting daily records cleanup', { cutoffDate: cutoffStr });

    try {
      let totalDeleted = 0;
      let hasMore = true;

      // Process in batches to avoid timeout
      while (hasMore) {
        const oldDocs = await db
          .collectionGroup('daily')
          .where('date', '<', cutoffStr)
          .limit(500)
          .get();

        if (oldDocs.empty) {
          hasMore = false;
          break;
        }

        const batch = db.batch();
        for (const doc of oldDocs.docs) {
          batch.delete(doc.ref);
        }
        await batch.commit();

        totalDeleted += oldDocs.docs.length;
        logger.info('Cleanup batch completed', { deleted: oldDocs.docs.length, totalDeleted });

        // Continue if we got a full batch
        hasMore = oldDocs.docs.length === 500;
      }

      logger.info('Daily records cleanup completed', { totalDeleted });
    } catch (error) {
      logger.error('Daily records cleanup failed', { cutoffDate: cutoffStr, error });
      throw error;
    }
  }
);

/**
 * Reset Monthly Summaries
 * Runs on 1st of each month at 00:30 UTC
 * Resets currentPeriod in all user summaries for the new month
 */
export const resetMonthlySummaries = onSchedule(
  {
    schedule: '30 0 1 * *', // 00:30 UTC on 1st of month
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 540,
  },
  async () => {
    const db = admin.firestore();

    // Calculate new period dates
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    logger.info('Starting monthly summary reset', { startDate, endDate });

    try {
      // Get all summary documents
      const summaryDocs = await db.collection('usage').get();

      logger.info('Found summaries to reset', { count: summaryDocs.docs.length });

      // Process in batches
      const batchSize = 100;
      let processed = 0;

      for (let i = 0; i < summaryDocs.docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = summaryDocs.docs.slice(i, i + batchSize);

        for (const userDoc of chunk) {
          // userDoc IS the summary document (stored at usage/{userId})
          if (!userDoc.exists) continue;

          // Reset currentPeriod for new month
          batch.update(userDoc.ref, {
            currentPeriod: {
              startDate,
              endDate,
              totalCostUsd: 0,
              aiCostUsd: 0,
              speechCostUsd: 0,
              storageCostUsd: 0,
              firestoreCostUsd: 0,
              aiCalls: 0,
              totalTokens: 0,
              speechMinutes: 0,
              firestoreReads: 0,
              firestoreWrites: 0,
            },
            'limits.alertTriggered': false,
            'limits.alertTriggeredAt': null,
            lastUpdated: admin.firestore.Timestamp.now(),
          });

          processed++;
        }

        await batch.commit();
        logger.info('Reset batch completed', { processed, total: summaryDocs.docs.length });
      }

      logger.info('Monthly summary reset completed', { processed });
    } catch (error) {
      logger.error('Monthly summary reset failed', { error });
      throw error;
    }
  }
);
