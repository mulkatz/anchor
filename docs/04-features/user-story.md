# User Story: The Interested AI Companion

**Status:** Implemented
**Version:** 1.0
**Last Updated:** December 2024

---

## Overview

The User Story feature enables Anchor to progressively learn about users through natural conversation, building a personalized profile that enhances therapeutic effectiveness. Unlike traditional onboarding forms, this system learns organically - like a friend who pays attention over time.

### Core Philosophy

- **Natural curiosity, not interrogation** - Questions weave into conversation flow
- **Full transparency** - Users can view, edit, and delete everything the AI knows
- **Strengths-based** - Focus on resources and resilience, not just problems
- **Therapeutic utility** - Information is used to help, not just collected

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

## Extraction System

### Dual-Mode Approach

**Mode A: Passive Extraction (every message)**

- Runs asynchronously after each user message
- Non-blocking (fire-and-forget)
- Only extracts what user naturally shares
- Uses Gemini 2.0 Flash with low temperature (0.1)

**Mode B: Active Curiosity (AI-guided)**

- Guidelines embedded in system prompt
- AI weaves questions naturally into conversation
- Context-aware timing (not during crisis)
- Maximum one personal question per conversation

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

### Anti-Surveillance Principle

```
- Use what you know to show you care, not to prove you have a file
- Don't recite info robotically
- Weave it naturally: "crowds are rough for you - totally valid to skip that"
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
```

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
├── types.ts        # Data model interfaces
├── extraction.ts   # AI extraction logic
├── prompts.ts      # EN + DE extraction prompts
├── context.ts      # Format story for prompt injection
└── index.ts        # Module exports
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
match /users/{userId}/profile/userStory {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
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

1. AI naturally asks user's name within first 3-5 conversations
2. User can view everything AI knows on My Story page
3. User can edit/delete any field
4. State changes (relationship status) tracked with history
5. "Forget that" in chat removes corresponding data
6. Cross-device sync works correctly
7. No interrogation feeling - questions feel natural
8. Strengths and resources actively used during difficult moments
