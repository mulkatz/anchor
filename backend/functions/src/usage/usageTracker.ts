/**
 * Usage Tracker
 *
 * Core service for tracking usage events and persisting them to Firestore.
 * Uses batching for efficiency - events are accumulated and flushed together.
 */

import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { UsageEvent, UsageSummary, UsagePeriod, DailyUsage, AggregatedUsage } from './types';
import {
  calculateAICost,
  calculateSpeechCost,
  calculateStorageCost,
  calculateFirestoreCost,
  getBillableMinutes,
} from './costCalculator';

// ============================================
// Constants
// ============================================

const BATCH_SIZE = 10; // Events to accumulate before auto-flush
const BATCH_TIMEOUT_MS = 5000; // Max wait time before flush (5 seconds)

// ============================================
// In-Memory Batch Storage
// ============================================

// Per-user event batches
const eventBatches: Map<string, UsageEvent[]> = new Map();
const batchTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

// ============================================
// Public API
// ============================================

/**
 * Track a usage event (batched for efficiency)
 * Call this from each function that generates billable usage
 *
 * @param event - The usage event to track
 */
export function trackUsage(event: UsageEvent): void {
  const userId = event.userId;

  // Initialize batch if needed
  if (!eventBatches.has(userId)) {
    eventBatches.set(userId, []);
  }

  const batch = eventBatches.get(userId)!;
  batch.push(event);

  // Flush if batch is full
  if (batch.length >= BATCH_SIZE) {
    flushUserBatch(userId).catch((err) => {
      logger.error('Failed to flush usage batch', { userId, error: err });
    });
  } else {
    // Set/reset timer for delayed flush
    resetFlushTimer(userId);
  }
}

/**
 * Force flush all pending events for a user
 * Call this at the end of critical functions to ensure data is persisted
 *
 * @param userId - The user ID to flush events for
 */
export async function flushUsage(userId: string): Promise<void> {
  await flushUserBatch(userId);
}

/**
 * Track usage asynchronously (fire-and-forget)
 * Use for non-critical tracking that shouldn't block response
 *
 * @param event - The usage event to track
 */
export function trackUsageAsync(event: UsageEvent): void {
  // Queue microtask to not block current execution
  queueMicrotask(() => {
    trackUsage(event);
  });
}

// ============================================
// Internal Implementation
// ============================================

/**
 * Reset or create flush timer for a user
 */
function resetFlushTimer(userId: string): void {
  // Clear existing timer
  const existing = batchTimers.get(userId);
  if (existing) {
    clearTimeout(existing);
  }

  // Set new timer
  const timer = setTimeout(() => {
    flushUserBatch(userId).catch((err) => {
      logger.error('Failed to flush usage batch on timeout', { userId, error: err });
    });
  }, BATCH_TIMEOUT_MS);

  batchTimers.set(userId, timer);
}

/**
 * Flush all pending events for a user to Firestore
 */
async function flushUserBatch(userId: string): Promise<void> {
  // Clear timer
  const timer = batchTimers.get(userId);
  if (timer) {
    clearTimeout(timer);
    batchTimers.delete(userId);
  }

  // Get and clear batch
  const events = eventBatches.get(userId) || [];
  eventBatches.delete(userId);

  if (events.length === 0) return;

  try {
    await persistEvents(userId, events);
    logger.info('Usage events persisted', { userId, eventCount: events.length });
  } catch (error) {
    logger.error('Failed to persist usage events', {
      userId,
      eventCount: events.length,
      error,
    });
    // Note: Events are lost on failure. Could implement retry queue for critical tracking.
  }
}

/**
 * Persist events to Firestore using a transaction
 * Updates: daily doc, period doc, summary doc
 */
