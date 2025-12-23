# CLAUDE.md - Anchor: Anxiety Navigator

**AI Assistant Navigation Hub** | **Stage:** Polishing Phase

---

## Project Overview

Anchor: Anxiety Navigator is a **therapeutic interface** for immediate relief during anxiety and panic attacks. Built for Gen Z (18-26), it uses evidence-based CBT + Somatic Grounding techniques delivered through a bioluminescent deep-ocean aesthetic.

**Core Stack:** React 18 + TypeScript + Vite + Capacitor + Firebase + Gemini AI

---

## ⚠️ Critical Rules (Always Apply)

### 1. NEVER Hardcode User-Facing Strings

**All text must use i18n translation keys.** See [i18n Guide](docs/05-implementation/i18n-guide.md).

```tsx
// ❌ WRONG
<button>Start Session</button>

// ✅ CORRECT
<button>{t('home.startSession')}</button>
```

### 2. Always Use Design Tokens

Colors, fonts, and animations from [Design System](docs/02-design-system/README.md).

```tsx
// ❌ WRONG
<div className="bg-blue-900 text-white">

// ✅ CORRECT
<div className="bg-void-blue text-mist-white">
```

### 3. Haptics Are Therapy

Every interaction needs appropriate haptic feedback. See [Haptics Guide](docs/05-implementation/haptics.md).

---

## Quick Reference

### Colors

| Color       | Hex       | Class              | Usage       |
| ----------- | --------- | ------------------ | ----------- |
| Void Blue   | `#0A1128` | `bg-void-blue`     | Background  |
| Biolum Cyan | `#64FFDA` | `text-biolum-cyan` | Interactive |
| Warm Ember  | `#FFB38A` | `text-warm-ember`  | Accents     |
| Mist White  | `#E2E8F0` | `text-mist-white`  | Text        |

### Animation

- **Minimum duration:** 400ms
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` → `ease-viscous`
- **Philosophy:** Viscous, never snappy

### Haptics

| Type      | When                         |
| --------- | ---------------------------- |
| Heavy     | Crisis moments (SOS trigger) |
| Medium    | Completion, success          |
| Light     | UI taps, interactions        |
| Selection | Continuous drag/scrub        |

---

## When to Read What

### Task → Required Documentation

| Task                       | Must Read                                                                                                          | Optional                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Building UI component**  | [Design System](docs/02-design-system/README.md), [i18n](docs/05-implementation/i18n-guide.md)                     | [Animations](docs/02-design-system/animations.md)                 |
| **Adding new screen**      | [i18n](docs/05-implementation/i18n-guide.md), [Project Structure](docs/03-architecture/project-structure.md)       | [Page Transitions](docs/05-implementation/page-transitions.md)    |
| **Any text changes**       | [i18n Guide](docs/05-implementation/i18n-guide.md) ⚠️                                                              | -                                                                 |
| **Working on SOS flow**    | [SOS Flow](docs/04-features/sos-flow.md), [Haptics](docs/05-implementation/haptics.md)                             | [Animations](docs/02-design-system/animations.md)                 |
| **Voice chat feature**     | [Voice Chat](docs/04-features/voice-chat.md), [Firebase](docs/05-implementation/firebase.md)                       | -                                                                 |
| **AI chat/memory system**  | [Chat Architecture](docs/04-features/chat-system-architecture.md) ⚠️, [User Story](docs/04-features/user-story.md) | [AI Chat](docs/04-features/ai-chat.md)                            |
| **AI temporal awareness**  | [Temporal Awareness](docs/04-features/temporal-awareness.md)                                                       | -                                                                 |
| **The Dive feature**       | [The Dive](docs/04-features/the-dive.md) ⚠️                                                                        | [AI Chat](docs/04-features/ai-chat.md)                            |
| **Profile/settings**       | [Profile Settings](docs/04-features/profile-settings.md)                                                           | [State Management](docs/03-architecture/state-management.md)      |
| **Usage/cost tracking**    | [Usage Monitoring](docs/04-features/usage-monitoring.md)                                                           | [Firebase](docs/05-implementation/firebase.md)                    |
| **Vault/archive page**     | [Vault](docs/04-features/vault.md)                                                                                 | [Chat Architecture](docs/04-features/chat-system-architecture.md) |
| **Fixing bug**             | [Troubleshooting](docs/06-development/troubleshooting.md)                                                          | -                                                                 |
| **Understanding codebase** | [Manifest](docs/01-vision/manifest.md), [Tech Stack](docs/03-architecture/tech-stack.md)                           | [Project Structure](docs/03-architecture/project-structure.md)    |

---

## Documentation Structure

```
docs/
├── 01-vision/
│   ├── manifest.md              # Project vision, purpose, aesthetic
│   └── design-principles.md     # 5 core design principles
│
├── 02-design-system/
│   ├── README.md                # ⚡ Quick reference (start here)
│   ├── colors.md                # Palette, usage, accessibility
│   ├── typography.md            # Fonts, sizes, hierarchy
│   ├── animations.md            # Motion, easing, durations
│   └── glass-effects.md         # Shadows, glows, blur
│
├── 03-architecture/
│   ├── tech-stack.md            # Frameworks, versions, dependencies
│   ├── project-structure.md     # Folder organization, where to put code
│   └── state-management.md      # Contexts, hooks, data flow
│
├── 04-features/
│   ├── sos-flow.md              # 🆘 7-step panic de-escalation
│   ├── voice-chat.md            # 🎤 Recording, transcription
│   ├── ai-chat.md               # 🤖 Therapeutic AI, crisis detection
│   ├── chat-system-architecture.md # 🧠 ⚠️ Visual system diagrams (mermaid)
│   ├── user-story.md            # 📝 Two-tier memory, extraction, personalization
│   ├── temporal-awareness.md    # 🕐 Time-aware conversations, DST support
│   ├── the-dive.md              # 🌊 Somatic learning (Polyvagal Theory)
│   ├── vault.md                 # 🗄️ Session history, AI titles/summaries
│   ├── profile-settings.md      # ⚙️ Settings, data management
│   ├── usage-monitoring.md      # 📊 Per-user cost tracking, admin functions
│   └── planned-features.md      # 📋 Roadmap
│
├── 05-implementation/
│   ├── i18n-guide.md            # 🌍 ⚠️ CRITICAL - Internationalization
│   ├── haptics.md               # 📳 Therapeutic haptics patterns
│   ├── safe-areas.md            # 📱 Notch, home indicator
│   ├── page-transitions.md      # 🎬 Framer Motion patterns
│   └── firebase.md              # 🔥 Firestore, Auth, Storage
│
├── 06-development/
│   ├── getting-started.md       # 🚀 Setup, running the app
│   ├── testing.md               # 🧪 Testing strategy
│   └── troubleshooting.md       # 🔧 Common issues
│
└── 07-reference/
    ├── performance.md           # ⚡ Targets, optimization
    ├── security-privacy.md      # 🔐 Data handling, rules
    └── changelog.md             # 📝 Version history
