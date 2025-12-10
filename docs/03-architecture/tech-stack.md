# Technology Stack

**Read this when:** Adding dependencies, upgrading packages, understanding architecture, onboarding

---

## Overview

Anxiety Buddy is built with modern web technologies optimized for native mobile experience.

**Approach:** Progressive Web App (PWA) wrapped in native shells via Capacitor
**Target Platforms:** iOS 13+, Android 8+, Web (modern browsers)

---

## Frontend Core

### React 18.3+

**Purpose:** UI library (functional components only, hooks-based)

**Why React?**

- Mature ecosystem
- Excellent mobile performance
- Hooks simplify state management
- Large community support

**Version Requirement:** 18.3+ (Concurrent features, automatic batching)

**Key Features Used:**

- Hooks (useState, useEffect, useContext, custom hooks)
- Context API (global state)
- Suspense (future: lazy loading)
- Strict Mode (development)

---

### TypeScript 5.7+

**Purpose:** Type-safe JavaScript superset

**Why TypeScript?**

- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Refactoring confidence

**Version Requirement:** 5.7+ (Latest features, performance improvements)

**Configuration:** Strict mode enabled (`tsconfig.json`)

**All files:** `.tsx` for components, `.ts` for utilities/services

---

### Vite 6.0+

**Purpose:** Build tool and dev server

**Why Vite?**

- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ESM support
- Better than Create React App

**Version Requirement:** 6.0+ (Latest optimizations)

**Key Features:**

- Dev server with instant HMR
- Rollup-based production builds
- Plugin ecosystem (React, PWA, etc.)
- Environment variables (`.env` files)

---

### Tailwind CSS 3.4+

**Purpose:** Utility-first CSS framework

**Why Tailwind?**

- Mobile-first by design
- Custom design tokens (colors, spacing, etc.)
- No CSS file bloat (only used classes)
- Consistent styling

**Version Requirement:** 3.4+ (Latest features)

**Configuration:** `tailwind.config.ts` with custom design system

**Plugins:**

- `tailwindcss-safe-area` (notch/home indicator handling)
- `@tailwindcss/line-clamp` (text truncation)

**See:** [Design System](../02-design-system/README.md) for design tokens

---

## Mobile Runtime

### Capacitor 7.0+

**Purpose:** Native iOS/Android bridge (web → native APIs)

**Why Capacitor?**

- Better than Cordova (modern, maintained)
- Native feel (not webview sluggishness)
- Access to native APIs (Haptics, Camera, etc.)
- Owned by Ionic (trusted)

**Version Requirement:** 7.0+ (Latest APIs, iOS 18 support)

**Key Features:**

- Native app shells (iOS Xcode project, Android Studio project)
- JavaScript bridge to native code
- Live reload during development
- App Store ready

---

### React Router DOM v7+

**Purpose:** Client-side routing

**Why React Router?**

- Industry standard
- Declarative routing
- Nested routes support
- Programmatic navigation

**Version Requirement:** v7+ (Latest React 18 support)

**Key Features:**

- `<BrowserRouter>` for web-like navigation
- `useNavigate()` for programmatic routing
- `useLocation()` for route awareness
- AnimatePresence integration with Framer Motion

---

### Framer Motion

**Purpose:** Animation library

**Why Framer Motion?**

- Best React animation library
- Declarative API
- Physics-based motion
- Gesture support (drag, tap, etc.)

**Key Features:**

- `motion` components (motion.div, etc.)
- AnimatePresence (exit animations)
- Variants (animation states)
- useReducedMotion() (accessibility)

**See:** [Animations Guide](../02-design-system/animations.md), [Page Transitions](../05-implementation/page-transitions.md)

---

## Native APIs (Capacitor Plugins)

### @capacitor/haptics ^7.0.0 ⚠️ CRITICAL

**Purpose:** Therapeutic haptic feedback

**Why Critical?** Haptics are therapy, not UI candy. Core to panic relief.