async function persistEvents(userId: string, events: UsageEvent[]): Promise<void> {
  const db = admin.firestore();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const periodStr = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY_MM

  // Aggregate events first
  const aggregated = aggregateEvents(events);

  // Calculate costs for the aggregated data
  const costs = calculateCosts(aggregated);

  // Use a transaction for atomic updates
  await db.runTransaction(async (tx) => {
    // Document references (summary is stored directly at usage/{userId})
    const summaryRef = db.doc(`usage/${userId}`);
    const periodRef = db.doc(`usage/${userId}/current/${periodStr}`);
    const dailyRef = db.doc(`usage/${userId}/daily/${dateStr}`);

    // Read current state
    const [summarySnap, periodSnap, dailySnap] = await Promise.all([
      tx.get(summaryRef),
      tx.get(periodRef),
      tx.get(dailyRef),
    ]);

    // Update daily document
    const dailyData = mergeDailyUsage(
      dailySnap.data() as DailyUsage | undefined,
      aggregated,
      costs,
      userId,
      dateStr
    );
    tx.set(dailyRef, dailyData, { merge: true });

    // Update period document
    const periodData = mergePeriodUsage(
      periodSnap.data() as UsagePeriod | undefined,
      aggregated,
      costs,
      userId,
      periodStr,
      now
    );
    tx.set(periodRef, periodData, { merge: true });

    // Update summary document
    const summaryData = mergeSummaryUsage(
      summarySnap.data() as UsageSummary | undefined,
      aggregated,
      costs,
      userId,
      now
    );
    tx.set(summaryRef, summaryData, { merge: true });
  });
}

/**
 * Aggregate multiple events into a single structure
 */
function aggregateEvents(events: UsageEvent[]): AggregatedUsage {
  const result: AggregatedUsage = {
    ai: new Map(),
    speech: { calls: 0, durationMs: 0, longRunning: 0, errors: 0 },
    storage: new Map(),
    firestore: new Map(),
  };

  for (const event of events) {
    switch (event.service) {
      case 'ai_gemini_25_flash':
      case 'ai_gemini_20_flash': {
        const key = `${event.model}_${event.feature}`;
        const existing = result.ai.get(key) || {
          calls: 0,
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: 0,
          errors: 0,
        };
        existing.calls++;
        existing.inputTokens += event.inputTokens || 0;
        existing.outputTokens += event.outputTokens || 0;
        existing.latencyMs += event.latencyMs || 0;
        if (event.isError) existing.errors++;
        result.ai.set(key, existing);
        break;
      }

      case 'speech_to_text': {
        result.speech.calls++;
        result.speech.durationMs += event.audioDurationMs || 0;
        if (event.isLongRunning) result.speech.longRunning++;
        if (event.isError) result.speech.errors++;
        break;
      }

      case 'cloud_storage': {
        const key = event.feature;
        const existing = result.storage.get(key) || {
          uploads: 0,
          downloads: 0,
          deletes: 0,
          bytesUp: 0,
          bytesDown: 0,
        };
        if (event.operation === 'upload') {
          existing.uploads++;
          existing.bytesUp += event.bytes || 0;
        } else if (event.operation === 'download') {
          existing.downloads++;
          existing.bytesDown += event.bytes || 0;
        } else if (event.operation === 'delete') {
          existing.deletes++;
        }
        result.storage.set(key, existing);
        break;
      }

      case 'firestore': {
        const key = event.feature;
        const existing = result.firestore.get(key) || {
          reads: 0,
          writes: 0,
          deletes: 0,
        };
        existing.reads += event.reads || 0;
        existing.writes += event.writes || 0;
        existing.deletes += event.deletes || 0;
        result.firestore.set(key, existing);
        break;
      }
    }
  }

  return result;
}

/**
 * Calculate costs from aggregated usage
 */
interface AggregatedCosts {
  aiCost: number;
  speechCost: number;
  storageCost: number;
  firestoreCost: number;
  totalCost: number;
  aiCalls: number;
  totalTokens: number;
  speechMinutes: number;
  firestoreReads: number;
  firestoreWrites: number;
}

function calculateCosts(aggregated: AggregatedUsage): AggregatedCosts {
  let aiCost = 0;
  let aiCalls = 0;
  let totalTokens = 0;

  // AI costs
  for (const [key, usage] of aggregated.ai) {
    const model = key.startsWith('gemini-2.5-flash') ? 'gemini-2.5-flash' : 'gemini-2.0-flash';
    aiCost += calculateAICost(model, usage.inputTokens, usage.outputTokens);
    aiCalls += usage.calls;
    totalTokens += usage.inputTokens + usage.outputTokens;
  }

  // Speech cost
  const speechCost = calculateSpeechCost(aggregated.speech.durationMs);
  const speechMinutes = getBillableMinutes(aggregated.speech.durationMs);

  // Storage cost
  let storageOps = 0;
  for (const usage of aggregated.storage.values()) {
    storageOps += usage.uploads + usage.downloads;
  }
  const storageCost = calculateStorageCost(storageOps, 0);

  // Firestore cost
  let firestoreReads = 0;
  let firestoreWrites = 0;
  for (const usage of aggregated.firestore.values()) {
    firestoreReads += usage.reads;
    firestoreWrites += usage.writes;
  }
  const firestoreCost = calculateFirestoreCost(firestoreReads, firestoreWrites);

  return {
    aiCost,
    speechCost,
    storageCost,
    firestoreCost,
    totalCost: aiCost + speechCost + storageCost + firestoreCost,
    aiCalls,
    totalTokens,
    speechMinutes,
    firestoreReads,
    firestoreWrites,
  };
}

