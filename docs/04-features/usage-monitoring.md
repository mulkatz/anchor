# Usage Monitoring & Cost Tracking

**Read this when:** Understanding per-user cost tracking, implementing new billable features, debugging usage data, working with admin functions, or analyzing platform costs.

---

## Overview

Comprehensive system to track AI tokens, speech-to-text minutes, storage operations, and calculate real costs per user. Provides visibility into platform usage and supports future usage caps/limits.

**Status:** Implemented

---

## Why Usage Monitoring?

As a therapeutic app with AI features, costs scale with user engagement:

- **Cost visibility** - Understand per-user operational costs
- **Budget planning** - Project costs as user base grows
- **Future rate limiting** - Infrastructure for usage caps if needed
- **User transparency** - Show users their resource consumption
- **Anomaly detection** - Identify unusual usage patterns

---

## Services Tracked

| Service              | Model/Type | Features Using It                                                         | Cost Basis                             |
| -------------------- | ---------- | ------------------------------------------------------------------------- | -------------------------------------- |
| **Gemini 2.5 Flash** | AI         | chat, dive, illuminate, insight, adaptive_language, psychological_profile | $0.15/1M input, $0.60/1M output tokens |
| **Gemini 2.0 Flash** | AI         | user_story extraction                                                     | $0.10/1M input, $0.40/1M output tokens |
| **Speech-to-Text**   | Enhanced   | transcription (chat + dive)                                               | $0.036/minute                          |
| **Cloud Storage**    | Firebase   | audio-messages, dive-audio                                                | $0.026/GB/month                        |
| **Firestore**        | NoSQL      | All reads/writes                                                          | $0.06/100K reads, $0.18/100K writes    |

---

## Architecture Flow

```
User action (chat, voice, dive) →
  Backend function processes request →
    trackUsage() called with event data →
      Events batched in memory (max 10 or 5s) →
        flushUsage() persists to Firestore →
          Updates: daily doc + period doc + summary doc

Frontend subscribes to usage/{userId} →
  Real-time updates in UsageCard component
```

---

## Data Model

### Firestore Structure

```
usage/{userId}                    # Summary document (quick overview)
usage/{userId}/current/{YYYY_MM}  # Current month details
usage/{userId}/history/{YYYY_MM}  # Archived months
usage/{userId}/daily/{YYYY-MM-DD} # Daily granularity (30-day rolling)

usage_admin/
├── daily/{YYYY-MM-DD}            # Daily platform aggregates
└── alerts/                       # Triggered limit alerts (future)
```

### Summary Document: `usage/{userId}`

```typescript
interface UsageSummary {
  userId: string;

  currentPeriod: {
    startDate: string; // "2024-12-01"
    endDate: string; // "2024-12-31"
    totalCostUsd: number; // Total cost this month

    // Cost breakdown
    aiCostUsd: number;
    speechCostUsd: number;
    storageCostUsd: number;
    firestoreCostUsd: number;

    // Usage metrics
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
```

### Period Document: `usage/{userId}/current/{YYYY_MM}`

Detailed breakdown by service, feature, and model:

```typescript
interface UsagePeriod {
  userId: string;
  period: string;  // "2024_12"
  status: 'current' | 'archived';

  ai: {
    // Key format: "{model}_{feature}"
    'gemini-2.5-flash_chat': {
      calls: number;
      inputTokens: number;
      outputTokens: number;
      estimatedCostUsd: number;
      totalLatencyMs: number;
      errors: number;
    };
    'gemini-2.5-flash_dive': { ... };
    'gemini-2.0-flash_user_story': { ... };
  };

  speech: {
    transcription: {
      calls: number;
      totalDurationMs: number;
      billableMinutes: number;
      estimatedCostUsd: number;
      longRunningCalls: number;
      errors: number;
    };
  };

  storage: { ... };
  firestore: { ... };

  totals: {
    costUsd: number;
    aiInputTokens: number;
    aiOutputTokens: number;
    speechMinutes: number;
    firestoreReads: number;
    firestoreWrites: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Backend Implementation

### Core Tracking Service

**Location:** `/backend/functions/src/usage/usageTracker.ts`

**Key Functions:**

```typescript
// Track a usage event (batched for efficiency)
trackUsage(event: UsageEvent): void