**Features:**

- Impact styles (Heavy, Medium, Light)
- Selection feedback (continuous)
- Cross-platform (iOS + Android)

**See:** [Haptics Guide](../05-implementation/haptics.md)

---

### @capacitor/status-bar ^7.0.0 ⚠️ CRITICAL

**Purpose:** Dark mode status bar, overlay styling

**Why Critical?** Ensures status bar matches void-blue background, maintains immersion

**Features:**

- Set background color
- Set style (light-content for dark bg)
- Hide/show status bar
- Overlay mode

---

### @capacitor/app ^7.0.0

**Purpose:** App lifecycle hooks

**Features:**

- State change events (active, background, inactive)
- URL open handlers (deep links)
- App info (version, build number)

---

### @capacitor/camera ^7.0.1

**Purpose:** Photo journaling, profile pictures (future feature)

**Features:**

- Take photos
- Pick from gallery
- Image quality control
- Format conversion

---

### @capacitor/filesystem ^7.0.1

**Purpose:** Local data persistence (future: offline-first)

**Features:**

- Read/write files
- Create directories
- File metadata
- App-sandboxed storage

---

### capacitor-voice-recorder ^7.0.6 ⚠️ CRITICAL

**Purpose:** Voice message recording

**Why Critical?** Lower cognitive load during anxiety - speaking is easier than typing

**Features:**

- Start/stop recording
- Microphone permissions
- Cross-platform audio (AAC on iOS, varies on Android, WebM on web)
- Base64 encoding

**See:** [Voice Chat Feature](../04-features/voice-chat.md)

---

### @capacitor-community/in-app-review ^7.0.0

**Purpose:** Native in-app rating dialogs

**Features:**

