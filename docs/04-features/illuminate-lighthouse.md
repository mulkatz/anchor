# Illuminate (Lighthouse Feature)

**CBT-Based Structured Situation Reflection**

---

## Overview

Illuminate is a 6-step guided wizard for processing challenging situations using Cognitive Behavioral Therapy (CBT) principles. It helps users identify cognitive distortions in their thinking and develop balanced perspectives through AI-assisted reframing.

**Key Philosophy**: While originally anxiety-focused, Illuminate is designed for **any challenging situation** - work stress, relationship conflicts, self-criticism, disappointment, anger, shame, etc. CBT applies to all emotions, not just anxiety.

---

## User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                          LIGHTHOUSE                              │
│                      (Entry List Page)                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  [+ New Reflection]                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                   │
│          Opens ──────────────┼────────────────────┐              │
│                              │                    │              │
│                              ▼                    │              │
│  ┌────────────────────────────────────────────┐   │              │
│  │        ILLUMINATE MODAL                    │   │              │
│  │        (6-Step Wizard)                     │   │              │
│  │                                            │   │              │
│  │  Step 1: Situation (text + speech)         │   │              │
│  │  Step 2: Thoughts (text + speech)          │   │              │
│  │  Step 3: Feelings (emotion grid)           │   │              │
│  │  Step 4: Intensity (slider)                │   │              │
│  │  Step 5: Pattern (AI distortion)           │   │              │
│  │  Step 6: Reframe (AI suggestions)          │   │              │
│  │                                            │   │              │
│  │  [Save] ───────────────────────────────────┼───┘              │
│  └────────────────────────────────────────────┘                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Entry Card (Dec 15 • 13:30)                          [>]  │──┼──┐
│  └────────────────────────────────────────────────────────────┘  │  │
│  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  Entry Card (Dec 14 • 09:15)                          [>]  │──┼──┤
│  └────────────────────────────────────────────────────────────┘  │  │
│                                                                  │  │
└──────────────────────────────────────────────────────────────────┘  │
                                                                      │
                       Click Entry ────────────────────────────────────┘
                                                                      │
                                                                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     REFLECTION DETAIL PAGE                           │
│                     /lighthouse/:entryId                             │
│                                                                      │
│  ← Back              Reflection                                      │
│                      Dec 15 • 13:30                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  THE SITUATION                                                 │  │
│  │  "My boss criticized my work in front of the team..."          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  THE THOUGHTS                                                  │  │
│  │  "I'm going to get fired. Everyone thinks I'm incompetent..."  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  THE FEELINGS                                                  │  │
│  │  [anxious] [ashamed] [worried]                                 │  │
│  │  Intensity: ████████████░░░░░░ 72% • Strong                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  PATTERNS IDENTIFIED                                           │  │
│  │  🔮 Catastrophizing - Imagining the worst possible outcome     │  │
│  │  🧠 Mind Reading - Assuming you know what others think         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  THE REFRAME                                                   │  │
│  │  💡 Your own reframe / Suggested reframe                       │  │
│  │  "While the feedback was hard to hear, it doesn't mean..."     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  🗑️ Delete Reflection                                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6-Step Flow (Illuminate Wizard)

```
Step 1: The Situation   → "What happened?" (single focused textarea)
Step 2: The Thoughts    → "What went through your mind?" (automatic thoughts)
Step 3: The Feelings    → "How are you feeling?" (emotion selection grid)
Step 4: The Intensity   → "How intense is this?" (emotional intensity slider)
Step 5: The Pattern     → AI distortion detection (Gemini 2.5 Flash)
Step 6: The Reframe     → Balanced perspective selection
```

### Step 1: The Situation

- Single focused textarea with **speech-to-text** microphone button
- Placeholder: "What situation brought up these feelings?"
- No character limit (encourages detailed reflection)
- Minimum 10 characters to proceed

### Step 2: The Thoughts

- Single focused textarea with **speech-to-text** microphone button
- Placeholder: "What did you tell yourself? What thoughts came up?"
- No character limit (encourages detailed reflection)
- Minimum 10 characters to proceed

### Step 3: The Feelings

- Spacious 3-column emotion grid
- 18 emotion options across spectrums:
  - **Anxiety/Fear**: anxious, worried, nervous, panicked
  - **Stress**: stressed, overwhelmed, exhausted
  - **Sadness**: sad, hopeless, lonely
  - **Anger**: angry, frustrated, irritated
  - **Shame**: ashamed, guilty, embarrassed
  - **Other**: restless, numb
- Select up to 5 emotions
- Optional - can proceed without selection

### Step 4: The Intensity

- Circular display with gradient slider (0-100)
- Labels: Minimal, Mild, Moderate, Strong, Intense
- Color-coded: green → cyan → yellow → orange → red
- Default: 50

### Step 5: The Pattern

