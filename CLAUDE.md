# CLAUDE.md - Anxiety Buddy (Project Anchor)

**AI Assistant Context & Project Brain**

---

## 🎯 THE MANIFEST

**Project Name:** Anxiety Buddy (Internal Codename: Project Anchor)
**Stage:** Greenfield Development
**Target Audience:** Gen Z (18-26 years old)
**Core Purpose:** Immediate Relief Tool for Anxiety & Panic Attacks

### The Vision

This is NOT a wellness app with gamification. This is a **therapeutic interface**.

- **The Interface IS the Therapy** - Every pixel, every animation, every haptic pulse is designed to ground and de-escalate panic.
- **Evidence-Based:** Built on Cognitive Behavioral Therapy (CBT) + Somatic Grounding techniques.
- **Mobile-First:** Native iOS/Android with Capacitor. The app must feel native, not web-wrapped.

### The Aesthetic: "Bioluminescence in the Deep"

Imagine the deep ocean at night. Viscous, slow-moving, calming darkness punctuated by gentle glowing life forms.

**Mood Board Keywords:**

- Deep ocean darkness (safety in the void)
- Bioluminescent jellyfish (soft, pulsing light)
- Viscous liquid motion (slow, deliberate)
- Frosted glass surfaces (depth, layering)
- Warm glows in cold darkness (hope, guidance)

---

## 🛠️ TECHNOLOGY STACK

### Frontend Core

- **Framework:** React 18.3+ (Functional components only, hooks-based)
- **Language:** TypeScript 5.7+ (Strict mode, all `.tsx` files)
- **Build Tool:** Vite 6.0+ (Fast HMR, optimized production builds)
- **Styling:** Tailwind CSS 3.4+ (Mobile-first, custom design tokens)

### Mobile Runtime

- **Platform:** Capacitor 7.0+ (Native iOS/Android bridge)
- **Routing:** `react-router-dom` v7+ (Client-side routing with animations)
- **Animation:** Framer Motion (Page transitions, micro-interactions, physics-based motion)

### Native APIs (Critical Dependencies)

```json
{
  "@capacitor/haptics": "^7.0.0", // CRITICAL - Therapeutic haptic feedback
  "@capacitor/status-bar": "^7.0.0", // CRITICAL - Dark mode, overlay styling
  "@capacitor/app": "^7.0.0", // App lifecycle hooks
  "@capacitor/camera": "^7.0.1", // Photo journaling, profile pictures
  "@capacitor/filesystem": "^7.0.1", // Local data persistence
  "capacitor-voice-recorder": "^7.0.6", // CRITICAL - Voice message recording
  "@capacitor-community/in-app-review": "^7.0.0" // In-app rating flow
}
```

### UI Components

- **Icons:** `lucide-react` (Consistent, minimal icon set)
- **Utilities:** `clsx`, `tailwind-merge` (Conditional styling)
- **Animation:** `framer-motion` (Viscous animations, page transitions)
- **Internationalization:** `react-i18next`, `i18next` (Multi-language support)
- **Notifications:** `react-hot-toast` (Toast messages with custom styling)

### Backend (Production)

- **Platform:** Firebase (Firestore, Auth, Functions, Cloud Storage)
- **AI:** Google Vertex AI (Gemini 2.5 Flash for therapeutic responses)
- **Transcription:** Google Cloud Speech-to-Text API v2
- **Offline-First:** Dexie (IndexedDB wrapper for local data)

**Backend Dependencies:**

```json
{
  "@google-cloud/speech": "^6.0.0", // Speech-to-Text transcription
  "@google-cloud/storage": "^7.0.0", // Cloud Storage for audio files
  "@google-cloud/vertexai": "latest", // Gemini AI integration
  "firebase-admin": "latest", // Firebase Admin SDK
  "firebase-functions": "latest", // Cloud Functions runtime
  "fluent-ffmpeg": "^2.1.3", // Audio format conversion (AAC/MP4 → LINEAR16 WAV)
  "@ffmpeg-installer/ffmpeg": "^1.1.0" // FFmpeg binary for Cloud Functions
}
```

---

## 🎨 DESIGN TOKENS

### Color Palette

Add these to `tailwind.config.ts`:

```typescript
colors: {
  // Core brand colors
  'void-blue': '#0A1128',        // Main background - deep ocean void
  'biolum-cyan': '#64FFDA',      // Primary glow - bioluminescence
  'warm-ember': '#FFB38A',       // Accent - warm hope in darkness
  'mist-white': '#E2E8F0',       // Text - soft, readable white

  // Glass morphism
  'glass': {
    'border': 'rgba(255, 255, 255, 0.1)',
    'bg': 'rgba(255, 255, 255, 0.05)',
    'bg-hover': 'rgba(255, 255, 255, 0.08)',
  },

  // States (derived from base palette)
  'success': '#4ECDC4',          // Teal - calm achievement
  'warning': '#FFD93D',          // Yellow - gentle alert
  'danger': '#FF6B6B',           // Coral red - soft danger

  // Shadows & Glows
  'glow-cyan': 'rgba(100, 255, 218, 0.4)',
  'glow-ember': 'rgba(255, 179, 138, 0.3)',
}
```

### Typography

```typescript
fontFamily: {
  sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
  mono: ['SF Mono', 'Menlo', 'Monaco', 'monospace'],
}

fontSize: {
  // Scale designed for mobile readability
  'xs': ['0.75rem', { lineHeight: '1rem' }],       // 12px
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
}
```

### Animation Physics

All animations must feel **viscous and deliberate** - never snappy or jarring.

```typescript
animation: {
  // Page transitions
  'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
  'fade-out': 'fadeOut 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  'slide-up': 'slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
  'slide-down': 'slideDown 0.8s cubic-bezier(0.22, 1, 0.36, 1)',

  // Micro-interactions
  'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
  'breathe': 'breathe 10s ease-in-out infinite',  // 4s in, 6s out

  // UI feedback
  'tap-scale': 'tapScale 0.2s ease-out',
}

transitionTimingFunction: {
  'viscous': 'cubic-bezier(0.22, 1, 0.36, 1)',     // Slow ease-out
  'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}
```

### Shadows & Glows

```typescript
boxShadow: {
  'glow-sm': '0 0 10px rgba(100, 255, 218, 0.3)',
  'glow-md': '0 0 20px rgba(100, 255, 218, 0.4)',
  'glow-lg': '0 0 40px rgba(100, 255, 218, 0.5)',
  'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
  'inner-glow': 'inset 0 0 20px rgba(100, 255, 218, 0.2)',
}

dropShadow: {
  'glow': '0 0 8px rgba(100, 255, 218, 0.6)',
  'glow-strong': '0 0 16px rgba(100, 255, 218, 0.8)',
}
```

### Backdrop Blur (Glass Morphism)

```typescript
backdropBlur: {
  'glass': '12px',
  'glass-heavy': '24px',
}
```

---

## 📁 PROJECT STRUCTURE

