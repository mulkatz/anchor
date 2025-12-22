# User Story: The Interested AI Companion

**Status:** Implemented
**Version:** 2.1 (Polished Mid-Term Memory)
**Last Updated:** December 2024

### Recent Updates (v2.1)

- Added validation for AI extraction values (category, status, valence)
- Improved topic deduplication with context-aware matching
- Implemented curiosity hints from `suggestedFollowUps`
- Added age-appropriate tone adjustment (35+ avoids Gen Z slang)
- Extraction runs on ALL messages (short answers like "yes" or "Sarah" are often critical)
- Full bilingual support with German stop words and forget mappings

---

## Overview

The User Story feature enables Anchor to progressively learn about users through natural conversation, building a personalized profile that enhances therapeutic effectiveness. Unlike traditional onboarding forms, this system learns organically - like a friend who pays attention over time.

### Core Philosophy

- **Natural curiosity, not interrogation** - Questions weave into conversation flow
- **Full transparency** - Users can view, edit, and delete everything the AI knows
- **Strengths-based** - Focus on resources and resilience, not just problems
- **Therapeutic utility** - Information is used to help, not just collected
- **Cross-conversation continuity** - Remember what they're going through, not just who they are

---

## Two-Tier Memory Architecture

Anchor uses a dual-memory system to remember both WHO users are and WHAT they're currently dealing with:

### Tier 1: User Story (Long-term Facts)

Stable personal facts that change rarely:

- Core identity (name, age, location)
- Life situation (occupation, living arrangement)
- Relationships (partner, pets, support system)
- Therapeutic context (triggers, coping strategies)
- Strengths (past wins, motivators)

**Path:** `users/{userId}/profile/userStory`
**Retention:** Permanent (until user deletes)

### Tier 2: Mid-Term Memory (Temporal Topics)

Current situations and problems with temporal relevance:

- Active topics they're working through ("job interview anxiety")
- Recent events ("argument with roommate")
- Ongoing challenges ("work stress", "sleep issues")
- Status tracking (active → resolved → fading)

**Path:** `users/{userId}/profile/midTermMemory`
**Retention:** 60 days max, auto-pruned

### Why Two Tiers?

| Scenario                              | User Story | Mid-Term Memory |
| ------------------------------------- | ---------- | --------------- |
| "What's my name?"                     | ✅         | ❌              |
| "Remember when I had that interview?" | ❌         | ✅              |
| "I'm a software developer"            | ✅         | ❌              |
| "My roommate and I fought yesterday"  | ❌         | ✅              |
| "How did that work thing go?"         | ❌         | ✅              |
| "You know I hate crowded places"      | ✅         | ❌              |

This separation allows the AI to:

1. Maintain stable facts across months/years
2. Track evolving situations with temporal context
3. Check in on recent issues naturally
4. Let resolved topics fade without losing permanent facts

---

## Architecture

### Data Flow

```
User sends message
       │
       ▼
┌──────────────────┐
│    chat.ts       │
│   (main flow)    │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌─────────────────┐
│ Async  │  │ Get story for   │
│Extract │  │ prompt injection│
└────────┘  └────────┬────────┘
    │                │
    ▼                ▼
┌────────┐  ┌─────────────────┐
│Firestore│ │ System prompt   │
│ update  │ │ + story context │
└────────┘  │ + therapeutic   │
            │ usage guidelines│
            └─────────────────┘
```

### Key Design Decisions

| Decision         | Choice                   | Rationale                                           |
| ---------------- | ------------------------ | --------------------------------------------------- |
| Consent Model    | Implicit                 | Natural conversation flow; user can always say no   |
| Extraction       | Async (fire-and-forget)  | No response delay; extraction happens in background |
| Storage          | Firestore only           | Privacy - no localStorage caching                   |
| History Tracking | State-change fields only | Track occupation, relationship status changes       |
| Schema           | Full from start          | All tiers available, populated opportunistically    |

---

## Data Model

### Firestore Path

```
users/{userId}/profile/userStory
```

### Schema Structure