// ============================================
// Document Merge Functions
// ============================================

function mergeDailyUsage(
  existing: DailyUsage | undefined,
  aggregated: AggregatedUsage,
  costs: AggregatedCosts,
  userId: string,
  date: string
): Partial<DailyUsage> {
  const now = admin.firestore.Timestamp.now();

  // Calculate AI by feature
  const aiByFeature: Record<
    string,
    { calls: number; inputTokens: number; outputTokens: number; costUsd: number }
  > = existing?.ai?.byFeature || {};

  for (const [key, usage] of aggregated.ai) {
    const feature = key.split('_').slice(1).join('_'); // Remove model prefix
    const model = key.startsWith('gemini-2.5-flash') ? 'gemini-2.5-flash' : 'gemini-2.0-flash';
    const cost = calculateAICost(model, usage.inputTokens, usage.outputTokens);

    if (!aiByFeature[feature]) {
      aiByFeature[feature] = { calls: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 };
    }
    aiByFeature[feature].calls += usage.calls;
    aiByFeature[feature].inputTokens += usage.inputTokens;
    aiByFeature[feature].outputTokens += usage.outputTokens;
    aiByFeature[feature].costUsd += cost;
  }

  // Calculate total AI tokens
  let aiInputTokens = 0;
  let aiOutputTokens = 0;
  for (const usage of aggregated.ai.values()) {
    aiInputTokens += usage.inputTokens;
    aiOutputTokens += usage.outputTokens;
  }

  return {
    userId,
    date,
    ai: {
      calls: (existing?.ai?.calls || 0) + costs.aiCalls,
      inputTokens: (existing?.ai?.inputTokens || 0) + aiInputTokens,
      outputTokens: (existing?.ai?.outputTokens || 0) + aiOutputTokens,
      costUsd: (existing?.ai?.costUsd || 0) + costs.aiCost,
      byFeature: aiByFeature,
    },
    speech: {
      calls: (existing?.speech?.calls || 0) + aggregated.speech.calls,
      durationMs: (existing?.speech?.durationMs || 0) + aggregated.speech.durationMs,
      costUsd: (existing?.speech?.costUsd || 0) + costs.speechCost,
    },
    firestore: {
      reads: (existing?.firestore?.reads || 0) + costs.firestoreReads,
      writes: (existing?.firestore?.writes || 0) + costs.firestoreWrites,
      costUsd: (existing?.firestore?.costUsd || 0) + costs.firestoreCost,
    },
    storage: {
      uploads:
        (existing?.storage?.uploads || 0) +
        Array.from(aggregated.storage.values()).reduce((sum, s) => sum + s.uploads, 0),
      downloads:
        (existing?.storage?.downloads || 0) +
        Array.from(aggregated.storage.values()).reduce((sum, s) => sum + s.downloads, 0),
      bytesTransferred:
        (existing?.storage?.bytesTransferred || 0) +
        Array.from(aggregated.storage.values()).reduce(
          (sum, s) => sum + s.bytesUp + s.bytesDown,
          0
        ),
      costUsd: (existing?.storage?.costUsd || 0) + costs.storageCost,
    },
    totalCostUsd: (existing?.totalCostUsd || 0) + costs.totalCost,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

function mergePeriodUsage(
  existing: UsagePeriod | undefined,
  aggregated: AggregatedUsage,
  costs: AggregatedCosts,
  userId: string,
  period: string,
  now: Date
): Partial<UsagePeriod> {
  const timestamp = admin.firestore.Timestamp.now();

  // Calculate period dates
  const [year, month] = period.split('_').map(Number);
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Merge AI usage
  const ai: Record<
    string,
    {
      calls: number;
      inputTokens: number;
      outputTokens: number;
      estimatedCostUsd: number;
      totalLatencyMs: number;
      errors: number;
    }
  > = { ...(existing?.ai || {}) };
  for (const [key, usage] of aggregated.ai) {
    const model = key.startsWith('gemini-2.5-flash') ? 'gemini-2.5-flash' : 'gemini-2.0-flash';
    const cost = calculateAICost(model, usage.inputTokens, usage.outputTokens);

    if (!ai[key]) {
      ai[key] = {
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        totalLatencyMs: 0,
        errors: 0,
      };
    }
    ai[key].calls += usage.calls;
    ai[key].inputTokens += usage.inputTokens;
    ai[key].outputTokens += usage.outputTokens;
    ai[key].estimatedCostUsd += cost;
    ai[key].totalLatencyMs += usage.latencyMs;
    ai[key].errors += usage.errors;
  }

  // Merge speech usage
  const speech: Record<
    string,
    {
      calls: number;
      totalDurationMs: number;
      billableMinutes: number;
      estimatedCostUsd: number;
      longRunningCalls: number;
      errors: number;
    }
  > = { ...(existing?.speech || {}) };
  if (aggregated.speech.calls > 0) {
    const key = 'transcription';
    if (!speech[key]) {
      speech[key] = {
        calls: 0,
        totalDurationMs: 0,
        billableMinutes: 0,
        estimatedCostUsd: 0,
        longRunningCalls: 0,
        errors: 0,
      };
    }
    speech[key].calls += aggregated.speech.calls;
    speech[key].totalDurationMs += aggregated.speech.durationMs;
    speech[key].billableMinutes = getBillableMinutes(speech[key].totalDurationMs);
    speech[key].estimatedCostUsd = calculateSpeechCost(speech[key].totalDurationMs);
    speech[key].longRunningCalls += aggregated.speech.longRunning;
    speech[key].errors += aggregated.speech.errors;
  }

  // Merge storage usage
  const storage: Record<
    string,
    {
      uploadCount: number;
      downloadCount: number;
      deleteCount: number;
      bytesUploaded: number;
      bytesDownloaded: number;
      estimatedCostUsd: number;
    }
  > = { ...(existing?.storage || {}) };
  for (const [key, usage] of aggregated.storage) {
    if (!storage[key]) {
      storage[key] = {
        uploadCount: 0,
        downloadCount: 0,
        deleteCount: 0,
        bytesUploaded: 0,
        bytesDownloaded: 0,
        estimatedCostUsd: 0,
      };
    }
    storage[key].uploadCount += usage.uploads;
    storage[key].downloadCount += usage.downloads;
    storage[key].deleteCount += usage.deletes;
    storage[key].bytesUploaded += usage.bytesUp;
    storage[key].bytesDownloaded += usage.bytesDown;
    storage[key].estimatedCostUsd = calculateStorageCost(
      storage[key].uploadCount + storage[key].downloadCount,
      0
    );
  }

  // Merge firestore usage
  const firestore: Record<
    string,
    { reads: number; writes: number; deletes: number; estimatedCostUsd: number }
  > = { ...(existing?.firestore || {}) };
  for (const [key, usage] of aggregated.firestore) {
    if (!firestore[key]) {
      firestore[key] = { reads: 0, writes: 0, deletes: 0, estimatedCostUsd: 0 };
    }
    firestore[key].reads += usage.reads;
    firestore[key].writes += usage.writes;
    firestore[key].deletes += usage.deletes;
    firestore[key].estimatedCostUsd = calculateFirestoreCost(
      firestore[key].reads,
      firestore[key].writes,
      firestore[key].deletes
    );
  }

  // Calculate totals
  let totalAiInputTokens = 0;
  let totalAiOutputTokens = 0;
  let totalAiCost = 0;
  for (const usage of Object.values(ai)) {
    totalAiInputTokens += usage.inputTokens;
    totalAiOutputTokens += usage.outputTokens;
    totalAiCost += usage.estimatedCostUsd;
  }

  let totalSpeechMinutes = 0;
  let totalSpeechCost = 0;
  for (const usage of Object.values(speech)) {
    totalSpeechMinutes += usage.billableMinutes;
    totalSpeechCost += usage.estimatedCostUsd;
  }

  let totalStorageCost = 0;
  for (const usage of Object.values(storage)) {
    totalStorageCost += usage.estimatedCostUsd;
  }

  let totalFirestoreReads = 0;
  let totalFirestoreWrites = 0;
  let totalFirestoreCost = 0;
  for (const usage of Object.values(firestore)) {
    totalFirestoreReads += usage.reads;
    totalFirestoreWrites += usage.writes;
    totalFirestoreCost += usage.estimatedCostUsd;
  }

  return {
    userId,
    period,
    startDate,
    endDate,
    status: 'current',
    ai,
    speech,
    storage,
    firestore,
    totals: {
      costUsd: totalAiCost + totalSpeechCost + totalStorageCost + totalFirestoreCost,
      aiCostUsd: totalAiCost,
      aiInputTokens: totalAiInputTokens,
      aiOutputTokens: totalAiOutputTokens,
      speechCostUsd: totalSpeechCost,
      speechMinutes: totalSpeechMinutes,
      storageCostUsd: totalStorageCost,
      firestoreCostUsd: totalFirestoreCost,
      firestoreReads: totalFirestoreReads,
      firestoreWrites: totalFirestoreWrites,
    },
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
    daysCounted: (existing?.daysCounted || 0) + (existing ? 0 : 1),
  };
}

function mergeSummaryUsage(
  existing: UsageSummary | undefined,
  aggregated: AggregatedUsage,
  costs: AggregatedCosts,
  userId: string,
  now: Date
): Partial<UsageSummary> {
  const timestamp = admin.firestore.Timestamp.now();

  // Calculate period dates
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Check if we're in a new period
  const existingStartDate = existing?.currentPeriod?.startDate;
  const isNewPeriod = existingStartDate && existingStartDate !== startDate;

  // If new period, reset current period counters
  const currentPeriod = isNewPeriod
    ? {
        startDate,
        endDate,
        totalCostUsd: costs.totalCost,
        aiCostUsd: costs.aiCost,
        speechCostUsd: costs.speechCost,
        storageCostUsd: costs.storageCost,
        firestoreCostUsd: costs.firestoreCost,
        aiCalls: costs.aiCalls,
        totalTokens: costs.totalTokens,
        speechMinutes: costs.speechMinutes,
        firestoreReads: costs.firestoreReads,
        firestoreWrites: costs.firestoreWrites,
      }
    : {
        startDate,
        endDate,
        totalCostUsd: (existing?.currentPeriod?.totalCostUsd || 0) + costs.totalCost,
        aiCostUsd: (existing?.currentPeriod?.aiCostUsd || 0) + costs.aiCost,
        speechCostUsd: (existing?.currentPeriod?.speechCostUsd || 0) + costs.speechCost,
        storageCostUsd: (existing?.currentPeriod?.storageCostUsd || 0) + costs.storageCost,
        firestoreCostUsd: (existing?.currentPeriod?.firestoreCostUsd || 0) + costs.firestoreCost,
        aiCalls: (existing?.currentPeriod?.aiCalls || 0) + costs.aiCalls,
        totalTokens: (existing?.currentPeriod?.totalTokens || 0) + costs.totalTokens,
        speechMinutes: (existing?.currentPeriod?.speechMinutes || 0) + costs.speechMinutes,
        firestoreReads: (existing?.currentPeriod?.firestoreReads || 0) + costs.firestoreReads,
        firestoreWrites: (existing?.currentPeriod?.firestoreWrites || 0) + costs.firestoreWrites,
      };

  return {
    userId,
    currentPeriod,
    lifetime: {
      totalCostUsd: (existing?.lifetime?.totalCostUsd || 0) + costs.totalCost,
      firstActivityAt: existing?.lifetime?.firstActivityAt || timestamp,
      aiCalls: (existing?.lifetime?.aiCalls || 0) + costs.aiCalls,
      speechMinutes: (existing?.lifetime?.speechMinutes || 0) + costs.speechMinutes,
    },
    limits: existing?.limits || {
      monthlyBudgetUsd: null,
      monthlyAiCalls: null,
      monthlySpeechMinutes: null,
      alertThresholdPercent: 80,
      alertTriggered: false,
      alertTriggeredAt: null,
    },
    lastUpdated: timestamp,
    schemaVersion: '1.0',
  };
}