```
anxiety-buddy/
├── CLAUDE.md                        # This file - AI context
├── README.md                        # User documentation
├── package.json                     # Root workspace config
│
├── app/                             # Mobile app (React + Capacitor)
│   ├── src/
│   │   ├── main.tsx                 # App entry point
│   │   ├── index.css                # Global styles (Tailwind imports)
│   │   │
│   │   ├── pages/                   # Top-level screens
│   │   │   ├── App.tsx              # Root component with Router
│   │   │   ├── HomePage.tsx         # Landing screen
│   │   │   ├── SOSPage.tsx          # Panic de-escalation flow
│   │   │   ├── VaultPage.tsx        # Saved sessions, journal
│   │   │   └── ProfilePage.tsx      # Settings, preferences
│   │   │
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   └── MainLayout.tsx   # Shell with floating nav
│   │   │   │
│   │   │   ├── ui/                  # Atomic components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── GlassCard.tsx    # Frosted glass container
│   │   │   │   ├── PulseOrb.tsx     # Animated glow circle
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── features/            # Feature-specific components
│   │   │   │   ├── sos/
│   │   │   │   │   ├── SOSSession.tsx        # 7-step state machine
│   │   │   │   │   ├── BreachScreen.tsx      # Step 1: Trigger
│   │   │   │   │   ├── AcknowledgeScreen.tsx # Step 2: "I've got you"
│   │   │   │   │   ├── GroundingSight.tsx    # Step 3: Tap 5 things
│   │   │   │   │   ├── GroundingTouch.tsx    # Step 4: Tactile scrub
│   │   │   │   │   ├── GroundingSound.tsx    # Step 5: Pink noise
│   │   │   │   │   ├── ExitBreath.tsx        # Step 6: 4-7-8 breathing
│   │   │   │   │   └── CompletionScreen.tsx  # Step 7: Success
│   │   │   │   │
│   │   │   │   ├── navigation/
│   │   │   │   │   └── FloatingDock.tsx      # Bottom nav bar
│   │   │   │   │
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── index.ts             # Component exports
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useHaptics.tsx       # Wrapper for Capacitor Haptics
│   │   │   ├── useSOSSession.tsx    # State machine for SOS flow
│   │   │   └── ...
│   │   │
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AppContext.tsx       # Global app state
│   │   │   └── ...
│   │   │
│   │   ├── services/                # External integrations
│   │   │   ├── api.ts
│   │   │   ├── firebase.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── utils/                   # Pure helper functions
│   │   │   ├── cn.ts                # Tailwind class merger
│   │   │   ├── logger.ts
│   │   │   └── ...
│   │   │
│   │   ├── models/                  # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   └── assets/
│   │       ├── icons/
│   │       ├── sounds/               # Pink noise, ambient sounds
│   │       └── translations/
│   │
│   ├── capacitor.config.ts          # Capacitor configuration
│   ├── tailwind.config.ts           # Design tokens
│   ├── vite.config.ts               # Build configuration
│   └── package.json
│
└── backend/                         # Firebase Functions (future)
```

---

## 🧠 CORE FEATURES

### ✅ Implemented

- [x] **Voice Chat** - WhatsApp-style voice messaging with Google Cloud Speech-to-Text transcription
- [x] **AI Chat** - Therapeutic conversations powered by Gemini 2.5 Flash with CBT/ACT techniques
- [x] **Message System** - Real-time Firestore-based chat with crisis detection
- [x] **Haptics Integration** - Therapeutic touch feedback throughout the app
- [x] **Profile/Settings Page** - Complete settings screen with 4 sections (see ProfilePage section below)
- [x] **Crisis Resources** - Prominent 988/911 hotline access with haptic feedback
- [x] **Data Management** - Export, clear cache, delete data, delete account
- [x] **Feedback System** - Submit ideas/bugs directly to Firestore
- [x] **In-App Rating** - Smart rating flow (like prompt → native dialog → store fallback)
- [x] **Internationalization** - i18n infrastructure with English translations (ready for more languages)
- [x] **Dialog Management** - Stack-based dialog system for modals
- [x] **Analytics Service** - Comprehensive event tracking for all user interactions

### 🚧 In Progress

- [ ] Base Layout (MainLayout + FloatingDock)
- [ ] SOS Flow (7-step state machine)

### 📋 Planned

- [ ] Home screen with quick access
- [ ] Vault (session history, journal entries)
- [ ] Profile photo upload feature
- [ ] Crisis contacts management
- [ ] Offline-first data sync with Firestore
- [ ] Pink noise audio playback
- [ ] Photo journaling
- [ ] Tutorial/onboarding flow

---

## 🎮 THE SOS FLOW (Core Feature)

### State Machine: 7-Step Panic De-escalation

This is the heart of the app. A guided, multi-sensory experience to ground the user during a panic attack.

#### Step 1: The Breach (Trigger)

**User Action:** Long-press the SOS button (2 seconds)
**Haptic:** Heavy Impact (strong, single pulse)
**Visual:** Screen darkens, SOS button pulses with cyan glow
**Purpose:** Immediate acknowledgement of distress

#### Step 2: Acknowledgement

**Screen Text:** "I've got you."
**Haptic:** Heartbeat pattern (rhythmic pulses at 60 BPM)
**Visual:** Soft breathing animation (slow, gentle)
**Duration:** 5 seconds (auto-advance)
**Purpose:** Establish safety and presence

#### Step 3: Grounding - SIGHT

**Instruction:** "Tap 5 things you can see."
**User Action:** Tap screen 5 times (anywhere)
**Haptic:** Light Impact on each tap (crisp click)
**Visual:** Ripple effect from tap point, counter (1/5, 2/5, etc.)
**Purpose:** Engage visual cortex, break panic loop

#### Step 4: Grounding - TOUCH

**Instruction:** "Feel the texture. Move your finger slowly."
**User Action:** Drag finger across screen (scrubbing motion)
**Haptic:** Selection feedback (gritty, continuous vibration while dragging)
**Visual:** Particle trail following finger, glass texture overlay
**Completion:** Drag for 10 seconds total
**Purpose:** Engage tactile sense, slow down movements

#### Step 5: Grounding - SOUND

**Instruction:** "Close your eyes. Just listen."
**Haptic:** None (silence)
**Visual:** Screen fades to near-black, minimal pulsing orb
**Audio:** Pink noise (soft, womb-like)
**Duration:** 20 seconds (auto-advance)
**Purpose:** Auditory grounding, sensory reset

#### Step 6: The Exit Breath

**Instruction:** "Breathe with the circle."
**Visual:** Expanding/contracting circle (4s in, 7s hold, 8s out)
**Haptic:** Swell on inhale (gentle build), fade on exhale
**User Action:** Follow animation for 3 cycles (57 seconds)
**Purpose:** Activate parasympathetic nervous system (4-7-8 breathing)

#### Step 7: Completion

**Screen Text:** "You did it. You're safe."
**Visual:** Success animation (gentle glow, particles)
**Haptic:** Medium Impact (success pulse)
**Actions:**

- "Save Session" button
- "Return Home" button
- Optional: "How do you feel?" (1-5 scale)

---

## 🎨 DESIGN PRINCIPLES

### 1. Viscosity Over Speed

