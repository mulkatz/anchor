/**
 * Cost Calculator
 *
 * Calculates costs for various Google Cloud services based on current pricing.
 * All prices are in USD.
 *
 * Pricing last updated: December 2024
 */

import { AIModel } from './types';

// ============================================
// Pricing Constants
// ============================================

export const PRICING = {
  // Gemini 2.5 Flash (per 1M tokens)
  GEMINI_25_FLASH: {
    inputPerMillion: 0.15, // $0.15 per 1M input tokens
    outputPerMillion: 0.6, // $0.60 per 1M output tokens
  },

  // Gemini 2.0 Flash (per 1M tokens)
  GEMINI_20_FLASH: {
    inputPerMillion: 0.1, // $0.10 per 1M input tokens
    outputPerMillion: 0.4, // $0.40 per 1M output tokens
  },

  // Speech-to-Text Enhanced (per minute)
  SPEECH_TO_TEXT: {
    perMinute: 0.036, // $0.036 per minute
    minimumBillableSeconds: 15, // Billed in 15-second increments
  },

  // Cloud Storage (per month)
  CLOUD_STORAGE: {
    perGbMonth: 0.026, // $0.026 per GB/month
    perOperation: 0.000005, // $0.05 per 10K operations = $0.000005 per operation
  },

  // Cloud Functions
  CLOUD_FUNCTIONS: {
    perInvocation: 0.0000004, // $0.40 per million
    perGbSecond: 0.000016667, // $0.0000166667 per GB-second
  },

  // Firestore
  FIRESTORE: {
    perRead: 0.0000006, // $0.06 per 100K reads
    perWrite: 0.0000018, // $0.18 per 100K writes
    perDelete: 0.0000002, // $0.02 per 100K deletes
  },
} as const;

// ============================================
// Cost Calculation Functions
// ============================================

/**
 * Calculate cost for AI (Gemini) usage
 */
export function calculateAICost(model: AIModel, inputTokens: number, outputTokens: number): number {
  const pricing = model === 'gemini-2.5-flash' ? PRICING.GEMINI_25_FLASH : PRICING.GEMINI_20_FLASH;

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMillion;

  return roundCost(inputCost + outputCost);
}

/**
 * Calculate cost for Speech-to-Text usage
 * Google bills in 15-second increments, rounded up
 */
export function calculateSpeechCost(durationMs: number): number {
  if (durationMs <= 0) return 0;

  // Convert to seconds
  const seconds = Math.ceil(durationMs / 1000);

  // Round up to 15-second increments
  const billableIncrements = Math.ceil(seconds / PRICING.SPEECH_TO_TEXT.minimumBillableSeconds);
  const billableSeconds = billableIncrements * PRICING.SPEECH_TO_TEXT.minimumBillableSeconds;

  // Convert to minutes for billing
  const billableMinutes = billableSeconds / 60;

  return roundCost(billableMinutes * PRICING.SPEECH_TO_TEXT.perMinute);
}

/**
 * Get billable minutes from duration (for display)
 */
export function getBillableMinutes(durationMs: number): number {
  if (durationMs <= 0) return 0;

  const seconds = Math.ceil(durationMs / 1000);
  const billableIncrements = Math.ceil(seconds / PRICING.SPEECH_TO_TEXT.minimumBillableSeconds);
  const billableSeconds = billableIncrements * PRICING.SPEECH_TO_TEXT.minimumBillableSeconds;

  return roundToDecimals(billableSeconds / 60, 2);
}

/**
 * Calculate cost for Cloud Storage operations
 * Note: Actual storage cost requires knowing how long data is stored
 */
export function calculateStorageCost(uploadOps: number, downloadOps: number): number {
  const opsCost = (uploadOps + downloadOps) * PRICING.CLOUD_STORAGE.perOperation;
  return roundCost(opsCost);
}

/**
 * Calculate cost for Cloud Functions
 */
export function calculateFunctionsCost(invocations: number, gbSeconds: number): number {
  const invocationCost = invocations * PRICING.CLOUD_FUNCTIONS.perInvocation;
  const computeCost = gbSeconds * PRICING.CLOUD_FUNCTIONS.perGbSecond;
  return roundCost(invocationCost + computeCost);
}

/**
 * Calculate cost for Firestore operations
 */
export function calculateFirestoreCost(reads: number, writes: number, deletes: number = 0): number {
  const cost =
    reads * PRICING.FIRESTORE.perRead +
    writes * PRICING.FIRESTORE.perWrite +
    deletes * PRICING.FIRESTORE.perDelete;

  return roundCost(cost);
}

// ============================================
// Estimation Helpers
// ============================================

/**
 * Estimate total cost for a typical chat message cycle
 * Useful for quick cost projections
 */
export function estimateChatCycleCost(params: {
  historyMessages?: number;
  inputTokens?: number;
  outputTokens?: number;
  hasVoice?: boolean;
  audioDurationMs?: number;
}): { total: number; breakdown: Record<string, number> } {
  const {
    historyMessages = 75,
    inputTokens = 2000,
    outputTokens = 500,
    hasVoice = false,
    audioDurationMs = 0,
  } = params;

  const aiCost = calculateAICost('gemini-2.5-flash', inputTokens, outputTokens);
  const speechCost = hasVoice ? calculateSpeechCost(audioDurationMs) : 0;

  // Estimate Firestore: read history + write 2 messages + update conversation
  const firestoreReads = historyMessages + 1; // History + conversation doc
  const firestoreWrites = 3; // User message + AI message + conversation update
  const firestoreCost = calculateFirestoreCost(firestoreReads, firestoreWrites);

  const total = roundCost(aiCost + speechCost + firestoreCost);

  return {
    total,
    breakdown: {
      ai: aiCost,
      speech: speechCost,
      firestore: firestoreCost,
    },
  };
}

/**
 * Estimate monthly cost for a user based on usage patterns
 */
export function estimateMonthlyUserCost(params: {
  dailyMessages?: number;
  percentVoice?: number;
  avgAudioDurationMs?: number;
  dailyDiveSessions?: number;
}): number {
  const {
    dailyMessages = 10,
    percentVoice = 20,
    avgAudioDurationMs = 30000,
    dailyDiveSessions = 0.5,
  } = params;

  const daysInMonth = 30;
  const voiceMessages = dailyMessages * (percentVoice / 100) * daysInMonth;
  const textMessages = dailyMessages * (1 - percentVoice / 100) * daysInMonth;

  // Text messages: AI cost only
  const textChatEstimate = estimateChatCycleCost({});
  const textCost = textMessages * textChatEstimate.total;

  // Voice messages: AI + Speech cost
  const voiceChatEstimate = estimateChatCycleCost({
    hasVoice: true,
    audioDurationMs: avgAudioDurationMs,
  });
  const voiceCost = voiceMessages * voiceChatEstimate.total;

  // Dive sessions (similar to chat, fewer messages)
  const diveSessions = dailyDiveSessions * daysInMonth;
  const diveCost = diveSessions * calculateAICost('gemini-2.5-flash', 1500, 400) * 5; // Avg 5 exchanges per session

  return roundCost(textCost + voiceCost + diveCost);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Round cost to 8 decimal places (for precision in aggregation)
 */
function roundCost(value: number): number {
  return Math.round(value * 100000000) / 100000000;
}

/**
 * Round to specific decimal places (for display)
 */
function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format cost for display (2 decimal places, USD)
 */
export function formatCostUsd(cost: number): string {
  return `$${cost.toFixed(2)}`;
}

/**
 * Format large numbers (e.g., tokens) for display
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}
