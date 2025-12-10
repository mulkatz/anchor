# Changelog

**Read this when:** Release planning, version history, migration guides

All notable changes to Anxiety Buddy are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### In Progress

- SOS Flow implementation (7-step panic de-escalation)
- Home screen with quick access
- Vault (session history, journal entries)

### Planned

- Profile photo upload
- Crisis contacts management
- Offline-first data sync
- Pink noise audio playback
- Tutorial/onboarding flow

---

## [0.1.0] - 2024-12-10

### Added

**Core Features:**

- Voice Chat - WhatsApp-style voice messaging with Google Cloud Speech-to-Text transcription
- AI Chat - Therapeutic conversations powered by Gemini 2.5 Flash with CBT/ACT techniques
- Message System - Real-time Firestore-based chat with crisis detection
- Haptics Integration - Therapeutic touch feedback throughout the app

**Profile/Settings:**

- Complete settings screen with 4 sections
- App Preferences (haptics, analytics, sound effects)
- Data & Privacy (export, clear cache, delete data, delete account)
- Support & Resources (crisis hotline, feedback, rating)
- Legal & Information (disclaimer, privacy policy, terms)

**Infrastructure:**

- Crisis Resources - Prominent 988/911 hotline access with haptic feedback
- Internationalization - i18n infrastructure with English and German
- Dialog Management - Stack-based dialog system for modals
- Analytics Service - Comprehensive event tracking

**Design System:**

- Bioluminescent deep ocean aesthetic
- Glass morphism UI components
- Viscous animation system
- Custom Tailwind design tokens

### Technical

- React 18.3+ with TypeScript 5.7+
- Vite 6.0+ build system
- Capacitor 7.0+ for native mobile
- Firebase (Firestore, Auth, Storage, Functions)
- Google Cloud Speech-to-Text API v2
- Google Vertex AI (Gemini 2.5 Flash)

---

## Version Format

`MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes, major new features
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, small improvements

---

## Migration Guides

### 0.1.0 → Future

_No migrations needed yet. This is the initial release._

---

## See Also

- [Getting Started](../06-development/getting-started.md) - Setup instructions
- [Tech Stack](../03-architecture/tech-stack.md) - Dependencies