- No jarring animations
- All transitions feel like moving through thick liquid
- Minimum animation duration: 400ms
- Preferred easing: `cubic-bezier(0.22, 1, 0.36, 1)`

### 2. Haptics as Therapy

- Every user interaction should have appropriate haptic feedback
- Haptics are not "UI candy" - they are grounding tools
- Types used:
  - **Heavy Impact:** Crisis moments (SOS trigger)
  - **Medium Impact:** Completion, success
  - **Light Impact:** UI interactions (taps, swipes)
  - **Selection:** Continuous feedback (scrubbing, dragging)

### 3. Dark by Default

- Background is always `void-blue` (#0A1128)
- Text is always `mist-white` (#E2E8F0)
- No "light mode" - this is a nighttime app

### 4. Glass Morphism Everywhere

- Floating UI elements use frosted glass effect
- `backdrop-blur-glass` (12px blur)
- Semi-transparent backgrounds with `glass-border`
- Layering creates depth perception

### 5. Minimal Text

- Instructions should be 5 words or less
- Use icons + text combination
- Assume user is in cognitive overload (panic state)

---

## 🎤 VOICE CHAT FEATURE

### Overview

WhatsApp-style voice messaging designed for users who find typing difficult during anxiety episodes. Voice messages are recorded, uploaded to Cloud Storage, transcribed using Google Cloud Speech-to-Text, and then processed through the existing AI therapeutic response pipeline.

### Why Voice Chat?

During panic attacks or high anxiety, typing can be cognitively overwhelming. Voice input provides:

- **Lower cognitive load** - Speaking is easier than typing during distress
- **Natural expression** - Voice captures emotion and urgency better than text
- **Accessibility** - Helps users with motor difficulties or visual impairments
- **Speed** - Faster than typing, especially on mobile

### Technical Architecture

**Complete Flow:**

```
User clicks mic → Recording starts (60s max) → User clicks again →
Upload to Cloud Storage → Firestore message (pending) →
Transcription Cloud Function triggers → Google Speech-to-Text API →
Update message (completed) → onMessageCreate triggers →
Crisis detection → Gemini AI response → User sees transcription + AI reply
```

### Frontend Implementation

**Recording Plugin:**

- **Library:** `capacitor-voice-recorder` v7.0.6
- **Cross-platform:** iOS (AAC), Android (varies), Web (WebM)
- **Max duration:** 60 seconds (optimal for anxiety communication)
- **UI pattern:** Click-to-start, click-to-stop (simplified from hold-to-record)

**Key Components:**

1. **useVoiceRecorder.tsx** (`/app/src/hooks/`)
   - Manages recording lifecycle (start, stop, cancel)
   - Handles microphone permissions
   - Tracks duration with auto-cutoff at 60s
   - Converts base64 audio to Blob for upload
   - Integrates haptic feedback (selection patterns)

2. **ChatInput.tsx** (`/app/src/components/features/chat/`)
   - Dynamic button: Shows mic when input empty, send when text present
   - Click once to start, click again to stop and send
   - Visual feedback: Pulsing red dot during recording

3. **AudioMessageBubble.tsx** (`/app/src/components/features/chat/`)
   - Three states: `transcribing`, `completed`, `failed`
   - **Transcribing:** Animated waveform + "Transcribing your message..." + duration
   - **Completed:** Transcribed text + small waveform badge + duration + confidence %
   - **Failed:** Error message + retry option (fallback to text input)
   - Styled to match UserMessage bubble (same width, margins, colors)

**Upload Flow:**

```typescript
// In useChat.tsx
const sendVoiceMessage = async (recordingData: RecordingData) => {
  const messageId = crypto.randomUUID();
  const audioPath = `audio-messages/${userId}/${conversationId}/${messageId}.m4a`;

  // Upload to Cloud Storage
  await uploadBytes(storageRef, recordingData.blob, {
    contentType: recordingData.mimeType,
  });

  // Create Firestore message
  await addDoc(messagesRef, {
    userId,
    conversationId,
    text: '', // Empty until transcribed
    role: 'user',
    hasAudio: true,
    audioPath,
    audioDuration: recordingData.duration,
    transcriptionStatus: 'pending',
    createdAt: Timestamp.now(),
    metadata: { audioFormat: recordingData.mimeType },
  });
};
```

### Backend Implementation

**Cloud Storage:**

- **Bucket:** `anxiety-buddy-0.firebasestorage.app` (new Firebase Storage format)
- **Path structure:** `audio-messages/{userId}/{conversationId}/{messageId}.m4a`
- **Retention:** Auto-delete after 7 days (privacy + cost optimization)
- **Security rules:** User-scoped access only, 5MB max, audio MIME types only

**Transcription Function** (`/backend/functions/src/transcription.ts`):

```typescript
export const onAudioMessageCreate = onDocumentCreated(
  'users/{userId}/conversations/{conversationId}/messages/{messageId}',
  async (event) => {
    // 1. Download audio from Cloud Storage
    // 2. Determine encoding from mimeType
    // 3. CRITICAL: Convert AAC/MP4 to LINEAR16 WAV (Android/iOS compatibility)
    //    - Google Speech-to-Text does NOT support AAC/MP4 directly
    //    - Use fluent-ffmpeg to convert: AAC → LINEAR16 WAV (pcm_s16le, mono, 16kHz)
    // 4. Call Google Cloud Speech-to-Text API
    // 5. Update Firestore message with transcription
  }
);
```

**Audio Format Conversion (Server-Side):**

Android and iOS record audio in AAC/MP4 format, which Google Speech-to-Text API does NOT support. The transcription function automatically converts these files to LINEAR16 WAV format using `fluent-ffmpeg`:

```typescript
// Helper function in transcription.ts
async function convertToLinear16Wav(inputBuffer: Buffer, inputFormat: string): Promise<Buffer> {
  // Write to temp file → Convert with ffmpeg → Read output → Cleanup
  ffmpeg(inputPath)
    .toFormat('wav')
    .audioCodec('pcm_s16le') // LINEAR16 codec
    .audioChannels(1) // Mono
    .audioFrequency(16000) // 16kHz sample rate
    .save(outputPath);
}
```

**Speech-to-Text Configuration:**

- **API:** Google Cloud Speech-to-Text v2
- **Model:** `latest_long` (enhanced for conversational speech)
- **Language:** `en-US` (future: auto-detect with alternativeLanguageCodes)
- **Sample Rate:**
  - 48kHz for web audio (WebM/Opus)
  - 16kHz for mobile audio (converted LINEAR16 WAV)
- **Encoding:** Dynamic based on platform
  - Web: `WEBM_OPUS` or `OGG_OPUS`
  - Android/iOS: `LINEAR16` (after server-side conversion from AAC/MP4)
- **Features:** Automatic punctuation enabled, profanity filter OFF (preserves crisis keywords)

**AI Response Trigger** (`/backend/functions/src/chat.ts`):

- **Trigger:** `onDocumentWritten` (fires on both create AND update)
- **Logic:**
  - Message created with `transcriptionStatus: 'pending'` → Skip
  - Message updated to `transcriptionStatus: 'completed'` → Process with AI
- This ensures AI responds after transcription completes, not before

### Security & Privacy

**Permissions:**

- **iOS:** `NSMicrophoneUsageDescription` in Info.plist
- **Android:** `RECORD_AUDIO` permission in AndroidManifest.xml

**Cloud Storage Rules** (`/backend/storage.rules`):

```javascript
match /audio-messages/{userId}/{conversationId}/{messageId} {
  allow write: if request.auth != null
               && request.auth.uid == userId
               && request.resource.size < 5 * 1024 * 1024  // 5MB max
               && request.resource.contentType.matches('audio/.*');

  allow read: if request.auth != null
              && request.auth.uid == userId;
}
```

**Data Retention:**

- Audio files deleted after 7 days (Cloud Storage lifecycle rule)
- Transcribed text persists in Firestore
- Minimizes PHI exposure for HIPAA compliance considerations

**GCP IAM:**

- Cloud Functions service account requires **Cloud Speech Client** role (`roles/speech.client`)
- Grants permission to call Speech-to-Text API

### Cost Analysis

**Pricing (as of Dec 2024):**

- **Speech-to-Text:** $0.036 per minute (enhanced model)
- **Cloud Storage:** $0.020/GB/month (minimal, 7-day retention)
- **Cloud Functions:** Included in Firebase pricing
- **Bandwidth:** Negligible for audio files

**Example Cost (1000 active users):**

- Assumption: 10 voice messages/user/month, avg 30 seconds each
- Total minutes: 1000 users × 10 msgs × 0.5 min = 5,000 minutes/month
- **Total cost: ~$180/month**
- **Per user: $0.18/month**

**Cost Optimization Strategies:**

1. Rate limiting: Max 20 voice messages per user per day
2. Client-side silence detection (trim silence before upload)
3. 60-second max duration enforced
4. Future: On-device transcription (iOS Speech Framework, Android SpeechRecognizer) - FREE

### Crisis Detection

**Critical:** Voice messages are transcribed BEFORE crisis keyword detection.

```typescript
// In transcription.ts - after transcription completes
await messageRef.update({
  text: transcription, // Now contains transcribed text
  transcriptionStatus: 'completed',
});

// This triggers onDocumentWritten in chat.ts
// Crisis keywords are checked on the transcribed text:
const hasCrisisKeyword = CRISIS_KEYWORDS.some((regex) => regex.test(message.text));
```

This ensures crisis detection works identically for voice and text messages.

### Error Handling

| Error                            | Detection                                                   | User Feedback                                           | System Action                     |
| -------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| **Mic permission denied**        | `VoiceRecorder.hasAudioRecordingPermission()` returns false | "Microphone access required. Enable in Settings?"       | Show settings deep link           |
| **Recording fails**              | `startRecording()` throws                                   | "Unable to start recording. Please try again."          | Fallback to text input            |
| **Upload failure**               | `uploadBytes()` throws                                      | "Connection issue. Retrying..."                         | Retry 3 times, then queue locally |
| **Low transcription confidence** | `confidence < 0.6`                                          | "Audio was unclear. Transcription may not be accurate." | Show warning banner               |
| **Transcription API error**      | Speech-to-Text throws                                       | `transcriptionStatus: 'failed'` in message              | Log error, show retry option      |
| **Network offline**              | Browser check                                               | "You're offline. Recording saved locally."              | Queue for sync when online        |

### Key Files Reference

**Frontend:**

- `/app/src/hooks/useVoiceRecorder.tsx` - Recording state machine
- `/app/src/hooks/useChat.tsx` - sendVoiceMessage function
- `/app/src/components/features/chat/ChatInput.tsx` - Mic/send toggle button
- `/app/src/components/features/chat/AudioMessageBubble.tsx` - Transcription UI
- `/app/src/models/index.ts` - Message interface with voice fields
- `/app/native/ios/App/App/Info.plist` - iOS microphone permission
- `/app/native/android/app/src/main/AndroidManifest.xml` - Android mic permission

**Backend:**

- `/backend/functions/src/transcription.ts` - Speech-to-Text Cloud Function
- `/backend/functions/src/chat.ts` - AI response trigger (updated to onDocumentWritten)
- `/backend/storage.rules` - Cloud Storage security rules
- `/backend/firebase.json` - Storage rules deployment config

### Testing

**Manual Testing Checklist:**

- [ ] Microphone permission dialog appears on first use
- [ ] Recording starts on first click, stops on second click
- [ ] Button shows pulsing red dot during recording
- [ ] Audio uploads to Cloud Storage successfully
- [ ] Transcription appears in chat bubble
- [ ] AI responds to transcribed text
- [ ] Crisis keywords detected in transcribed voice messages
- [ ] Low confidence warning shows when accuracy is poor
- [ ] Works offline (queues message for sync)
- [ ] Works on iOS, Android, and web

### Future Enhancements

**On-Device Transcription** (cost savings):

- iOS: Apple Speech Framework (free, offline, <1s latency)
- Android: SpeechRecognizer (free, offline)
- Tradeoff: 80-90% accuracy vs. 95%+ (cloud)

**Multi-Language Support:**

- Auto-detect language with Speech-to-Text API's `alternativeLanguageCodes`
- Update crisis keyword lists for each language

**Audio Playback:**

- Allow users to replay their own voice messages
- Download from Cloud Storage on-demand

**Streaming Transcription:**

- Use Speech-to-Text Streaming API for real-time transcription
- Show text as user speaks (reduces perceived latency)

---

## ⚙️ PROFILE/SETTINGS PAGE

### Overview

The ProfilePage is a comprehensive settings and preferences screen providing users with complete control over the app's behavior, data management, and access to critical resources. Built with the bioluminescent aesthetic and glass morphism design throughout.

**Route:** `/profile`

### Architecture

**State Management:**

- **DialogContext** - Stack-based dialog management for modals (push/pop/replace) with portal rendering
- **UIContext** - UI measurements (navbar height/bottom) for proper content spacing
- **AppContext** - Global state for version, user profile, settings
- **useSettings Hook** - localStorage persistence with future Firestore sync ready
- **i18n** - react-i18next for multi-language support (English implemented)

**Key Dependencies:**

- `react-i18next` - Internationalization
- `react-hot-toast` - Toast notifications
- `@capacitor-community/in-app-review` - Native rating dialogs

### Settings Sections

#### 1. App Preferences Section

**Settings:**

- **Therapeutic Haptics** - Toggle (default: ON)
  - Light haptic test when enabled
  - Persists to localStorage: `hapticsEnabled`

- **Anonymous Analytics** - Toggle (default: ON)
  - Privacy-focused, no PII collected
  - Respects Do Not Track browser setting
  - Persists to localStorage: `analyticsEnabled`

- **Sound Effects** - Toggle (default: ON)
  - UI interaction sounds
  - Persists to localStorage: `soundEffectsEnabled`

**Analytics Events:**

- `HAPTICS_TOGGLED` - When haptics enabled/disabled
- `ANALYTICS_TOGGLED` - When analytics enabled/disabled (always logs, even if disabled)
- `SOUND_EFFECTS_TOGGLED` - Sound effects toggle

#### 2. Data & Privacy Section

**Features:**

**Export My Data:**

- Downloads JSON file with all user data
- Includes: conversations, messages, settings, timestamps
- Format: `anxiety-buddy-data-YYYY-MM-DD.json`
- Requires authentication
- Analytics: `DATA_EXPORTED`

**Clear Cache:**

- Clears temporary audio files
- Shows confirmation dialog
- Preserves conversations
- Analytics: `CACHE_CLEARED`

**Delete All Data:** (Destructive)

- Deletes all conversations, messages, audio files
- Shows destructive confirmation dialog
- Heavy haptic warning
- Preserves settings (haptics, analytics, etc.)
- Analytics: `DATA_DELETED`

**Delete Account:** (Critical Destructive)

- Deletes Firebase Auth account
- Deletes all user data
- Signs out immediately
- Shows destructive confirmation dialog
- Requires recent authentication
- Analytics: `ACCOUNT_DELETED`
- Reloads app after 1 second

**File:** `/app/src/utils/dataManagement.ts` (300 lines)

#### 3. Support & Resources Section

**Features:**

**Call Crisis Hotline:**

- Quick access to 988 (24/7 Mental Health Support)
- Heavy haptic feedback
- Opens tel:988 on native, copies on web
- Analytics: `CRISIS_HOTLINE_CALLED`

**Reset Tutorial:**

- Sets `hasSeenOnboarding` to false
- Toast: "Tutorial will show on next launch"
- Analytics: `ONBOARDING_RESET`

**Visit Website:**

- Description: "Learn more about Anxiety Buddy"
- Opens https://franz.cx/p/anxiety-buddy
- Opens in new tab (\_blank)
- Analytics: `WEBSITE_VISITED`

**Give Feedback:**

- Opens FeedbackDialog (modal)
- Description: "Your feedback helps us improve Anxiety Buddy for everyone. Thank you for sharing your thoughts!"
- Segmented control: "Idea" vs "Bug"
- Textarea with 1000 char limit
- Submits to Firestore: `feedback` collection
- Includes metadata: platform, appVersion, timestamp
- Close button positioned at top-right edge
- Centered title
- Analytics: `FEEDBACK_OPENED`, `FEEDBACK_SUBMITTED`

**Rate Anxiety Buddy:** (Native only)

- Shows AppLikePromptDialog first ("Are you enjoying Anxiety Buddy?")
- If YES → Request native in-app review dialog
- If NO → Show FeedbackDialog instead
- Platform detection (iOS/Android only)
- Fallback toast with "Rate on Store" button after 1.5s
- Placeholder App Store URLs (update when published)
- Analytics: Multiple events (see rating.service.ts)

**File:** `/app/src/services/rating.service.ts` (70 lines)

#### 4. Legal & Information Section

**Features:**

**Disclaimer:** (Critical for Mental Health App)

- Shows DisclaimerDialog
- Legal protection statement
- "NOT a substitute for professional care"
- Crisis resources reminder (988, 911, therapist, ER)
- "I Understand" button
- Sets localStorage flag: `hasSeenDisclaimer`
- Shows on first app launch
- Analytics: `DISCLAIMER_VIEWED`, `DISCLAIMER_ACCEPTED`

**Privacy Policy:**

- Opens https://franz.cx/p/anxiety-buddy/privacy
- External link in new tab
- Analytics: `PRIVACY_POLICY_VIEWED`

**Terms of Service:**

- Opens https://franz.cx/p/anxiety-buddy/terms
- External link in new tab
- Analytics: `TERMS_VIEWED`

**Version Footer:**

- Displays app version (v0.1.0)
- Small, subtle text at bottom
- Uses AppContext.version

### Component Architecture

**Reusable UI Components:**

**SettingRow** (`/app/src/components/ui/SettingRow.tsx`)

- Props: icon, label, description, value, onClick, toggle, checked, onChange, destructive, hideChevron, customRight
- Glass morphism styling with active states
- Toggle switch integration
- Chevron right indicator
- Destructive state (red text for dangerous actions)
- Haptic feedback on interactions
- ~100 lines

**SettingSection** (`/app/src/components/ui/SettingSection.tsx`)

- Glass card wrapper with rounded-3xl borders
- backdrop-blur-glass effect
- Optional title prop (section header)
- Automatic dividers between children
- ~50 lines

**Toggle** (`/app/src/components/ui/Toggle.tsx`)

- Custom toggle switch (not native checkbox)
- ON state: bg-biolum-cyan track with shadow-glow-md, dark void-blue thumb
- OFF state: bg-mist-white/20 track with border-mist-white/30, white thumb (improved visibility)
- Smooth 300ms transition with ease-viscous
- Thumb translates 20px right when ON
- Accessible (sr-only checkbox input)
- ~60 lines

**ConfirmDialog** (`/app/src/components/ui/ConfirmDialog.tsx`)

- Title, message, confirm/cancel buttons
- Destructive variant (red confirm button with AlertTriangle icon)
- Callback-based actions
- Framer Motion animations with scale and opacity
- Properly centered using flexbox (fixed inset-0 with items-center justify-center)
- Safe area support (pt-safe pb-safe)
- High z-index (z-[9999]) to appear above navbar
- Backdrop at z-[9998] with blur effect
- Already existed, reused

**Dialog Components:**

**FeedbackDialog** (`/app/src/components/features/profile/FeedbackDialog.tsx`)

- Segmented control: Idea vs Bug
- Multi-line textarea (5 rows, 1000 char limit)
- Submit to Firestore
- Bioluminescent styling
- ~100 lines

**DisclaimerDialog** (`/app/src/components/features/profile/DisclaimerDialog.tsx`)

- AlertCircle icon (warm-ember)
- Critical mental health disclaimer
- Crisis resources list
- "I Understand" button
- Sets localStorage flag
- ~80 lines

**AppLikePromptDialog** (`/app/src/components/features/profile/AppLikePromptDialog.tsx`)

- Heart icon (Yes) vs Meh icon (No)
- Pre-rating filter
- onLike/onDislike callbacks
- ~60 lines

### Services

**rating.service.ts** (`/app/src/services/rating.service.ts`)

- `requestAppRating(showToastOnFallback)` - Main rating function
- Platform detection (iOS/Android/Web)
- `InAppReview.requestReview()` attempt
- Fallback toast with "Rate on Store" button (1.5s delay)
- `openAppStore()` - Opens App/Play Store directly
- `isRatingAvailable()` - Checks if native rating available
- Placeholder URLs for App/Play Store
- ~70 lines

**analytics.service.ts** (`/app/src/services/analytics.service.ts`)

- Comprehensive enum of all analytics events
- `logAnalyticsEvent(event, params?)` - Main logging function
- Respects `analyticsEnabled` localStorage setting
- Always logs `ANALYTICS_TOGGLED` (even if disabled)
- Firebase Analytics integration
- ~120 lines

**dataManagement.ts** (`/app/src/utils/dataManagement.ts`)

- `exportUserData(userId)` - JSON export of all data
- `clearLocalStorage()` - Clear cache
- `deleteAllUserData(userId)` - Delete Firestore + Storage + localStorage
- `deleteUserAccount()` - Delete auth user + all data
- Toast notifications for success/failure
- Analytics tracking
- ~300 lines

### Hooks

**useSettings** (`/app/src/hooks/useSettings.tsx`)

- Returns: `{ settings, updateSetting }`
- Loads from localStorage on mount
- `updateSetting(key, value)` - Updates state + localStorage
- Future: Debounced Firestore sync (2s delay) - structured but not implemented
- ~50 lines

### UIContext - Navbar Measurements

**Purpose:** Provides UI measurements (navbar dimensions) to all components for proper content spacing

**Context:** `/app/src/contexts/UIContext.tsx`

- Stores `navbarHeight` and `navbarBottom` measurements
- Provides `setNavbarDimensions(height, bottom)` function
- Also includes `isScrolled` state for future use
- ~50 lines

**FloatingDock Integration:**

- Measures navbar dimensions on mount and resize
- Uses `useRef` for accurate DOM measurements
- Calls `setNavbarDimensions()` with height and bottom position
- `navbarBottom = window.innerHeight - rect.top`

**Usage in Pages:**

```typescript
const { navbarBottom } = useUI();
// Dynamic bottom padding to prevent navbar overlap
style={{ paddingBottom: `${navbarBottom + 32}px` }}
```

**Provider Setup:**

```typescript
// In App.tsx
<AppProvider>
  <UIProvider>  {/* Added for navbar measurements */}
    <DialogProvider>
      {/* ... */}
    </DialogProvider>
  </UIProvider>
</AppProvider>
```

### Internationalization (i18n)

**Setup:** `/app/src/utils/i18n.ts`

- react-i18next configuration
- Language detection: localStorage → navigator
- Fallback: en-US
- ~30 lines

**Translations:** `/app/src/assets/translations/en-US.json`

- All ProfilePage strings
- Settings labels and descriptions
- Dialog titles and messages
- Toast messages
- ~200 lines of JSON

**Usage in Components:**

```typescript
const { t } = useTranslation();
<h1>{t('profile.title')}</h1>
<p>{t('settings.hapticsDesc')}</p>
```

### Firebase Security Rules

**Firestore Rules** (`/backend/firestore.rules`)

Added:

```javascript
// Profile subcollection
match /users/{userId}/profile/{profileId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Feedback collection (write-only for users)
match /feedback/{feedbackId} {
  allow create: if request.auth != null
                && request.resource.data.userId == request.auth.uid
                && request.resource.data.text.size() <= 1000;
  allow read, update, delete: if false; // Admin only
}
```

**Cloud Storage Rules** (`/backend/storage.rules`)

Added:

```javascript
// Profile photos
match /profile-photos/{userId}/{fileName} {
  allow write: if request.auth != null
               && request.auth.uid == userId
               && request.resource.size < 2 * 1024 * 1024
               && request.resource.contentType.matches('image/.*');
  allow read: if request.auth != null && request.auth.uid == userId;
}
```

### App Integration

**App.tsx** - Wrapped with providers:

```typescript
<AppProvider>
  <UIProvider>  {/* Added for navbar measurements */}
    <DialogProvider>
      <BrowserRouter>
        <MainLayout>
          <AnimatedRoutes />
        </MainLayout>
      </BrowserRouter>
    </DialogProvider>
  </UIProvider>
</AppProvider>
```

**main.tsx** - Initialize i18n:

```typescript
import { initI18n } from './utils/i18n';
import { Toaster } from 'react-hot-toast';

initI18n();

// Toaster with custom styling and safe area support
<Toaster
  position="top-center"
  containerStyle={{ top: 'env(safe-area-inset-top, 0px)' }}
  toastOptions={{ duration: 2500, ...customStyles }}
  gutter={8}
/>
```

### TypeScript Types

**Added to `/app/src/models/index.ts`:**

```typescript
interface AppSettings {
  hapticsEnabled: boolean;
  analyticsEnabled: boolean;
  soundEffectsEnabled: boolean;
}

interface UserProfile {
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  settings: AppSettings;
  crisisContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

interface Feedback {
  userId: string;
  kind: 'idea' | 'bug';
  text: string;
  timestamp: Date;
  platform: string; // 'ios' | 'android' | 'web'
  appVersion: string;
  resolved: boolean; // Admin field
}
```

### Testing Checklist

**Settings Persistence:**

- [ ] Toggle haptics → Reload app → Verify state persists
- [ ] Change pink noise volume → Reload → Verify persists
- [ ] Toggle analytics → Reload → Verify persists

**Data Management:**

- [ ] Export data → Verify JSON structure and content
- [ ] Clear cache → Verify toast appears, cache cleared
- [ ] Delete all data → Verify confirmation, data deleted
- [ ] Delete account → Verify confirmation, user signed out

**Crisis Resources:**

- [ ] Tap 988 button → Verify phone dialer opens (native) or number copied (web)
- [ ] Tap 911 button → Verify phone dialer opens (native) or number copied (web)
- [ ] Verify heavy haptic feedback on tap

**Feedback System:**

- [ ] Open feedback dialog
- [ ] Switch between Idea/Bug
- [ ] Submit feedback → Verify Firestore document created
- [ ] Verify analytics events fire

**In-App Rating:**

- [ ] Tap "Rate App" (native only)
- [ ] Like → Verify native dialog attempts to show
- [ ] Dislike → Verify feedback dialog shows
- [ ] Verify fallback toast appears after 1.5s

**Legal & Info:**

- [ ] Tap Disclaimer → Verify dialog shows, content correct
- [ ] Tap Privacy Policy → Verify opens in new tab
- [ ] Tap Terms → Verify opens in new tab
- [ ] Verify version number displays correctly

**Animations & Styling:**

- [ ] Verify glass morphism renders correctly
- [ ] Verify bioluminescent toggle switch
- [ ] Verify smooth animations (300ms ease-viscous)
- [ ] Verify safe areas respected (notch, home indicator)

**Haptics:**

- [ ] Verify light haptic on all setting taps
- [ ] Verify medium haptic on success actions
- [ ] Verify heavy haptic on destructive confirmations
- [ ] Verify heavy haptic on crisis resource taps

### Known Limitations & Future Enhancements

**Not Implemented:**

- Profile photo upload (Camera API integration ready, upload logic pending)
- Crisis contacts management (data model ready)
- Firestore settings sync (debounced sync structured but not active)
- Tutorial/onboarding flow (reset works, flow needs building)

**Future Features:**

- Multi-language support (infrastructure ready, add translations)
- Notification preferences
- Data storage preference (local-only vs cloud sync)
- Export to PDF/CSV formats
- Share data with therapist (HIPAA-compliant export)

### Key Files Summary

**Components:**

- `/app/src/pages/ProfilePage.tsx` - Main page (380 lines)
- `/app/src/components/ui/SettingRow.tsx` - Reusable row (100 lines)
- `/app/src/components/ui/SettingSection.tsx` - Glass card wrapper (50 lines)
- `/app/src/components/ui/Toggle.tsx` - Bioluminescent switch (50 lines)
- `/app/src/components/features/profile/CrisisContactCard.tsx` (120 lines)
- `/app/src/components/features/profile/FeedbackDialog.tsx` (100 lines)
- `/app/src/components/features/profile/DisclaimerDialog.tsx` (80 lines)
- `/app/src/components/features/profile/AppLikePromptDialog.tsx` (60 lines)

**Services & Utilities:**

- `/app/src/services/rating.service.ts` - In-app review (70 lines)
- `/app/src/services/analytics.service.ts` - Event tracking (120 lines)
- `/app/src/utils/dataManagement.ts` - Data export/delete (300 lines)
- `/app/src/utils/i18n.ts` - i18n setup (30 lines)

**Contexts & Hooks:**

- `/app/src/contexts/DialogContext.tsx` - Dialog stack (120 lines)
- `/app/src/contexts/AppContext.tsx` - Extended with profile/settings (70 lines)
- `/app/src/hooks/useSettings.tsx` - Settings management (50 lines)

**Translations:**

- `/app/src/assets/translations/en-US.json` - English strings (200 lines)

**Firebase:**

- `/backend/firestore.rules` - Updated with profile/feedback rules
- `/backend/storage.rules` - Updated with profile-photos rules

**Total New/Modified Files:** ~20 files, ~2,000 lines of code

---

## 🚀 DEVELOPMENT WORKFLOW

### Starting the App

```bash
# Terminal 1: Start dev server
cd app && npm run dev

# Terminal 2: Run on iOS simulator
cd app && npm run ios

# Terminal 3: Run on Android emulator
cd app && npm run android
```

### Before Committing

```bash
npm run format    # Auto-format all TypeScript files
npm run lint      # Check for errors
npm run build     # Ensure production build works
```

### Testing on Real Device

```bash
cd app
npm run build      # Build production bundle
npx cap sync       # Sync to native projects
npx cap open ios   # Open Xcode
npx cap open android # Open Android Studio
```

---

## 🌍 INTERNATIONALIZATION (i18n) - CRITICAL

### ⚠️ NEVER Hardcode User-Facing Strings

**ABSOLUTE RULE**: ALL user-facing text MUST use i18n translation keys. Hardcoded strings are **STRICTLY FORBIDDEN**.

**Why This Matters:**

- Anxiety Buddy supports multiple languages (currently English and German)
- Users expect 100% coverage in their language
- Hardcoded strings break the localized experience
- Every new feature must work in all supported languages

---

### Current Languages

- **English (en-US)** - Primary language
- **German (de-DE)** - 100% coverage required, informal 'du' tone

---

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent: FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('namespace.key')}</h1>
      <p>{t('namespace.description')}</p>
      <button>{t('namespace.buttonLabel')}</button>
    </div>
  );
};
```

---

### Usage in Hooks & Utilities

**Option 1: Import i18next directly (recommended for non-React contexts)**

```typescript
import i18next from 'i18next';