```typescript
interface UserStory {
  userId: string;
  schemaVersion: '1.0';
  createdAt: Date;
  updatedAt: Date;
  lastExtractionAt?: Date;

  // Tier 1: Core Identity (learn early)
  coreIdentity: {
    name?: StoryFieldValue<string>;
    nickname?: StoryFieldValue<string>;
    age?: StoryFieldValue<number>;
    pronouns?: StoryFieldValue<string>;
    location?: StoryFieldValue<{ city?: string; country?: string }>;
  };

  // Tier 2: Life Situation (high context value)
  lifeSituation: {
    occupation?: StoryFieldWithHistory<{ type: string; details?: string }>;
    livingArrangement?: StoryFieldValue<string>;
    dailySchedule?: StoryFieldValue<string>;
    currentLifePhase?: StoryFieldValue<string>;
  };

  // Tier 3: Relationships (support system context)
  relationships: {
    romanticStatus?: StoryFieldWithHistory<string>;
    partnerName?: StoryFieldValue<string>;
    hasPets?: StoryFieldValue<{ has: boolean; details?: string }>;
    closeFriends?: StoryFieldValue<string>;
    familyContext?: StoryFieldValue<string>;
    supportSystem?: StoryFieldValue<string>;
  };

  // Tier 4: Background (deeper context)
  background: {
    culturalBackground?: StoryFieldValue<string>;
    upbringing?: StoryFieldValue<string>;
    significantLifeEvents?: StoryFieldValue<string[]>;
    hometown?: StoryFieldValue<string>;
  };

  // Tier 5: Personal (therapeutic value)
  personal: {
    interests?: StoryFieldValue<string[]>;
    hobbies?: StoryFieldValue<string[]>;
    copingActivities?: StoryFieldValue<string[]>;
    avoidances?: StoryFieldValue<string[]>;
  };

  // Tier 6: Therapeutic Context (sensitive, high value)
  therapeuticContext: {
    knownTriggers?: StoryFieldValue<string[]>;
    anxietyManifestations?: StoryFieldValue<string[]>;
    anxietyType?: StoryFieldValue<string>; // social, generalized, panic, health
    bodyExperience?: StoryFieldValue<string>; // how anxiety feels physically
    whatDoesntWork?: StoryFieldValue<string[]>; // things NOT to suggest
    pastTherapyExperience?: StoryFieldValue<boolean>;
    currentProfessionalSupport?: StoryFieldValue<boolean>;
    therapyFocus?: StoryFieldValue<string>; // what they're working on
  };

  // Tier 7: Strengths & Protective Factors (therapeutic resources)
  strengths: {
    whatGivesHope?: StoryFieldValue<string[]>; // sources of hope/meaning
    proudMoments?: StoryFieldValue<string[]>; // accomplishments
    pastWins?: StoryFieldValue<string[]>; // challenges overcome
    motivators?: StoryFieldValue<string[]>; // what drives them
    positiveRelationships?: StoryFieldValue<string[]>;
    coreValues?: StoryFieldValue<string[]>;
  };

  // Metadata
  extractionMeta: {
    questionsAskedCount: number;
    lastQuestionTopic?: string;
    topicsDiscovered: string[];
    topicsToExplore: string[];
    fieldsDeletedByUser: string[]; // prevent re-extraction
  };
}
```

### Field Types

```typescript
type StoryFieldConfidence = 'explicit' | 'inferred' | 'mentioned';
type StoryFieldSource = 'conversation' | 'user_edit';

interface StoryFieldValue<T> {
  value: T;
  confidence: StoryFieldConfidence;
  source: StoryFieldSource;
  learnedAt: Date;
  lastConfirmed?: Date;
}

interface StoryFieldWithHistory<T> extends StoryFieldValue<T> {
  history?: Array<{
    value: T;
    changedAt: Date;
    source: StoryFieldSource;
  }>;
}
```

---

## Mid-Term Memory Data Model

### Firestore Path

```
users/{userId}/profile/midTermMemory
```

### Schema Structure

```typescript
interface MidTermMemory {
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Recent topics/problems - max 20, older ones pruned
  recentTopics: RecentTopic[];

  // Check-in tracking to avoid repetition
  lastCheckIn?: {
    topicId: string;
    at: Date;
  };
}

interface RecentTopic {
  id: string;
  topic: string; // "job interview anxiety"
  context: string; // "Interview at Google on Friday"
  category: TopicCategory;

  // Temporal tracking
  firstMentionedAt: Date;
  lastMentionedAt: Date;
  mentionCount: number;

  // Status
  status: TopicStatus;

  // Optional: linked to user story fields
  relatedFields?: string[]; // ['therapeuticContext.knownTriggers']
}

type TopicCategory = 'work' | 'relationships' | 'health' | 'anxiety' | 'life-event' | 'other';
type TopicStatus = 'active' | 'resolved' | 'fading';
```

### Topic Lifecycle

