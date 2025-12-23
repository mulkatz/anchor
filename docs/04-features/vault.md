# Vault (Session History)

**Read this when:** Working on the archive/vault page, conversation cards, AI title generation, or understanding how conversation history is displayed.

---

## Overview

The Vault is the session history browser where users can review past conversations. Each conversation displays an AI-generated title, summary, and topic tags for easy browsing.

**Status:** Implemented

---

## User Experience

### Vault Page (`/vault`)

- Displays all archived and active conversations
- Sorted by last activity (most recent first)
- Filter tabs: All, Active, Archived
- Each conversation shown as a card with:
  - AI-generated title (or fallback to first message)
  - AI-generated summary preview
  - Topic tags (2-3 relevant themes)
  - Message count and date metadata
  - Crisis indicator if applicable

### Conversation Card

```
┌─────────────────────────────────────────┐
│ Navigating Work Worries                 │  <- AI title
│                                         │
│ Processing some tough feelings about    │  <- AI summary
│ the workplace and finding ways to       │     (4 lines max)
│ breathe through it.                     │
│                                         │
│ [work] [overwhelm] [breathing]          │  <- Topic tags
│                                         │
│ 12 messages • Dec 23, 2024              │  <- Metadata
└─────────────────────────────────────────┘
```

---

## AI Title Generation

### Progressive Generation Strategy

Titles are generated at two points for optimal UX:

| Stage     | Trigger               | Context      | Purpose                          |
| --------- | --------------------- | ------------ | -------------------------------- |
| **Draft** | 3+ user messages      | Last 20 msgs | Quick title while chat is active |
| **Final** | Conversation archived | All messages | Refined title with full context  |

### Generation Process

1. **Immediate fallback**: First user message truncated to 50 chars
2. **Draft title**: After 3 user messages, AI generates title/summary/topics
3. **Final title**: On archive, regenerates with complete conversation

### Why Progressive?

- Users see meaningful titles quickly (not "Untitled Conversation")
- Final title captures the full conversation arc
- Avoids expensive AI calls for very short conversations

---

## Technical Implementation

### Data Model

**Conversation.metadata extensions:**

```typescript
metadata?: {
  // Existing fields
  hasCrisisMessages?: boolean;
  firstUserMessage?: string;
  lastUserMessage?: string;

  // AI title fields
  aiTitle?: string;              // AI-generated title (max ~50 chars)
  aiSummary?: string;            // AI-generated summary (1-2 sentences)
  aiTopics?: string[];           // 2-3 topic tags from vocabulary
  titleGeneration?: {
    version: 'draft' | 'final';
    generatedAt: Date;
    messageCountAtGeneration: number;
  };
};
```

### Backend Functions

**Location:** `backend/functions/src/`

| File                   | Function                              | Purpose                         |
| ---------------------- | ------------------------------------- | ------------------------------- |
| `conversationTitle.ts` | `generateConversationTitleAndSummary` | Core AI generation logic        |
| `conversations.ts`     | `generateConversationTitle`           | Trigger on new messages (draft) |
| `conversations.ts`     | `regenerateTitleOnArchive`            | Trigger on archive (final)      |

### Firestore Triggers

```typescript
// Draft generation - fires on message creation
onDocumentWritten('users/{userId}/conversations/{conversationId}/messages/{messageId}');

// Final generation - fires on conversation status change
onDocumentWritten('users/{userId}/conversations/{conversationId}');
```

### Required Index

**Location:** `backend/functions/firestore.indexes.json`