export const myUtility = () => {
  const errorMessage = i18next.t('errors.myError');
  setError(errorMessage);
};
```

**Option 2: Pass t function as parameter**

```typescript
import type { TFunction } from 'i18next';

export const useMyHook = ({ t }: { t: TFunction }) => {
  setError(t('errors.myError'));
};
```

---

### Translation Files

**Location:**

- `/app/src/assets/translations/en-US.json` - English translations
- `/app/src/assets/translations/de-DE.json` - German translations

**Namespaces:**

- `home` - Home page content
- `vault` - Vault/archive page content
- `sos` - SOS flow (7-step panic de-escalation)
- `crisis` - Crisis resources and hotlines
- `chat` - Chat interface and messages
- `archive` - Conversation archive
- `audio` - Voice message states
- `time` - Relative time formatting
- `navigation` - Navigation labels
- `errors` - Error messages (chat, voice, archive, conversation)
- `toasts` - Toast notifications
- `profile` - Profile/settings page
- `general` - Shared UI text

---

### Before Committing Code

**MANDATORY CHECKLIST:**

1. **Search for hardcoded strings:**

   ```bash
   # Search for potential hardcoded user-facing strings
   grep -r '"[A-Z]' app/src/components --include="*.tsx" | grep -v "import\|export\|const\|type\|interface"
   grep -r '"[A-Z]' app/src/hooks --include="*.tsx" | grep -v "import\|export\|const\|type"
   grep -r '"[A-Z]' app/src/pages --include="*.tsx" | grep -v "import\|export\|const\|type"
   ```

2. **Verify all use `t()` or `i18next.t()`:**
   - Components must use `const { t } = useTranslation();`
   - Hooks/utils must import `i18next` directly

3. **Test in both languages:**
   - Switch to German in Profile → Settings → Language
   - Check all screens for missing translations, layout breaks, or English fallbacks
   - Ensure German text doesn't truncate or overflow

4. **Ensure 100% German coverage:**
   - Every English key must have a German translation
   - No missing keys in de-DE.json
   - Use informal 'du' tone (not formal 'Sie')

---

### Special Cases

**Pluralization:**

```typescript
// Translation keys
"time.minutesAgo_one": "{{count}} min ago",
"time.minutesAgo_other": "{{count}} mins ago"