- Request App Store review (iOS)
- Request Play Store review (Android)
- Smart timing (don't spam user)

**See:** [Profile Settings](../04-features/profile-settings.md)

---

## UI Components & Utilities

### lucide-react

**Purpose:** Consistent, minimal icon set

**Why Lucide?**

- Open source, MIT license
- 1000+ icons
- React components
- Consistent design

**Usage:** `import { IconName } from 'lucide-react'`

---

### clsx

**Purpose:** Conditional className utility

**Usage:**

```typescript
import clsx from 'clsx';

const buttonClass = clsx(
  'px-6 py-3 rounded-2xl',
  isActive && 'bg-biolum-cyan',
  isDisabled && 'opacity-50'
);
```

---

### tailwind-merge

**Purpose:** Merge Tailwind classes without conflicts

**Usage:**

```typescript
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export const cn = (...inputs) => twMerge(clsx(inputs));
```

**See:** `/app/src/utils/cn.ts`

---

### react-i18next + i18next

**Purpose:** Internationalization (multi-language support)

**Current Languages:** English (en-US), German (de-DE)

**Features:**

- Translation keys
- Pluralization
- Interpolation
- Language detection
- LocalStorage persistence

**See:** [i18n Guide](../05-implementation/i18n-guide.md) ⚠️ CRITICAL

---

### react-hot-toast

**Purpose:** Toast notifications

**Why react-hot-toast?**

- Best React toast library
- Custom styling
- Promise support
- Accessible

**Features:**

- Success/error/loading states
- Custom components
- Position control
- Safe area support

**Configuration:** `main.tsx` with custom styling

---

## Backend (Firebase)

### Firebase Platform

**Services Used:**

- Firestore (NoSQL database)
- Authentication (anonymous + future social auth)
- Cloud Storage (audio files, photos)
- Cloud Functions (transcription, AI chat)

---

### Firestore

**Purpose:** Real-time NoSQL database

**Structure:**

```
/users/{userId}
  /conversations/{conversationId}
    /messages/{messageId}
  /profile/{profileId}
/feedback/{feedbackId}
```

**See:** [Firebase Guide](../05-implementation/firebase.md)

---

### Firebase Authentication

**Current:** Anonymous auth (auto-generate user IDs)
**Future:** Social auth (Google, Apple)

---

### Cloud Storage

**Purpose:** Store audio files, profile photos

**Buckets:**

- `audio-messages/` (7-day retention)
- `profile-photos/` (permanent)

**Security:** User-scoped access only

---

### Cloud Functions (Node.js)

**Purpose:** Backend logic (transcription, AI chat)

**Runtime:** Node.js 20
**Triggers:** Firestore document events, HTTP requests

---

## Backend Dependencies

### @google-cloud/speech ^6.0.0

**Purpose:** Speech-to-Text transcription

**API:** Google Cloud Speech-to-Text API v2
**Model:** `latest_long` (conversational)
**Languages:** en-US (future: auto-detect)

**See:** [Voice Chat Feature](../04-features/voice-chat.md)

---

### @google-cloud/storage ^7.0.0

**Purpose:** Cloud Storage SDK for functions

**Used in:** Audio file download/upload in transcription function

---

### @google-cloud/vertexai (latest)

**Purpose:** Gemini AI integration

**Model:** Gemini 2.5 Flash
**Use Case:** Therapeutic responses, CBT/ACT techniques
**Prompt Engineering:** Crisis detection, empathetic responses

**See:** [AI Chat Feature](../04-features/ai-chat.md)

---

### firebase-admin (latest)

**Purpose:** Firebase Admin SDK for functions

**Features:**

- Firestore access
- Auth management
- Storage access

---

### firebase-functions (latest)

**Purpose:** Cloud Functions runtime

**Features:**

- onDocumentCreated triggers
- onDocumentWritten triggers
- HTTP functions (future)

---

### fluent-ffmpeg ^2.1.3

**Purpose:** Audio format conversion (AAC/MP4 → LINEAR16 WAV)

**Why needed?** Google Speech-to-Text doesn't support AAC/MP4 from mobile devices.

**Dependencies:** Requires ffmpeg binary

---

### @ffmpeg-installer/ffmpeg ^1.1.0

**Purpose:** FFmpeg binary for Cloud Functions environment

**Note:** Cloud Functions doesn't have ffmpeg pre-installed

---

## Offline-First (Future)

### Dexie

**Purpose:** IndexedDB wrapper for local-first data

**Status:** Planned, not yet implemented

**Use Case:** Offline-first conversations, sync when online

---

## Development Tools

### ESLint

**Purpose:** Linting (code quality)

**Configuration:** `.eslintrc.js` with React + TypeScript rules

---

### Prettier

**Purpose:** Code formatting

**Configuration:** `.prettierrc` with project standards

---

### Firebase CLI

**Purpose:** Deploy functions, configure Firebase

**Installation:** `npm install -g firebase-tools`

---

## Version Policy

### Major Version Updates

✅ **Safe to update:**

- Patch versions (e.g., 7.0.0 → 7.0.1)
- Minor versions (e.g., 7.0.0 → 7.1.0)

⚠️ **Caution:**

- Major versions (e.g., 7.0.0 → 8.0.0)
- Test thoroughly before updating
- Check breaking changes in changelog

---

## Adding New Dependencies

### Checklist

1. **Do we need it?** (Avoid dependency bloat)
2. **Is it maintained?** (Check last commit date on GitHub)
3. **Is it popular?** (Check npm downloads, GitHub stars)
4. **Is it typed?** (TypeScript support)
5. **What's the bundle size?** (Check bundlephobia.com)

### Installation

```bash
# Frontend
cd app && npm install <package>

# Backend
cd backend/functions && npm install <package>
```

### Update Documentation

- Add to this file (tech-stack.md)
- Explain purpose and usage
- Link to relevant guides

---

## See Also

- [Project Structure](project-structure.md) - Where to place code
- [State Management](state-management.md) - Context patterns
- [Getting Started](../06-development/getting-started.md) - Setup instructions