```json
{
  "collectionGroup": "messages",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "role", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

## Topic Vocabulary

Predefined topics ensure consistent tagging across languages.

### English Topics (20)

```
work, relationships, family, health, sleep, social, finances, self-worth,
future, past, breathing, grounding, panic, overwhelm, loneliness,
uncertainty, perfectionism, boundaries, change, loss
```

### German Topics (20)

```
arbeit, beziehungen, familie, gesundheit, schlaf, soziales, finanzen,
selbstwert, zukunft, vergangenheit, atmung, erdung, panik, ueberforderung,
einsamkeit, unsicherheit, perfektionismus, grenzen, veraenderung, verlust
```

**Note:** Topics are stored lowercase and matched against the vocabulary. Frontend uses i18n keys for display (`topics.work`, `topics.arbeit`).

---

## AI Prompt Design

The prompt generates warm, empathetic titles that feel personal rather than clinical.

### Title Style

- Creative and warm, but clear
- Focus on the theme, not the user
- Examples:
  - "Navigating Work Worries"
  - "Untangling Sunday Thoughts"
  - "Finding Breathing Room"
  - "Sorting Through Relationship Questions"

### Summary Style

- Warm and friendly, like a good friend would write
- Starts directly with the essence (not "A chat about...")
- 1-2 short sentences
- Examples:
  - "Everyday worries and finding a moment to breathe together."
  - "Working through some tough feelings about work and what comes next."
  - "Processing a difficult day and remembering what matters."

### Model Configuration

```typescript
{
  model: 'gemini-2.5-flash',
  maxOutputTokens: 2048,
  temperature: 0.4,
  topP: 0.8
}
```

---

## Frontend Components

### VaultPage

**Location:** `app/src/pages/ArchivePage.tsx`

- Real-time subscription to conversations
- Filter state (all/active/archived)
- Empty state handling
- Loading skeleton

### ConversationCard

**Location:** `app/src/components/features/archive/ConversationCard.tsx`

```tsx
// Display logic with fallbacks
const displayTitle = conversation.metadata?.aiTitle || conversation.title;
const displaySummary = conversation.metadata?.aiSummary || conversation.preview;
const topics = conversation.metadata?.aiTopics || [];

// Topic tag rendering
{
  topics.map((topic) => (
    <span className="bg-biolum-cyan/10 text-biolum-cyan/70 border-biolum-cyan/20 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
      <Tag size={10} />
      {t(`topics.${topic}`, { defaultValue: topic })}
    </span>
  ));
}
```

---

## i18n Keys

### Topic Labels

**Location:** `app/src/assets/translations/`

```json
// en-US.json
{
  "topics": {
    "work": "Work",
    "relationships": "Relationships",
    "family": "Family",
    // ... all 20 topics
  }
}

// de-DE.json
{
  "topics": {
    "arbeit": "Arbeit",
    "beziehungen": "Beziehungen",
    "familie": "Familie",
    // ... all 20 topics
  }
}
```

---

## Cost & Performance

### Per-Generation Cost

- Input: ~500-1000 tokens (conversation context)
- Output: ~50-100 tokens (JSON response)
- Cost: ~$0.0002 per generation
- Per conversation: ~$0.0004 (draft + final)

### Performance Considerations

- Fire-and-forget pattern prevents blocking chat flow
- Draft generation is async, doesn't delay message delivery
- Final generation happens on archive (user not waiting)

---

## Error Handling

| Scenario            | Behavior                           |
| ------------------- | ---------------------------------- |
| AI generation fails | Keep existing truncated title      |
| JSON parsing fails  | Log error, skip update             |
| Empty AI response   | Fall back to truncation            |
| Rate limiting       | Fire-and-forget pattern, no retry  |
| Short conversations | Still attempt generation (2+ msgs) |

---

## Key Files Reference

### Backend

| File                                         | Purpose                      |
| -------------------------------------------- | ---------------------------- |
| `backend/functions/src/conversationTitle.ts` | AI generation logic          |
| `backend/functions/src/conversations.ts`     | Firestore triggers           |
| `backend/functions/src/usage/types.ts`       | `conversation_title` feature |
| `backend/functions/firestore.indexes.json`   | Required composite index     |

### Frontend

| File                                                       | Purpose              |
| ---------------------------------------------------------- | -------------------- |
| `app/src/pages/ArchivePage.tsx`                            | Vault page           |
| `app/src/components/features/archive/ConversationCard.tsx` | Conversation display |
| `app/src/models/index.ts`                                  | Conversation type    |
| `app/src/assets/translations/*.json`                       | Topic translations   |

---

## See Also

- [Chat System Architecture](chat-system-architecture.md) - Message handling
- [Usage Monitoring](usage-monitoring.md) - Cost tracking
- [Firebase Setup](../05-implementation/firebase.md) - Firestore, Functions