// Usage
t('time.minutesAgo', { count: 5 }) // "5 mins ago"
t('time.minutesAgo', { count: 1 }) // "1 min ago"
```

**Interpolation:**

```typescript
// Translation key
"sos.exitBreath.cycleProgress": "Cycle {{current}} of {{total}}"

// Usage
t('sos.exitBreath.cycleProgress', { current: 2, total: 3 }) // "Cycle 2 of 3"
```

**Dynamic Language:**

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const currentLanguage = i18n.language; // 'en-US' or 'de-DE'

// Change language
await i18n.changeLanguage('de-DE');
```

---

### What NOT To Translate

✅ **DO translate:**

- Button labels
- Page titles and headings
- Instructions and prompts
- Error messages
- Toast notifications
- Placeholder text
- Aria labels for accessibility
- Alt text for images

❌ **DO NOT translate:**

- Variable names
- Function names
- CSS classes
- Firebase collection names
- API keys
- Import/export statements
- Type names
- Console logs (debugging)

---

### Common Mistakes

**❌ WRONG:**

```typescript
<button>Start Session</button>
setError('Failed to load data');
toast.success('Settings saved');
```

**✅ CORRECT:**

```typescript
<button>{t('home.startSession')}</button>
setError(i18next.t('errors.loadFailed'));
toast.success(i18next.t('toasts.settingsSaved'));
```