- AI analyzes thoughts for cognitive distortions
- Uses Gemini 2.5 Flash via Vertex AI
- Detects up to 3 distortions with confidence scores
- User can confirm/dismiss each detection
- 10 detectable distortion types (see below)

### Step 6: The Reframe

- AI generates 2-3 balanced reframe suggestions
- User can select an AI suggestion or write their own
- Good reframes are realistic, acknowledge feelings, introduce balance

---

## Reflection Detail Page

After completing an Illuminate reflection, users can revisit past entries by tapping on entry cards in the Lighthouse list. This opens a full-screen detail page (`/lighthouse/:entryId`) that displays all 5 sections of the CBT thought record.

### Features

- **Read-only view** of completed reflections
- **Localized date/time** in header (e.g., "Dec 15 • 13:30" or "15. Dez. • 13:30 Uhr")
- **Emotion chips** with intensity bar (color-coded: green → cyan → yellow → orange → red)
- **Pattern cards** showing confirmed cognitive distortions with emoji and description
- **Reframe section** indicating whether it was user-written or AI-suggested
- **Delete functionality** with confirmation dialog

### Navigation

- Back button returns to `/lighthouse`
- Entry cards in Lighthouse list navigate to `/lighthouse/:entryId`
- Light haptic feedback on entry tap

---

## Routes

| Route             | Page                 | Description                   |
| ----------------- | -------------------- | ----------------------------- |
| `/lighthouse`     | LighthousePage       | Main entry list, stats, CTA   |
| `/lighthouse/:id` | IlluminateDetailPage | Reflection detail (read-only) |
| `/horizon`        | HorizonPage          | Progress dashboard, trends    |

---

## Cognitive Distortions Detected

| Key                   | Name                | Description                                   |
| --------------------- | ------------------- | --------------------------------------------- |
| `catastrophizing`     | Catastrophizing     | Imagining the worst possible outcome          |
| `mind_reading`        | Mind Reading        | Assuming you know what others think           |
| `fortune_telling`     | Fortune Telling     | Predicting negative outcomes without evidence |
| `all_or_nothing`      | All-or-Nothing      | Black-and-white thinking                      |
| `emotional_reasoning` | Emotional Reasoning | Believing feelings equal facts                |
| `should_statements`   | Should Statements   | Rigid rules about how things should be        |
| `labeling`            | Labeling            | Attaching negative labels to self/others      |
| `personalization`     | Personalization     | Taking excessive responsibility               |
| `filtering`           | Mental Filtering    | Focusing only on negatives                    |
| `overgeneralization`  | Overgeneralization  | Drawing broad conclusions from one event      |

---

## Data Model

```typescript
interface IlluminateEntry {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Step 1: The Situation
  situation: string;

  // Step 2: The Thoughts
  automaticThoughts: string;

  // Step 3: The Feelings
  primaryEmotions: EmotionType[];

  // Step 4: The Intensity
  emotionalIntensity: number; // 0-100

  // Step 5: The Pattern
  aiDetectedDistortions: DetectedDistortion[];
  userConfirmedDistortions: CognitiveDistortion[];
  userDismissedDistortions: CognitiveDistortion[];

  // Step 6: The Reframe
  aiSuggestedReframes: string[];
  selectedReframe: string;
  customReframe: boolean;
  reframeHelpfulness?: number; // 1-5 rating

  // Meta
  entryDurationSeconds: number;
  completedAllSteps: boolean;
}
```

---

## File Structure

### Frontend Components

```
app/src/components/features/illuminate/
├── IlluminateModal.tsx      # Main 6-step wizard container
├── SituationStep.tsx        # Step 1
├── ThoughtsStep.tsx         # Step 2
├── FeelingsStep.tsx         # Step 3
├── IntensityStep.tsx        # Step 4
├── PatternStep.tsx          # Step 5
├── LightStep.tsx            # Step 6
├── IlluminateEntryCard.tsx  # Entry list card
├── BeaconCard.tsx           # Weekly AI insight card
└── index.ts                 # Exports
```

### Hooks

```
app/src/hooks/
├── useIlluminateFlow.tsx    # Wizard state management
├── useIlluminate.tsx        # Firestore CRUD operations
├── useInsight.tsx           # Weekly AI insights
└── useSpeechToText.tsx      # Speech-to-text for textareas
```

### Utilities

```
app/src/utils/
└── time.ts                  # formatShortDate(), formatTime() - localized date/time
```

Date/time formatting uses native `toLocaleDateString()` / `toLocaleTimeString()` with `i18n.language` for proper localization (e.g., "Dec 15 • 1:30 PM" in en-US, "15. Dez. • 13:30 Uhr" in de-DE).

### Shared UI Components

```
app/src/components/ui/
└── TextareaWithMic.tsx      # Textarea with speech-to-text mic button
```

### Backend Functions