// Force flush all pending events for a user
flushUsage(userId: string): Promise<void>

// Track asynchronously (fire-and-forget)
trackUsageAsync(event: UsageEvent): void
```

**Batching Strategy:**

- Events accumulate in memory (max 10 events OR 5 seconds)
- Single transaction updates 3 documents: daily, period, summary
- Minimizes Firestore write costs

### Token Extraction

**Location:** `/backend/functions/src/usage/tokenExtractor.ts`

```typescript
import { extractTokenUsage } from './usage';

// After any Gemini generateContent() call:
const result = await model.generateContent({ ... });
const tokenUsage = extractTokenUsage(result);
// Returns: { inputTokens: number, outputTokens: number }
```

### Cost Calculator

**Location:** `/backend/functions/src/usage/costCalculator.ts`

```typescript
// Pricing constants (December 2024)
export const PRICING = {
  GEMINI_25_FLASH: { inputPerMillion: 0.15, outputPerMillion: 0.60 },
  GEMINI_20_FLASH: { inputPerMillion: 0.10, outputPerMillion: 0.40 },
  SPEECH_TO_TEXT: { perMinute: 0.036 },
  STORAGE: { operationsPerMillion: 0.05 },
  FIRESTORE: { readsPerHundredK: 0.06, writesPerHundredK: 0.18 },
};

// Calculate costs
calculateAICost(model, inputTokens, outputTokens): number
calculateSpeechCost(durationMs): number
calculateStorageCost(operations, bytes): number
calculateFirestoreCost(reads, writes): number
```

---

### Integration Pattern

Every function that uses billable services follows this pattern:

```typescript
import { trackUsage, flushUsage, extractTokenUsage } from './usage';

export const myFunction = onCall(async (request) => {
  const { userId } = request.data;

  // 1. Make the AI call
  const result = await model.generateContent({ ... });

  // 2. Extract and track token usage
  const tokenUsage = extractTokenUsage(result);
  trackUsage({
    userId,
    timestamp: new Date(),
    service: 'ai_gemini_25_flash',
    feature: 'my_feature',
    model: 'gemini-2.5-flash',
    inputTokens: tokenUsage.inputTokens,
    outputTokens: tokenUsage.outputTokens,
    latencyMs: responseTime,
  });

  // 3. Track Firestore operations (optional)
  trackUsage({
    userId,
    timestamp: new Date(),
    service: 'firestore',
    feature: 'my_feature',
    reads: 5,
    writes: 2,
  });

  // 4. IMPORTANT: Always flush at function end
  await flushUsage(userId);

  return result;
});
```

### Functions with Tracking

| File                                    | Feature                                                         | Model            |
| --------------------------------------- | --------------------------------------------------------------- | ---------------- |
| `chat.ts`                               | `chat`                                                          | gemini-2.5-flash |
| `diveChat.ts`                           | `dive`, `dive_opening`                                          | gemini-2.5-flash |
| `illuminate.ts`                         | `illuminate_distortions`, `illuminate_reframes`                 | gemini-2.5-flash |
| `insight.ts`                            | `insight`                                                       | gemini-2.5-flash |
| `adaptiveLanguage.ts`                   | `adaptive_language`                                             | gemini-2.5-flash |
| `userStory/extraction.ts`               | `user_story`                                                    | gemini-2.0-flash |
| `psychologicalProfile/profileUpdate.ts` | `psychological_profile_initial`, `psychological_profile_update` | gemini-2.5-flash |
| `transcription.ts`                      | `transcription`                                                 | Speech-to-Text   |

---

## Scheduled Admin Functions

**Location:** `/backend/functions/src/usage/admin.ts`

### Daily Usage Aggregation

**Schedule:** 00:05 UTC daily

```typescript
export const aggregateDailyUsage = onSchedule(
  { schedule: '5 0 * * *', timeZone: 'UTC' },
  async () => {
    // Aggregates all users' daily usage into usage_admin/daily/{date}
    // Platform-wide stats: totalCost, activeUsers, totalAiCalls
  }
);
```

### Monthly Period Archival

**Schedule:** 1st of month at 01:00 UTC

```typescript
export const archiveMonthlyUsage = onSchedule(
  { schedule: '0 1 1 * *', timeZone: 'UTC' },
  async () => {
    // Moves current/{last_month} → history/{last_month}
    // Sets status: 'archived'
  }
);
```

### Monthly Summary Reset

**Schedule:** 1st of month at 00:30 UTC

```typescript
export const resetMonthlySummaries = onSchedule(
  { schedule: '30 0 1 * *', timeZone: 'UTC' },
  async () => {
    // Resets currentPeriod counters in all user summaries
    // Sets new startDate/endDate for the month
  }
);
```

### Daily Records Cleanup

**Schedule:** 02:00 UTC daily

```typescript
export const cleanupOldDailyRecords = onSchedule(
  { schedule: '0 2 * * *', timeZone: 'UTC' },
  async () => {
    // Deletes daily records older than 30 days
    // Rolling retention policy
  }
);
```

---

## Frontend Implementation

### Usage Hook

**Location:** `/app/src/hooks/useUsage.tsx`

```typescript
export function useUsage(): UseUsageReturn {
  // Real-time subscription to usage/{userId}
  // Returns: { summary, loading, error }
}