---

### Crisis Resources Localization

Crisis hotlines are **language-specific** and **critical for user safety**:

**English (en-US):**

- Primary: 988 (Crisis Hotline)
- Emergency: 911

**German (de-DE):**

- Primary: Telefonseelsorge (0800-1110111)
- Secondary: Telefonseelsorge (0800-1110222)
- Emergency: 112

See `/app/src/utils/crisisHotlines.ts` for implementation.

---

### Adding New Languages

To add a new language (e.g., Spanish):

1. Create `/app/src/assets/translations/es-ES.json`
2. Copy en-US.json structure
3. Translate all keys (use informal tone for Gen Z)
4. Add crisis hotlines for that region
5. Update `SupportedLanguage` type in `/app/src/models/index.ts`
6. Test all screens in new language

---

### Testing i18n

**Visual Testing:**

```bash
# 1. Start app
npm run dev

# 2. Go to Profile → Settings → Language
# 3. Switch to German
# 4. Navigate through all pages:
#    - Home
#    - SOS Flow (all 7 steps)
#    - Chat (send message, test voice, check crisis card)
#    - Vault
#    - Profile

# 5. Check for:
#    - Missing translations (English fallback)
#    - Layout breaks (German text is ~30% longer)
#    - Proper pluralization
#    - Crisis hotlines are German-specific
```