```
backend/functions/src/
├── illuminate.ts            # analyzeDistortions, generateReframes
├── illuminatePrompt.ts      # AI prompts for distortion detection & reframing
├── insight.ts               # generateWeeklyInsight, markInsightViewed, rateInsight
├── insightPrompt.ts         # AI prompts for weekly insights
└── transcription.ts         # transcribeAudioCallable (speech-to-text)
```

### Pages

```
app/src/pages/
├── LighthousePage.tsx          # Main Illuminate home (entry list)
├── IlluminateDetailPage.tsx    # Reflection detail view (read-only)
└── HorizonPage.tsx             # Progress dashboard
```

---

## AI Integration

### Distortion Detection

- **Model**: Gemini 2.5 Flash
- **Temperature**: 0.3 (consistent analysis)
- **Max tokens**: 2048
- **Input**: Situation + automatic thoughts
- **Output**: JSON array of detected distortions with confidence scores

### Reframe Generation

- **Model**: Gemini 2.5 Flash
- **Temperature**: 0.7 (creative variety)
- **Max tokens**: 2048
- **Input**: Situation + thoughts + detected distortions
- **Output**: JSON array of 2-3 balanced reframes

### Weekly Insights (Beacon)

- Generated when user has 3+ entries
- Analyzes patterns across the week
- Provides personalized recommendations
- Identifies common triggers

### Speech-to-Text

Steps 1 (Situation) and 2 (Thoughts) include a microphone button for voice input:

- **Backend Function**: `transcribeAudioCallable` (callable Cloud Function)
- **API**: Google Cloud Speech-to-Text
- **Audio format**: AAC/M4A from mobile devices, converted to LINEAR16 WAV
- **Flow**: Record → Upload base64 → Transcribe → Return text directly
- **UI States**: Idle (mic icon) → Recording (pulsing red) → Transcribing (spinner)
- Transcribed text is **appended** to existing textarea content

---

## Translations

All user-facing strings use i18n with keys under:

- `lighthouse.*` - Page-level translations
- `illuminate.*` - Wizard and step translations
- `illuminate.emotions.*` - Emotion labels
- `illuminate.distortions.*` - Distortion names/descriptions
- `illuminate.intensity.*` - Intensity level labels (minimal, mild, moderate, strong, intense)
- `illuminateDetail.*` - Reflection detail page translations
- `horizon.*` - Progress dashboard

Supported languages: English (en-US), German (de-DE)

### Detail Page Translation Keys

```json
"illuminateDetail": {
  "title": "Reflection",
  "notFound": "Reflection not found",
  "sections": {
    "situation": "The Situation",
    "thoughts": "The Thoughts",
    "feelings": "The Feelings",
    "patterns": "Patterns Identified",
    "reframe": "The Reframe"
  },
  "intensity": "Intensity",
  "customReframe": "Your own reframe",
  "suggestedReframe": "Suggested reframe",
  "noPatterns": "No thinking patterns identified",
  "deleteButton": "Delete Reflection",
  "deleteConfirm": {
    "title": "Delete Reflection?",
    "message": "This will permanently delete this reflection...",
    "confirm": "Delete"
  }
}
```

---

## Backwards Compatibility

### Field Rename: `anxietyIntensity` → `emotionalIntensity`

For existing data:

```typescript
// Reading: accept both field names
emotionalIntensity: data.emotionalIntensity ?? data.anxietyIntensity ?? 50;

// Writing: use new field name
emotionalIntensity: input.emotionalIntensity;
```

Firestore rules accept both field names for create operations.

---

## Analytics Events

| Event                       | Description                     |
| --------------------------- | ------------------------------- |
| `ILLUMINATE_STARTED`        | Wizard opened                   |
| `ILLUMINATE_STEP_COMPLETED` | Step transition                 |
| `ILLUMINATE_ENTRY_CREATED`  | Entry saved                     |
| `ILLUMINATE_ENTRY_VIEWED`   | Reflection detail page opened   |
| `ILLUMINATE_ABANDONED`      | Wizard closed before completion |
| `DISTORTION_CONFIRMED`      | User confirmed a distortion     |
| `DISTORTION_DISMISSED`      | User dismissed a distortion     |
| `AI_REFRAME_SELECTED`       | User selected AI suggestion     |
| `CUSTOM_REFRAME_WRITTEN`    | User wrote own reframe          |
| `HORIZON_VIEWED`            | Progress dashboard opened       |

---

## Related Features

- **Horizon** (`/horizon`) - Progress dashboard showing trends, streaks, patterns
- **Beacon** - Weekly AI-generated insights based on entries
- **Soundings** - Therapeutic journaling prompts (in Depths feature)

---

## Design Principles

1. **One focus per step** - Each step does one thing well
2. **Spacious layouts** - Breathing room, not cramped
3. **Situation-agnostic** - Works for any challenging emotion
4. **AI-assisted, not AI-driven** - User always has final say
5. **CBT-grounded** - Based on established therapeutic techniques
