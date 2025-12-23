/**
 * Usage Monitoring Types
 *
 * Type definitions for tracking AI tokens, speech-to-text minutes,
 * storage usage, and calculating real costs per user.
 */

import { Timestamp } from 'firebase-admin/firestore';

// ============================================
// Service & Feature Enums
// ============================================

export type ServiceType =
  | 'ai_gemini_25_flash'
  | 'ai_gemini_20_flash'
  | 'speech_to_text'
  | 'cloud_storage'
  | 'cloud_functions'
  | 'firestore';

export type FeatureType =
  | 'chat'
  | 'dive'
  | 'dive_opening'
  | 'illuminate_distortions'
  | 'illuminate_reframes'
  | 'insight'
  | 'adaptive_language'
  | 'user_story'
  | 'psychological_profile'
  | 'psychological_profile_initial'
  | 'psychological_profile_update'
  | 'transcription'
  | 'audio_messages'
  | 'dive_audio';

export type AIModel = 'gemini-2.5-flash' | 'gemini-2.0-flash';

// ============================================
// Usage Breakdown Types
// ============================================

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AIUsage {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  totalLatencyMs: number;
  errors: number;
}

export interface SpeechUsage {
  calls: number;
  totalDurationMs: number;
  billableMinutes: number;
  estimatedCostUsd: number;
  longRunningCalls: number;
  errors: number;
}

export interface StorageUsage {
  uploadCount: number;
  downloadCount: number;
  deleteCount: number;
  bytesUploaded: number;
  bytesDownloaded: number;
  estimatedCostUsd: number;
}

export interface FirestoreUsage {
  reads: number;
  writes: number;
  deletes: number;
  estimatedCostUsd: number;
}

// ============================================
// Document Schemas
// ============================================

/**
 * Quick summary for display and limit checking
 * Path: usage/{userId}/summary
 */
export interface UsageSummary {
  userId: string;

  currentPeriod: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    totalCostUsd: number;

    // Cost breakdown by service
    aiCostUsd: number;
    speechCostUsd: number;
    storageCostUsd: number;
    firestoreCostUsd: number;

    // Key metrics
    aiCalls: number;
    totalTokens: number; // Input + output
    speechMinutes: number;
    firestoreReads: number;
    firestoreWrites: number;
  };

  lifetime: {
    totalCostUsd: number;
    firstActivityAt: Timestamp;
    aiCalls: number;
    speechMinutes: number;
  };

  // Future caps support
  limits: {
    monthlyBudgetUsd: number | null;
    monthlyAiCalls: number | null;
    monthlySpeechMinutes: number | null;
    alertThresholdPercent: number; // e.g., 80
    alertTriggered: boolean;
    alertTriggeredAt: Timestamp | null;
  };

  lastUpdated: Timestamp;
  schemaVersion: '1.0';
}

/**
 * Detailed period breakdown
 * Path: usage/{userId}/current/{YYYY_MM} or usage/{userId}/history/{YYYY_MM}
 */
export interface UsagePeriod {
  userId: string;
  period: string; // "2024_12"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'current' | 'archived';

  // AI Usage by model and feature (key: "{model}_{feature}")
  ai: Record<string, AIUsage>;

  // Speech-to-Text Usage by feature
  speech: Record<string, SpeechUsage>;

  // Storage Usage by feature
  storage: Record<string, StorageUsage>;

  // Firestore Usage by feature
  firestore: Record<string, FirestoreUsage>;

  // Aggregated totals
  totals: {
    costUsd: number;
    aiCostUsd: number;
    aiInputTokens: number;
    aiOutputTokens: number;
    speechCostUsd: number;
    speechMinutes: number;
    storageCostUsd: number;
    firestoreCostUsd: number;
    firestoreReads: number;
    firestoreWrites: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
  daysCounted: number;
}

/**
 * Daily usage for granular analysis
 * Path: usage/{userId}/daily/{YYYY-MM-DD}
 * Retention: 30 days rolling
 */
export interface DailyUsage {
  userId: string;
  date: string; // YYYY-MM-DD

  ai: {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    byFeature: Record<
      string,
      {
        calls: number;
        inputTokens: number;
        outputTokens: number;
        costUsd: number;
      }
    >;
  };

  speech: {
    calls: number;
    durationMs: number;
    costUsd: number;
  };

  firestore: {
    reads: number;
    writes: number;
    costUsd: number;
  };

  storage: {
    uploads: number;
    downloads: number;
    bytesTransferred: number;
    costUsd: number;
  };

  totalCostUsd: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// Usage Event (Internal Tracking)
// ============================================

/**
 * Internal event structure for tracking usage
 * Not persisted directly - used for batch aggregation
 */
export interface UsageEvent {
  userId: string;
  timestamp: Date;
  service: ServiceType;
  feature: FeatureType;

  // AI-specific
  model?: AIModel;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;

  // Speech-specific
  audioDurationMs?: number;
  isLongRunning?: boolean;

  // Storage-specific
  operation?: 'upload' | 'download' | 'delete';
  bytes?: number;

  // Firestore-specific
  reads?: number;
  writes?: number;
  deletes?: number;

  // Error tracking
  isError?: boolean;
  errorCode?: string;
}

// ============================================
// Admin Aggregates
// ============================================

/**
 * Platform-wide daily aggregate
 * Path: usage_admin/daily/{YYYY-MM-DD}
 */
export interface AdminDailyAggregate {
  date: string;
  totalCostUsd: number;
  totalAiCalls: number;
  totalSpeechMinutes: number;
  activeUsers: number;
  averageCostPerUser: number;
  createdAt: Timestamp;
}

// ============================================
// Aggregation Helpers
// ============================================

export interface AggregatedUsage {
  ai: Map<
    string,
    {
      calls: number;
      inputTokens: number;
      outputTokens: number;
      latencyMs: number;
      errors: number;
    }
  >;
  speech: {
    calls: number;
    durationMs: number;
    longRunning: number;
    errors: number;
  };
  storage: Map<
    string,
    {
      uploads: number;
      downloads: number;
      deletes: number;
      bytesUp: number;
      bytesDown: number;
    }
  >;
  firestore: Map<
    string,
    {
      reads: number;
      writes: number;
      deletes: number;
    }
  >;
}