**Regression Testing:**

```bash
# Verify no hardcoded strings
npm run test:i18n  # TODO: Create script to grep for hardcoded strings
```

---

### Performance Considerations

- Translations are loaded synchronously on app start
- Both en-US.json and de-DE.json are small (~50KB combined)
- No lazy loading needed
- Language detection: localStorage → browser → fallback to en-US

---

### Resources

- **i18next Documentation:** https://www.i18next.com/
- **react-i18next Guide:** https://react.i18next.com/
- **Pluralization Rules:** https://www.i18next.com/translation-function/plurals
- **Interpolation:** https://www.i18next.com/translation-function/interpolation

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES

### Capacitor Haptics API

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Heavy impact (SOS trigger)
await Haptics.impact({ style: ImpactStyle.Heavy });

// Medium impact (success)
await Haptics.impact({ style: ImpactStyle.Medium });

// Light impact (UI taps)
await Haptics.impact({ style: ImpactStyle.Light });

// Selection feedback (continuous)
await Haptics.selectionStart();
await Haptics.selectionChanged();
await Haptics.selectionEnd();
```

### Framer Motion Page Transitions

```typescript
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1], // Viscous easing
};

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Safe Area Handling (Notch/Home Indicator)

**Plugin:** `tailwindcss-safe-area` - Installed and configured in `tailwind.config.ts`

