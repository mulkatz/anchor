# The Dive - Somatic Learning Feature

**Status:** Implemented | **Last Updated:** December 13, 2024

---

## Overview

**The Dive** is an interactive somatic learning experience based on Polyvagal Theory. Users explore their nervous system through an ocean depth metaphor, guided by an AI "Somatic Guide" through 25 distinct lessons.

### Ocean Metaphor Zones

| Zone             | Nervous System State | Theme Color             | Description             |
| ---------------- | -------------------- | ----------------------- | ----------------------- |
| **The Shallows** | Ventral Vagal        | Biolum Cyan (`#64FFDA`) | Safe, Social, Connected |
| **The Drop-off** | Sympathetic          | Warm Ember (`#FFB38A`)  | Fight/Flight, Alert     |
| **The Deep**     | Dorsal Vagal         | Violet (`#A78BFA`)      | Freeze/Shutdown, Still  |

---

## Architecture

### Frontend Files

```
app/src/
├── pages/
│   ├── DivePage.tsx              # Ocean Depth Map (lesson overview)
│   └── DiveLessonPage.tsx        # Lesson intro + chat session
├── components/features/dive/
│   └── DiveChatContainer.tsx     # Message display with completion card
├── contexts/
│   └── DiveContext.tsx           # Progress state + localStorage cache
├── hooks/
│   ├── useDiveSession.tsx        # Session/message management
│   └── useDiveLesson.tsx         # Localized lesson content fetching
└── data/
    └── dive-lessons.ts           # Static lesson data (25 lessons)
```

### Backend Files

```
backend/functions/src/
├── diveChat.ts                   # AI responses + lesson completion
├── divePrompt.ts                 # Somatic Guide persona builder
├── diveLessonData.ts             # Localized lesson content (en/de)
└── index.ts                      # Exports dive functions
```

### Cloud Functions

| Function                   | Trigger          | Purpose                                        |
| -------------------------- | ---------------- | ---------------------------------------------- |
| `onDiveSessionCreate`      | Firestore create | Sends opening AI message                       |
| `onDiveMessageCreate`      | Firestore write  | Processes user messages, generates AI response |
| `onDiveAudioMessageCreate` | Firestore create | Transcribes voice messages                     |
| `getDiveLesson`            | Callable         | Returns localized lesson content               |

---

## Data Models

### Firestore Collections

```
users/{userId}/
├── dive_progress/
│   └── summary                   # Single doc with all progress
└── dive_sessions/{sessionId}/
    └── messages/{messageId}      # Chat messages
```

### DiveProgressSummary