// Helper formatters
formatTokenCount(485000); // "485K"
formatCost(2.47); // "$2.47"
formatSpeechMinutes(8.1); // "8.1 min"
getPeriodDisplayName(date); // "December 2024"
getDaysRemaining(endDate); // 8
```

### Usage Card Component

**Location:** `/app/src/components/features/profile/UsageCard.tsx`

Displays in profile page:

- Total estimated cost (large, prominent)
- AI calls count + token usage
- Voice minutes used
- Period name + days remaining
- Lifetime stats (subtle footer)

**Styling:** Glass morphism card matching existing profile UI.

---

## Security Rules

**Location:** `/backend/firestore.rules`

```javascript
// Usage tracking - read-only for users
match /usage/{userId} {
  // Summary document (stored directly at usage/{userId})
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Backend functions only

  // Current period documents
  match /current/{periodId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if false;
  }

  // Historical period documents
  match /history/{periodId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if false;
  }

  // Daily usage documents
  match /daily/{dateId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    allow write: if false;
  }
}

// Admin usage aggregates - backend only
match /usage_admin/{document=**} {
  allow read, write: if false;
}
```

**Key Points:**

- Users can only READ their own usage data
- All writes happen through backend functions (trusted)
- Admin aggregates are completely locked down

---

## Firestore Indexes

**Location:** `/backend/functions/firestore.indexes.json`

Required collectionGroup indexes for admin functions:

```json
{
  "collectionGroup": "daily",
  "queryScope": "COLLECTION_GROUP",
  "fields": [{ "fieldPath": "date", "order": "ASCENDING" }]
},
{
  "collectionGroup": "current",
  "queryScope": "COLLECTION_GROUP",
  "fields": [{ "fieldPath": "period", "order": "ASCENDING" }]
}
```

**Why needed:** Admin functions query across all users' subcollections.

---

## Migration

**Location:** `/backend/functions/src/usage/migration.ts`

### Initialize Existing Users

```typescript
export const initializeUserUsage = onCall(async (request) => {
  // Callable function to bootstrap usage documents
  // Run once after deploying the system

  // Call via Firebase console or:
  const initUsage = httpsCallable(functions, 'initializeUserUsage');
  await initUsage({ batchSize: 100 });
});
```

**Note:** New users get usage documents created automatically on first tracked action.

---

## Cost Analysis

### Cost of Tracking Itself

Per tracked operation (batched):

- ~0.5 Firestore writes (amortized across batch)
- At $0.18/100K writes = **~$1.60/month for 10K events/day**

This is negligible compared to AI costs.

### Example: User Cost Breakdown

**Scenario:** Active user, 1 month

| Activity       | Volume        | Unit Cost        | Total            |
| -------------- | ------------- | ---------------- | ---------------- |
| Chat messages  | 150 msgs      | ~1500 tokens avg | $0.15            |
| Dive lessons   | 10 sessions   | ~2000 tokens avg | $0.03            |
| Voice messages | 20 msgs × 30s | $0.036/min       | $0.36            |
| Illuminate     | 5 entries     | ~500 tokens      | $0.01            |
| **Total**      |               |                  | **~$0.55/month** |

### Example: What You'll See in Firestore

**`usage/user123`:**

```json
{
  "userId": "user123",
  "currentPeriod": {
    "startDate": "2024-12-01",
    "endDate": "2024-12-31",
    "totalCostUsd": 2.47,
    "aiCostUsd": 2.15,
    "speechCostUsd": 0.29,
    "aiCalls": 156,
    "totalTokens": 485000,
    "speechMinutes": 8.1
  },
  "lifetime": {
    "totalCostUsd": 12.83,
    "aiCalls": 892
  }
}
```

---

## Error Handling

| Error                         | Detection          | System Action                    |
| ----------------------------- | ------------------ | -------------------------------- |
| **Firestore write fails**     | Transaction throws | Events logged as lost, continue  |
| **Token extraction fails**    | Null usageMetadata | Track as 0 tokens, log warning   |
| **Batch timeout**             | Timer fires        | Flush whatever is batched        |
| **Function terminates early** | N/A                | flushUsage() ensures persistence |

**Note:** Events may be lost on Firestore failures. This is acceptable for non-critical tracking data.

---

## Key Files Reference

### Backend

| File                                            | Purpose                    |
| ----------------------------------------------- | -------------------------- |
| `backend/functions/src/usage/types.ts`          | TypeScript interfaces      |
| `backend/functions/src/usage/costCalculator.ts` | Cost calculation functions |
| `backend/functions/src/usage/usageTracker.ts`   | Core tracking service      |
| `backend/functions/src/usage/tokenExtractor.ts` | Gemini token extraction    |
| `backend/functions/src/usage/admin.ts`          | Scheduled functions        |
| `backend/functions/src/usage/migration.ts`      | User initialization        |
| `backend/functions/src/usage/index.ts`          | Barrel exports             |
| `backend/firestore.rules`                       | Security rules             |
| `backend/functions/firestore.indexes.json`      | Required indexes           |

### Frontend

| File                                                | Purpose                     |
| --------------------------------------------------- | --------------------------- |
| `app/src/models/index.ts`                           | UsageSummary interface      |
| `app/src/hooks/useUsage.tsx`                        | Real-time subscription hook |
| `app/src/components/features/profile/UsageCard.tsx` | Usage display card          |
| `app/src/pages/ProfilePage.tsx`                     | Integrates UsageCard        |
| `app/src/assets/translations/en-US.json`            | i18n keys                   |
| `app/src/assets/translations/de-DE.json`            | German translations         |

---

## Testing Checklist

### Backend

- [ ] AI call in chat.ts creates usage event
- [ ] Token counts match Gemini response metadata
- [ ] Batching works (events accumulate before flush)
- [ ] flushUsage() persists to all 3 documents
- [ ] Cost calculations are accurate
- [ ] Transcription duration tracked correctly

### Admin Functions

- [ ] aggregateDailyUsage runs at 00:05 UTC
- [ ] archiveMonthlyUsage moves docs correctly
- [ ] cleanupOldDailyRecords deletes old data
- [ ] resetMonthlySummaries resets counters

### Frontend

- [ ] UsageCard appears in profile
- [ ] Real-time updates work
- [ ] Formatters display correctly
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Works in both EN and DE

### Security

- [ ] Users can only read their own usage
- [ ] Direct writes to usage collection blocked
- [ ] Admin documents completely locked

---

## Future Enhancements

### Usage Caps/Limits

```typescript
// Check before AI call
if (summary.currentPeriod.aiCalls >= summary.limits.monthlyAiCalls) {
  throw new Error('Monthly AI call limit reached');
}
```

### Alert System

- Email/push notification at 80% of limit
- In-app banner when approaching cap
- Grace period before hard cutoff

### Admin Dashboard

- Platform-wide cost graphs
- Per-user cost breakdown
- Anomaly detection alerts
- Export to CSV/BigQuery

### Cost Projections

- Predict monthly cost based on current usage
- "At this rate, you'll use X by month end"

---

## See Also

- [AI Chat Feature](ai-chat.md) - Primary consumer of AI tokens
- [Voice Chat Feature](voice-chat.md) - Speech-to-text costs
- [Firebase Setup](../05-implementation/firebase.md) - Firestore, Functions
- [Security & Privacy](../07-reference/security-privacy.md) - Data handling
