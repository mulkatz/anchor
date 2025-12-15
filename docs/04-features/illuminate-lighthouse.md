# Illuminate (Lighthouse Feature)

**CBT-Based Structured Situation Reflection**

---

## Overview

Illuminate is a 6-step guided wizard for processing challenging situations using Cognitive Behavioral Therapy (CBT) principles. It helps users identify cognitive distortions in their thinking and develop balanced perspectives through AI-assisted reframing.

**Key Philosophy**: While originally anxiety-focused, Illuminate is designed for **any challenging situation** - work stress, relationship conflicts, self-criticism, disappointment, anger, shame, etc. CBT applies to all emotions, not just anxiety.

---

## 6-Step Flow

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
├── LighthousePage.tsx       # Main Illuminate home
└── HorizonPage.tsx          # Progress dashboard
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
- `horizon.*` - Progress dashboard

Supported languages: English (en-US), German (de-DE)

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
| `ILLUMINATE_ABANDONED`      | Wizard closed before completion |
| `DISTORTION_CONFIRMED`      | User confirmed a distortion     |
| `DISTORTION_DISMISSED`      | User dismissed a distortion     |
| `AI_REFRAME_SELECTED`       | User selected AI suggestion     |
| `CUSTOM_REFRAME_WRITTEN`    | User wrote own reframe          |

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