```
User mentions problem
       │
       ▼
┌─────────────────┐
│ Topic extracted │
│ status: active  │
└────────┬────────┘
         │
    ┌────┴────────────────┐
    │                     │
    ▼                     ▼
┌────────────┐    ┌───────────────┐
│ Mentioned  │    │ Not mentioned │
│   again    │    │ for 3-7 days  │
└─────┬──────┘    └───────┬───────┘
      │                   │
      ▼                   ▼
┌────────────┐    ┌───────────────┐
│ mentionCount++│ │ AI checks in  │
│ lastMentioned │ │ "how'd it go?"│
│   updated     │ └───────┬───────┘
└────────────┘           │
                   ┌─────┴─────┐
                   │           │
                   ▼           ▼
            ┌──────────┐  ┌──────────┐
            │ resolved │  │  fading  │
            │ (done!)  │  │(no update)│
            └──────────┘  └────┬─────┘
                               │
                               ▼ 60 days
                         ┌──────────┐
                         │  pruned  │
                         └──────────┘
```

### Relevance Algorithm

Topics are prioritized for AI check-ins based on:

| Days Since Last Mention | Priority | AI Behavior                    |
| ----------------------- | -------- | ------------------------------ |
| 0-2 days                | Current  | Actively reference if relevant |
| 3-7 days                | Check-in | Proactively ask about it       |
| 8-30 days               | Low      | Only mention if user brings up |
| 31-60 days              | Fading   | Rarely reference               |
| >60 days                | Pruned   | Automatically removed          |

---

## Extraction System

### Dual-Mode Approach

**Mode A: Passive Extraction (every message)**

- Runs asynchronously after each user message
- Non-blocking (fire-and-forget)
- Extracts both FACTS (to User Story) and TOPICS (to Mid-Term Memory)
- Uses Gemini 2.0 Flash with low temperature (0.1)

**Mode B: Active Curiosity (AI-guided)**

- Guidelines embedded in system prompt
- AI weaves questions naturally into conversation
- Context-aware timing (not during crisis)
- Proactive check-ins on topics 3-7 days old
- One or two natural questions per conversation is ideal

### What Gets Extracted Where

| User Says                            | Extracted To                                  | Example                                                     |
| ------------------------------------ | --------------------------------------------- | ----------------------------------------------------------- |
| "I'm Sarah"                          | User Story → coreIdentity.name                | `{ value: "Sarah", confidence: "explicit" }`                |
| "I work as a nurse"                  | User Story → lifeSituation.occupation         | `{ type: "work", details: "nurse" }`                        |
| "I have a job interview Friday"      | Mid-Term Memory → recentTopics                | `{ topic: "job interview anxiety", status: "active" }`      |
| "My roommate and I fought"           | Mid-Term Memory → recentTopics                | `{ topic: "roommate conflict", category: "relationships" }` |
| "I've always been afraid of crowds"  | User Story → therapeuticContext.knownTriggers | `["crowds", ...]`                                           |
| "Work is stressing me out this week" | Mid-Term Memory → recentTopics                | `{ topic: "work stress", category: "work" }`                |

### Extraction Rules

1. Only extract what is CLEARLY stated or strongly implied
2. Confidence levels:
   - `explicit`: Directly stated ("my name is X")
   - `inferred`: Logical conclusion ("my boyfriend" → in relationship)
   - `mentioned`: Referenced but unclear ("my job is stressful")
