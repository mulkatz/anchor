/**
 * Usage Monitoring Module
 *
 * Exports all usage tracking functionality:
 * - Types for usage data structures
 * - Cost calculator for pricing
 * - Token extractor for Gemini responses
 * - Usage tracker for event batching and persistence
 * - Admin functions for scheduled aggregation
 * - Migration functions for initialization
 */

// Types
export * from './types';

// Cost calculation
export {
  PRICING,
  calculateAICost,
  calculateSpeechCost,
  calculateStorageCost,
  calculateFunctionsCost,
  calculateFirestoreCost,
  estimateChatCycleCost,
  estimateMonthlyUserCost,
  formatCostUsd,
  formatLargeNumber,
  getBillableMinutes,
} from './costCalculator';

// Token extraction from Gemini responses
export { extractTokenUsage, extractResponseText, extractFinishReason } from './tokenExtractor';

// Usage tracking
export { trackUsage, flushUsage, trackUsageAsync } from './usageTracker';

// Admin scheduled functions
export {
  aggregateDailyUsage,
  archiveMonthlyUsage,
  cleanupOldDailyRecords,
  resetMonthlySummaries,
} from './admin';

// Migration
export { initializeUserUsage, initializeSingleUserUsage } from './migration';