```

---

## Current Status

### ✅ Implemented

- Voice Chat (recording, transcription, AI response, 120s max)
- AI Chat (Gemini 2.5 Flash, CBT/ACT techniques)
- **Temporal Awareness (time-aware AI, 75 msg history, timezone/DST support)**
- Message System (real-time Firestore, crisis detection)
- Profile/Settings (haptics, analytics, data management, **cross-device sync**)
- Internationalization (English + German)
- Haptics Integration
- Journal/Depths (free-form journaling with sedimentation)
- **The Dive (25-lesson somatic learning, Polyvagal Theory, AI Somatic Guide)**
- **Vault (session history browser, AI-generated titles/summaries/topic tags)**
- **Usage Monitoring (per-user cost tracking, AI tokens, speech minutes, admin functions)**

### 🚧 In Progress

- SOS Flow (7-step panic de-escalation)

### 📋 Planned

- Home screen
- Offline-first sync
- Pink noise audio
- Tutorial/onboarding

---

## File Naming Conventions

| Type       | Convention             | Example                |
| ---------- | ---------------------- | ---------------------- |
| Components | `PascalCase.tsx`       | `ChatInput.tsx`        |
| Hooks      | `useCamelCase.tsx`     | `useHaptics.tsx`       |
| Services   | `camelCase.service.ts` | `analytics.service.ts` |
| Utils      | `camelCase.ts`         | `formatTime.ts`        |
| Types      | `models/index.ts`      | All types in one file  |

---

## Key Directories

```
app/
├── src/
│   ├── pages/           # Route-level screens
│   │   ├── DivePage.tsx         # The Dive overview (Ocean Depth Map)
│   │   └── DiveLessonPage.tsx   # Lesson intro + chat session
│   ├── components/
│   │   ├── ui/          # Atomic components (Button, Card)
│   │   └── features/    # Feature-specific (chat/, profile/, dive/)
│   ├── hooks/           # Custom React hooks
│   │   ├── useDiveSession.tsx   # Dive session state
│   │   ├── useDiveLesson.tsx    # Localized lesson fetching
│   │   └── useUsage.tsx         # Real-time usage subscription
│   ├── contexts/        # Global state (App, UI, Dialog, Dive)
│   │   └── DiveContext.tsx      # Dive progress + localStorage cache
│   ├── data/
│   │   └── dive-lessons.ts      # Static lesson data (25 lessons)
│   ├── services/        # External APIs (Firebase, analytics)
│   ├── utils/           # Pure helpers
│   └── assets/
│       └── translations/  # i18n JSON files
│
backend/
├── functions/src/
│   ├── diveChat.ts      # Dive AI responses + completion
│   ├── divePrompt.ts    # Somatic Guide persona
│   ├── diveLessonData.ts # Localized lesson content
│   ├── transcription.ts # Audio transcription (chat + dive)
│   ├── chat.ts          # Regular chat AI
│   ├── conversations.ts # Conversation lifecycle triggers
│   ├── conversationTitle.ts # AI title/summary generation
│   └── usage/           # Usage monitoring system
│       ├── usageTracker.ts   # Core tracking service
│       ├── costCalculator.ts # Cost calculations
│       ├── admin.ts          # Scheduled admin functions
│       └── migration.ts      # User initialization
├── firestore.rules      # Database security
└── storage.rules        # Storage security (incl. dive-audio/)
```

---

## Development Commands

```bash
# Start dev server
cd app && npm run dev

# Run iOS simulator
cd app && npm run ios

# Run Android emulator
cd app && npm run android

# Before committing
npm run format && npm run lint && npm run build

# Deploy Firebase
cd backend && firebase deploy
```

---

## Getting Help

- **Setup issues:** [Getting Started](docs/06-development/getting-started.md)
- **Bug debugging:** [Troubleshooting](docs/06-development/troubleshooting.md)
- **Feature specs:** [Features](docs/04-features/)
- **Design questions:** [Design System](docs/02-design-system/README.md)

---

**Last Updated:** December 23, 2024