3. Never extract from:
   - Hypotheticals ("if I had a dog...")
   - Negations ("I'm not married" → don't extract "single")
   - Sarcasm or jokes
4. Array fields (interests, triggers) merge, don't replace
5. Deleted fields are never re-extracted

### Validation & Data Quality

All AI extractions are validated before storage:

**Topic Extractions:**

- Topics with empty/short topic or context (<2 chars) are rejected
- Invalid categories are corrected to `'other'`
- Invalid statuses default to `'active'`
- Invalid valences are removed

```typescript
// Valid enum values
const VALID_CATEGORIES = ['work', 'relationships', 'health', 'anxiety', 'life-event', 'other'];
const VALID_STATUSES = ['active', 'resolved', 'fading'];
const VALID_VALENCES = ['positive', 'negative', 'neutral'];
```

**Context-Aware Deduplication:**

When matching new topics against existing ones, the system considers BOTH topic similarity AND context similarity. This prevents incorrectly merging different situations:

| Scenario                       | Topic           | Context            | Result                   |
| ------------------------------ | --------------- | ------------------ | ------------------------ |
| Same topic, same context       | "job interview" | "Google interview" | Merged (update existing) |
| Same topic, different context  | "job interview" | "Apple interview"  | Kept separate            |
| Similar topic, similar context | "work stress"   | "project deadline" | Merged                   |

### Performance Optimizations

**Extract All Messages:**

Every user message is sent to extraction, regardless of length. This ensures we capture:

- Short name answers: "Sarah", "Tom"
- Age responses: "I'm 25"
- Yes/no answers to questions: "do you have pets?" → "yes"

Since extraction is fire-and-forget (async, doesn't block the response), the only cost is API calls - and the extraction AI returns empty results when there's nothing useful to extract.

```typescript
// Extract ALL messages - short answers are often the most important
extractStoryFromMessage(userId, message.text, recentMessages, languageCode);
```

**Timestamp Consistency:**

A unified `toDate()` helper handles all timestamp formats (Firestore Timestamp, Date, string) to prevent comparison bugs during topic pruning and sorting.

### "Forget That" Detection

When users say things like "forget that" or "don't remember my name":

1. AI acknowledges naturally
2. Field is deleted from Firestore
3. Field path added to `fieldsDeletedByUser`
4. Extraction system skips that field forever

---

## Therapeutic Usage Guidelines

The AI receives explicit instructions on HOW to use collected information:

### Their Toolkit is Gold

```
- If they mentioned something that helps them (walks, music, breathing) -
  bring it up when they're struggling
- Their interests and hobbies are anchors for grounding
- If they've overcome something before, gently remind them
```

### Be Mindful Around Sensitive Stuff

```
- If you know their triggers, be extra gentle around those topics
- Relationship changes (breakups, losses) need space
- If they mentioned past therapy or trauma, let them lead
```

### Professional Support Integration

```
- You're the between-sessions friend, not the replacement therapist
- If they're working on something in therapy, support that work
- "What did your therapist say about that?" is valid sometimes
```

### Continuity Matters

```
- Check in on things they shared: "how's that thing with your boss?"
- Notice patterns: "you seem anxious on Sunday nights - is that a thing?"
- Celebrate progress: "you've been handling these moments better lately"
```

### Proactive Check-Ins (Mid-Term Memory)

```
Topics 3-7 days old get automatic check-in suggestions:

- "hey, how did that interview go?"
- "been thinking about that thing with your roommate - any updates?"
- "how's that work project coming along?"

Rules:
- Only check in on topics marked as 'active' - don't bring up resolved stuff
- Max one check-in per conversation - don't make every chat feel like a status update
- If they say it's resolved or don't want to talk about it, move on naturally

What makes a good check-in:
- Casual and caring, not clinical ("how did that go?" not "can you update me on...")
- Give them space to not engage if they don't want to
- Celebrate wins if they share progress
- Be supportive if it didn't go well
```

### Anti-Surveillance Principle

```
- Use what you know to show you care, not to prove you have a file
- Don't recite info robotically
- Weave it naturally: "crowds are rough for you - totally valid to skip that"
```

### Curiosity Hints (SuggestedFollowUps)

The AI extraction system suggests natural things to learn about the user. These suggestions are stored in `extractionMeta.topicsToExplore` and shown to the AI as gentle hints:

```
WHAT YOU KNOW ABOUT THEM:
Name: Sarah
Age: 24
...

Natural things to learn about when the moment feels right: what they do for work/study, where they live
```

Field names are translated to natural language:

| Field              | English Hint                       | German Hint                    |
| ------------------ | ---------------------------------- | ------------------------------ |
| `occupation`       | "what they do for work/study"      | "was sie arbeiten/studieren"   |
| `location`         | "where they live"                  | "wo sie wohnen"                |
| `interests`        | "what they're interested in"       | "wofür sie sich interessieren" |
| `copingActivities` | "what helps when they're stressed" | "was ihnen bei Stress hilft"   |

Maximum 3 hints shown at a time to avoid overwhelming the AI.

### Age-Appropriate Tone

The AI adjusts its communication style based on user age:

**Users under 35:** Default Gen Z-friendly tone with casual language like "ngl", "lowkey", "tbh".

**Users 35 and older:** More mature conversational tone:

- Avoids Gen Z slang ("ngl", "lowkey", "tbh", "fr fr", "no cap", "slay")
- Still casual and friendly, just less internet-speak
- More authentic adult conversation style

```typescript
// Age detection from user story context
if (age >= 35) {
  // EN: "avoid Gen Z slang... Write naturally but slightly more mature"
  // DE: "vermeide Gen-Z-Slang... Schreib natürlich aber etwas erwachsener"
}
```

---

## Frontend Implementation

### My Story Page

**Route:** `/my-story`
**Access:** Profile → "My Story" button

Features:

- Collapsible sections by tier (ocean depth metaphor)
- Inline editing with haptic feedback
- Source badges ("Learned from chat" vs "Added by you")
- "Forget this" option per field
- Empty state encouragement

### Components

| Component          | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `StorySection`     | Collapsible section with depth-based styling |
| `StoryField`       | Individual field with view/edit/delete       |
| `EmptyStoryPrompt` | Encouragement when story is empty            |

### Hook

```typescript
const {
  story, // UserStory | null
  isLoading, // boolean
  updateField, // (path: string, value: any) => Promise<void>
  forgetField, // (path: string) => Promise<void>
  getFieldValue, // (path: string) => any
  getKnownFieldCount, // () => number
} = useUserStory();
```

---

## Context Injection Format

What the AI sees in its system prompt:

```
CURRENTLY ON THEIR MIND (check in if relevant):
- [3 days ago] job interview anxiety: Interview at Google on Friday → worth checking in
- [yesterday] roommate conflict: argument about chores (recurring theme)
- [today] sleep issues: work stress keeping them up

WHAT YOU KNOW ABOUT THEM:
Name: Sarah
Age: 24
Work/Study: software developer
Lives: with roommates
Relationship: in a relationship (Alex)
Interests: hiking, photography, cooking
What helps them: walks, deep breathing, calling mom
Things that are hard for them: crowded places, public speaking
Their anxiety tends to be: social anxiety
DON'T suggest (doesn't work for them): meditation apps, journaling
Currently seeing a therapist (you're the between-sessions friend)
Proof they can handle hard things: got through job interview last month
What gives them hope: travel plans, career growth

Natural things to learn about when the moment feels right: their background, what drives them
```

**German version:**

```
AKTUELL BESCHÄFTIGT SIE (frag nach wenn relevant):
- [vor 3 Tagen] Vorstellungsgespräch-Angst: Interview bei Google am Freitag → nachfragen lohnt sich
- [gestern] Mitbewohner-Konflikt: Streit wegen Hausarbeit (wiederkehrendes Thema)
- [heute] Schlafprobleme: Arbeitsstress hält sie wach

WAS DU ÜBER SIE WEISST:
Name: Sarah
Alter: 24
Arbeit/Studium: Softwareentwicklerin
...

Dinge die du natürlich herausfinden kannst wenn sich der Moment ergibt: ihren Hintergrund, was sie antreibt
```

### Topic Context Format

Topics include temporal markers, status indicators, and check-in suggestions:

```
- [today] {topic}: {context}
- [yesterday] {topic}: {context} (recurring theme)
- [3 days ago] {topic}: {context} → worth checking in
- [last week] {topic}: {context} (went well!)
- [last week] {topic}: {context} (was tough)
```

**Markers:**
| Marker | Meaning |
|--------|---------|
| `→ worth checking in` | Topic 3-7 days old, still active - AI should ask about it |
| `(recurring theme)` | Topic has come up multiple times - therapeutic signal |
| `(went well!)` | Resolved with positive outcome - celebrate |
| `(was tough)` | Resolved with difficult outcome - be supportive |
| `(resolved)` | Resolved, neutral outcome |

Recently resolved topics (within 7 days) are still shown so the AI can:

- Celebrate wins if things went well
- Offer support if things were difficult
- Avoid awkwardly asking about something already concluded

### Therapeutic Framing

Clinical terms are humanized in the context:

- "Known triggers" → "Things that are hard for them"
- "Anxiety type" → "Their anxiety tends to be"
- "What doesn't work" → "DON'T suggest (doesn't work for them)"
- "Past wins" → "Proof they can handle hard things"

---

## File Structure

### Backend

```
backend/functions/src/userStory/
├── types.ts        # Data models (UserStory, MidTermMemory, RecentTopic)
├── extraction.ts   # AI extraction logic + applyTopicExtractions()
├── prompts.ts      # EN + DE extraction prompts (facts + topics)
├── context.ts      # Format story + topics for prompt injection
└── index.ts        # Module exports

backend/functions/src/
├── chat.ts         # Fetches both contexts, passes to getSystemPrompt()
└── languageConfig.ts # getSystemPrompt() injects both contexts
```

### Frontend

```
app/src/
├── models/index.ts              # UserStory types
├── hooks/useUserStory.tsx       # Story state management
├── pages/MyStoryPage.tsx        # Main UI page
└── components/features/story/
    ├── StorySection.tsx         # Collapsible section
    ├── StoryField.tsx           # Editable field
    ├── EmptyStoryPrompt.tsx     # Empty state
    └── index.ts                 # Exports
```

---

## Bilingual Support (EN + DE)

The entire extraction and context system is fully localized:

### Extraction Prompts

Prompts are language-specific to ensure natural extraction in both languages:

| Component        | English                    | German                                 |
| ---------------- | -------------------------- | -------------------------------------- |
| System prompt    | "Extract information..."   | "Extrahiere Informationen..."          |
| Stop words       | ~80 English words filtered | ~120 German words filtered             |
| Forget detection | "forget", "don't remember" | "vergiss", "vergessen", "nicht merken" |
| Context labels   | "Work/Study:", "Age:"      | "Arbeit/Studium:", "Alter:"            |

### Stop Words

Common words are filtered before extraction to improve AI focus:

- **English:** the, a, an, I, you, me, my, we, our, it, is, are, was, were, have, has, do, does, did, just, really, very, actually, basically...
- **German:** der, die, das, ein, eine, ich, du, mich, mir, wir, sie, es, ist, sind, war, waren, habe, hat, mache, macht, einfach, wirklich, sehr, eigentlich, halt, eben, schon, noch, auch, aber, oder, und, wenn, weil, dass...

Unicode-aware regex (`\p{L}\p{N}`) handles special characters like umlauts (ä, ö, ü, ß).

### Forget Request Mappings

| English Pattern         | German Pattern                     | Action                                     |
| ----------------------- | ---------------------------------- | ------------------------------------------ |
| "forget my name"        | "vergiss meinen namen"             | Delete coreIdentity.name                   |
| "forget my job/work"    | "vergiss meinen job/beruf/arbeit"  | Delete lifeSituation.occupation            |
| "forget my triggers"    | "vergiss meine trigger/auslöser"   | Delete therapeuticContext.knownTriggers    |
| "forget that interview" | "vergiss das vorstellungsgespräch" | Delete matching topic from mid-term memory |

---

## Translations

Full EN + DE support in `myStory` namespace:

```json
{
  "myStory": {
    "title": "My Story",
    "subtitle": "What Anchor knows about you",
    "privacy": { "note": "This information helps personalize..." },
    "sections": {
      "coreIdentity": "Who You Are",
      "lifeSituation": "Your Life",
      "relationships": "Your People",
      "therapeuticContext": "Your Journey",
      "strengths": "Your Strengths"
    },
    "labels": {
      "learnedFrom": "Learned from chat",
      "addedByYou": "Added by you"
    },
    "actions": {
      "edit": "Edit",
      "delete": "Forget this",
      "save": "Save",
      "cancel": "Cancel"
    }
  }
}
```

---

## Security

### Firestore Rules

```javascript
// User Story - users can read and write (for editing their data)
match /users/{userId}/profile/userStory {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
}

// Mid-Term Memory - users can read, only backend can write
match /users/{userId}/profile/midTermMemory {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Backend functions only
}
```

### Privacy Considerations

- No localStorage caching (Firestore only)
- User has full control (view, edit, delete)
- Deleted fields never re-extracted
- Sensitive fields (Tier 6-7) only from explicit sharing
- "Forget that" detection in chat

---

## Success Criteria

### User Story (Long-term Facts)

1. AI naturally asks user's name within first 3-5 conversations
2. User can view everything AI knows on My Story page
3. User can edit/delete any field
4. State changes (relationship status) tracked with history
5. "Forget that" in chat removes corresponding data
6. Cross-device sync works correctly
7. Strengths and resources actively used during difficult moments

### Mid-Term Memory (Topics)

8. When user discusses a problem, it's captured in mid-term memory
9. AI can reference "remember when you mentioned X?" across conversations
10. Topics fade naturally over time (60+ days = removed)
11. AI proactively checks in on topics 3-7 days old
12. No interrogation feeling - check-ins feel natural and caring
13. Resolved topics are not brought up again

### Proactive Curiosity

14. AI asks follow-up questions when topics are interesting/concerning
15. Questions weave naturally into conversation flow
16. AI behaves like a friend who pays attention over time