**Generated Classes:**

- `pt-safe` - Adds `padding-top: env(safe-area-inset-top)`
- `pb-safe` - Adds `padding-bottom: env(safe-area-inset-bottom)`
- `pt-safe-offset-6` - Adds `padding-top: calc(env(safe-area-inset-top) + 1.5rem)`
- And more offset variants

**Usage in Screens:**

```tsx
// ProfilePage with safe areas and navbar spacing
<div
  className="bg-void-blue pt-safe flex h-full flex-col overflow-y-auto px-6 pb-8"
  style={{ paddingBottom: `${navbarBottom + 32}px` }}
>
  {/* Content */}
</div>
```

**Usage in Dialogs:**

```tsx
// DialogContext with safe areas
<div className="pt-safe pb-safe fixed inset-0 z-[9999] flex items-center justify-center px-4">
  {/* Dialog content */}
</div>
```

**Toast Configuration:**

```typescript
<Toaster
  containerStyle={{ top: 'env(safe-area-inset-top, 0px)' }}
  // Respects notch on iPhone X+
/>
```

### Prevent Overscroll Bounce (iOS)

```css
/* Already in index.css */
html,
body {
  overscroll-behavior: none;
}
```

### Custom Scrollbar Styling

**Location:** `/app/src/index.css`

**Bioluminescent Aesthetic** - Scrollbars match the deep ocean theme:

```css
/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(10, 17, 40, 0.5);
}

/* Webkit scrollbar (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(10, 17, 40, 0.5); /* void-blue with transparency */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2); /* semi-transparent white */
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 255, 218, 0.4); /* biolum-cyan glow on hover */
}
```

**Design:**

- Track: Dark void-blue with 50% opacity
- Thumb: Glass morphism (20% white opacity)
- Hover: Bioluminescent cyan glow (40% opacity)
- Smooth transition on hover
- Consistent across Firefox and Webkit browsers

---

## 🧪 TESTING STRATEGY (Future)

### Unit Tests

- [ ] Utils (pure functions)
- [ ] Hooks (useHaptics, useSOSSession)
- [ ] Components (isolated)

### Integration Tests

- [ ] SOS flow (complete 7-step sequence)
- [ ] Navigation (routing, deep links)

### E2E Tests (Detox)

- [ ] Critical path: Home → SOS → Completion
- [ ] Haptics verification (requires real device)

---

## 📊 PERFORMANCE TARGETS

### Build Size

- Initial bundle: < 500KB (gzipped)
- Code splitting: Lazy-load Vault, Profile pages
- Lighthouse score: > 90

### Runtime Performance

- 60 FPS animations (no jank)
- Time to Interactive: < 2 seconds
- Haptics latency: < 50ms

### Battery Usage

- Minimal wake locks
- No background processes (yet)
- Optimize animation loops

---

## 🔐 SECURITY & PRIVACY

### Data Storage

- All user data stored locally (Dexie/IndexedDB)
- No cloud sync without explicit opt-in
- No analytics without consent

### Permissions Required

- Haptics: Yes (core feature)
- Camera: Future (photo journaling)
- Notifications: Future (check-ins)

---

## 📚 REFERENCES & INSPIRATION

### Clinical References

- Cognitive Behavioral Therapy (CBT) principles
- 5-4-3-2-1 Grounding Technique
- 4-7-8 Breathing (Dr. Andrew Weil)
- Somatic Experiencing (Peter Levine)

### Design References

- Apple Human Interface Guidelines (Haptics)
- Glass Morphism (iOS design language)
- Deep ocean bioluminescence photography
- Ambient calm apps (Calm, Headspace - but darker)

---

## 🎯 SUCCESS METRICS (Future)

### User Engagement

- SOS completion rate (target: > 80%)
- Time to completion (benchmark: 2-3 minutes)
- Repeat usage (daily active users)

### Clinical Efficacy

- Self-reported anxiety reduction (1-5 scale)
- Session notes (qualitative data)

---

## 🚧 KNOWN LIMITATIONS

### Current

- No backend (offline-only)
- No audio playback (pink noise placeholder)
- No user accounts

### Future Considerations

- HIPAA compliance (if medical device)
- Crisis hotline integration
- Emergency contact auto-dial

---

## 🆘 TROUBLESHOOTING

### Haptics Not Working

1. Check device (simulator doesn't support haptics)
2. Verify `@capacitor/haptics` installed
3. Test on real device with iOS 13+ or Android 8+

### Animations Janky

1. Check GPU acceleration (`transform: translateZ(0)`)
2. Reduce backdrop blur (expensive)
3. Use `will-change` sparingly

### Safe Area Not Working

1. Check `tailwindcss-safe-area` plugin installed
2. Verify `safe-area-*` classes in Tailwind config
3. Test on device with notch (iPhone X+)

---

## 📝 CHANGELOG

### v0.1.0 (Current)

- Initial project setup
- Design system defined
- SOS flow architecture planned

---

**Last Updated:** December 9, 2024
**Next Review:** After SOS flow implementation

---

**For AI Assistants:** This document is the source of truth. When implementing features, always reference:

1. Design tokens (colors, animations)
2. SOS flow state machine (exact steps)
3. Haptics API usage (correct patterns)
4. File structure (where to place new components)
