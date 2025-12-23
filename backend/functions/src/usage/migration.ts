/**
 * Usage Migration
 *
 * One-time callable function to initialize usage documents for existing users.
 * Run this once to bootstrap the usage tracking system.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { UsageSummary } from './types';

/**
 * Initialize usage documents for existing users
 *
 * This is a callable function that initializes usage tracking for all existing users.
 * It should be run once when deploying the usage monitoring system.
 *
 * Request body:
 * - batchSize: number (default 100) - Users to process per batch
 * - startAfter: string (optional) - User ID to start after (for pagination)
 *
 * Response:
 * - processed: number - Users processed in this call
 * - lastUserId: string - Last user ID processed (for pagination)
 * - hasMore: boolean - Whether there are more users to process
 */
export const initializeUserUsage = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 540,
  },
  async (request) => {
    // Note: In production, you may want to add admin verification here
    // For now, we'll allow any authenticated user to run this
    // You could check for a specific admin UID or custom claim

    const { batchSize = 100, startAfter } = request.data || {};

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const nowDate = now.toDate();

    // Calculate current period dates
    const year = nowDate.getFullYear();
    const month = nowDate.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const periodStr = `${year}_${String(month).padStart(2, '0')}`;

    logger.info('Starting user usage initialization', { batchSize, startAfter });

    try {
      // Build query
      let query = db.collection('users').orderBy('__name__').limit(batchSize);

      if (startAfter) {
        const startDoc = await db.doc(`users/${startAfter}`).get();
        if (startDoc.exists) {
          query = query.startAfter(startDoc);
        }
      }

      const users = await query.get();

      if (users.empty) {
        logger.info('No more users to process');
        return {
          processed: 0,
          lastUserId: null,
          hasMore: false,
        };
      }

      // Process users in batches for Firestore
      const firestoreBatchSize = 500; // Firestore limit
      let processed = 0;

      for (let i = 0; i < users.docs.length; i += firestoreBatchSize) {
        const batch = db.batch();
        const chunk = users.docs.slice(i, Math.min(i + firestoreBatchSize, users.docs.length));

        for (const userDoc of chunk) {
          const userId = userDoc.id;
          const userData = userDoc.data();

          // Check if summary already exists (stored directly at usage/{userId})
          const summaryRef = db.doc(`usage/${userId}`);
          const summarySnap = await summaryRef.get();

          if (summarySnap.exists) {
            logger.info('Usage summary already exists, skipping', { userId });
            continue;
          }

          // Create initial summary document
          const summary: UsageSummary = {
            userId,
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
            lifetime: {
              totalCostUsd: 0,
              firstActivityAt: userData?.createdAt || now,
              aiCalls: 0,
              speechMinutes: 0,
            },
            limits: {
              monthlyBudgetUsd: null,
              monthlyAiCalls: null,
              monthlySpeechMinutes: null,
              alertThresholdPercent: 80,
              alertTriggered: false,
              alertTriggeredAt: null,
            },
            lastUpdated: now,
            schemaVersion: '1.0',
          };

          batch.set(summaryRef, summary);

          // Create empty current period document
          const periodRef = db.doc(`usage/${userId}/current/${periodStr}`);
          batch.set(periodRef, {
            userId,
            period: periodStr,
            startDate,
            endDate,
            status: 'current',
            ai: {},
            speech: {},
            storage: {},
            firestore: {},
            totals: {
              costUsd: 0,
              aiCostUsd: 0,
              aiInputTokens: 0,
              aiOutputTokens: 0,
              speechCostUsd: 0,
              speechMinutes: 0,
              storageCostUsd: 0,
              firestoreCostUsd: 0,
              firestoreReads: 0,
              firestoreWrites: 0,
            },
            createdAt: now,
            updatedAt: now,
            daysCounted: 0,
          });

          processed++;
        }

        await batch.commit();
        logger.info('Batch committed', { processed, batchIndex: i });
      }

      const lastUserId = users.docs[users.docs.length - 1]?.id;
      const hasMore = users.docs.length === batchSize;

      logger.info('User usage initialization batch completed', {
        processed,
        lastUserId,
        hasMore,
      });

      return {
        processed,
        lastUserId,
        hasMore,
      };
    } catch (error) {
      logger.error('User usage initialization failed', { error });
      throw new HttpsError('internal', 'Failed to initialize user usage');
    }
  }
);

/**
 * Initialize usage for a single user
 * Can be called when a new user is created
 */
export async function initializeSingleUserUsage(userId: string): Promise<void> {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const nowDate = now.toDate();

  // Calculate current period dates
  const year = nowDate.getFullYear();
  const month = nowDate.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  const periodStr = `${year}_${String(month).padStart(2, '0')}`;

  // Check if already exists (stored directly at usage/{userId})
  const summaryRef = db.doc(`usage/${userId}`);
  const summarySnap = await summaryRef.get();

  if (summarySnap.exists) {
    logger.info('Usage summary already exists for user', { userId });
    return;
  }

  const batch = db.batch();

  // Create summary
  const summary: UsageSummary = {
    userId,
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
    lifetime: {
      totalCostUsd: 0,
      firstActivityAt: now,
      aiCalls: 0,
      speechMinutes: 0,
    },
    limits: {
      monthlyBudgetUsd: null,
      monthlyAiCalls: null,
      monthlySpeechMinutes: null,
      alertThresholdPercent: 80,
      alertTriggered: false,
      alertTriggeredAt: null,
    },
    lastUpdated: now,
    schemaVersion: '1.0',
  };

  batch.set(summaryRef, summary);

  // Create current period
  const periodRef = db.doc(`usage/${userId}/current/${periodStr}`);
  batch.set(periodRef, {
    userId,
    period: periodStr,
    startDate,
    endDate,
    status: 'current',
    ai: {},
    speech: {},
    storage: {},
    firestore: {},
    totals: {
      costUsd: 0,
      aiCostUsd: 0,
      aiInputTokens: 0,
      aiOutputTokens: 0,
      speechCostUsd: 0,
      speechMinutes: 0,
      storageCostUsd: 0,
      firestoreCostUsd: 0,
      firestoreReads: 0,
      firestoreWrites: 0,
    },
    createdAt: now,
    updatedAt: now,
    daysCounted: 0,
  });

  await batch.commit();
  logger.info('Usage initialized for user', { userId });
}