```typescript
interface DiveProgressSummary {
  userId: string;
  currentLessonId: string; // e.g., "L05"
  unlockedLessons: string[]; // ["L01", "L02", ...]
  completedLessons: string[]; // ["L01", "L02", ...]
  totalReflections: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### DiveMessage

```typescript
interface DiveMessage {
  id: string;
  sessionId: string;
  userId: string;
  lessonId: string;
  text: string;
  role: 'user' | 'guide';
  createdAt: Date;
  hasAudio?: boolean;
  audioPath?: string;
  audioDuration?: number;
  transcriptionStatus?: 'pending' | 'completed' | 'failed';
  metadata?: {
    language?: string;
    isLessonComplete?: boolean;
    // ... other metadata
  };
}
```

### Static Lesson Data

```typescript
interface DiveLesson {
  id: string; // "L01" - "L25"
  zone: DiveZone; // 'The Shallows' | 'The Drop-off' | 'The Deep'
  title: string;
  clinical_concept: string;
  source_material: string;
  ocean_metaphor: string;
  common_resistance: string;
  socratic_goal: string;
  suggested_reading?: string;
  suggested_reading_isbn_link?: string; // Amazon search link by ISBN
  safety_notes?: string;
}
```

---

## State Management

### DiveContext

Provides global dive state with **localStorage caching** for instant loads:

```typescript
interface DiveContextValue {
  progress: DiveProgressSummary | null;
  isLoading: boolean;
  currentLesson: DiveLesson | null;
  getLessonStatus: (lessonId: string) => 'locked' | 'in-progress' | 'completed';
  isLessonUnlocked: (lessonId: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;
  initializeProgress: () => Promise<void>;
  refreshProgress: () => void;
}
```

### Persistence Strategy

| Data     | Local Cache            | Firestore               | Real-time        |
| -------- | ---------------------- | ----------------------- | ---------------- |
| Progress | localStorage (24h TTL) | `dive_progress/summary` | Yes (onSnapshot) |
| Settings | localStorage           | `profile/settings`      | Yes              |
| Sessions | None                   | `dive_sessions/**`      | Yes              |

**Auto-initialization:** When a user first visits The Dive, progress is automatically created with L01 unlocked.

---

## Lesson Completion Flow

1. **AI Detection:** AI includes `[LESSON_COMPLETE]` marker in response when user has engaged meaningfully
2. **Backend Processing:** `diveChat.ts` detects marker, calls `updateLessonProgress()`
3. **Progress Update:**
   - Current lesson marked completed
   - Next lesson unlocked
   - `currentLessonId` updated
4. **Frontend Reaction:**
   - `isLessonComplete` flag set in `useDiveSession`
   - `LessonCompleteCard` displayed in chat
   - Progress synced via Firestore listener

---

## Internationalization

### Translation Keys

```
dive.title
dive.subtitle
dive.beginDive
dive.suggestedReading
dive.lessonNotFound
dive.noLessons
dive.zones.shallows / dropOff / deep
dive.zoneDescriptions.shallows / dropOff / deep
dive.lessonComplete.label / title / description / continue
```

### Localized Lesson Content

Lessons are stored in `diveLessonData.ts` with full translations:

```typescript
const lessonTranslations: Record<SupportedLanguage, Record<string, DiveLessonContent>> = {
  'en-US': { 'L01': { zone: 'The Shallows', title: '...', ... } },
  'de-DE': { 'L01': { zone: 'Die Untiefen', title: '...', ... } },
};
```

The `getDiveLesson` callable function returns localized content based on user's language setting.

---

## Voice Message Flow

Same architecture as regular chat, but with separate storage path:

1. **Upload:** `dive-audio/{userId}/{sessionId}/{messageId}.m4a`
2. **Trigger:** `onDiveAudioMessageCreate` Cloud Function
3. **Transcription:** Google Cloud Speech-to-Text
4. **AI Response:** `onDiveMessageCreate` triggered after transcription

### Storage Rules

```javascript
match /dive-audio/{userId}/{sessionId}/{messageId} {
  allow write: if isOwner(userId) && size < 5MB && isAudio;
  allow read: if isOwner(userId);
}
```

---

## UI Components

### DivePage (Ocean Depth Map)

- Visual grid of all 25 lessons organized by zone
- Zone headers with themed colors
- Lesson nodes showing status (locked/unlocked/completed/current)
- Current lesson has glowing ring effect

### DiveLessonPage

Two states:

1. **Intro:** Lesson card with title, concept, ocean metaphor preview, "Begin Dive" button
2. **Session:** Full chat interface with `ChatInput` and `DiveChatContainer`

### DiveChatContainer

- Reuses standard chat components (`AssistantMessage`, `UserMessage`, `AudioMessageBubble`)
- Smart scrolling: Long messages scroll to show start, short messages scroll to bottom
- `LessonCompleteCard` displayed when lesson is marked complete

### Zone Theming

```typescript
const zoneThemes = {
  'The Shallows': { primary: '#64FFDA', glow: 'rgba(100, 255, 218, 0.3)' },
  'The Drop-off': { primary: '#FFB38A', glow: 'rgba(255, 179, 138, 0.3)' },
  'The Deep': { primary: '#A78BFA', glow: 'rgba(167, 139, 250, 0.3)' },
};
```

---

## AI Somatic Guide

### Persona

The AI acts as a calm, compassionate Somatic Guide who:

- Uses ocean/water metaphors extensively
- Never uses clinical jargon
- Moves slowly and atmospherically
- Asks reflective Socratic questions
- Handles resistance with pre-defined reframes

### System Prompt Structure

Built dynamically in `divePrompt.ts`:

1. Base persona (calm, slow, ocean-themed)
2. Current lesson context (JSON)
3. Behavioral rules (The Loop, resistance handling)
4. Temporal context (time of day, session breaks)
5. Language-specific instructions

### Completion Detection

AI is instructed to include `[LESSON_COMPLETE]` when:

- User has genuinely engaged with the concept
- Reflection quality indicates understanding
- User signals readiness ("I think I get it", "ready to continue")

---

## Navigation

**Navbar Order:** SOS → Chat → Vault → **Dive** → Profile

**Routes:**

- `/dive` - Ocean Depth Map
- `/dive/:lessonId` - Lesson page (intro + session)

---

## Data Management

### Export

Dive data included in user export:

- `diveProgress`: All progress documents
- `diveSessions`: All sessions with messages

### Delete

On data deletion:

- Firestore: `dive_progress/*`, `dive_sessions/**`
- Storage: `dive-audio/{userId}/**`
- LocalStorage: `dive_progress_cache`

### Cache Clearing

```typescript
import { clearDiveProgressCache } from '../contexts/DiveContext';
clearDiveProgressCache(); // Clears localStorage cache
```

---

## Styling Consistency

All dive pages follow the standard page pattern:

```tsx
<div className="bg-void-blue/85 flex h-full flex-col overflow-hidden">
  <header className="border-glass-border pt-safe shrink-0 border-b px-6 py-4">
    {/* Header content */}
  </header>
  <div
    className="flex-1 overflow-y-auto px-4 pt-6 sm:px-6"
    style={{ paddingBottom: `${navbarBottom + 24}px` }}
  >
    {/* Scrollable content */}
  </div>
</div>
```

---

## Future Considerations

- **Offline Support:** Sessions could be queued for sync when offline
- **Progress Visualization:** Add visual progress indicator (depth meter)
- **Reminders:** Gentle notifications to continue lessons
- **Audio Exercises:** Guided breathing/grounding audio within lessons
