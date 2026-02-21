# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2026-02-21

Published on Google Play and App Store as **Anchor: Anxiety Navigator**.

### Added

#### AI & Conversation

- AI-powered therapeutic chat with Gemini 2.5 Flash using CBT and ACT techniques
- Voice messages with WhatsApp-style recording — Google Cloud Speech-to-Text transcription with server-side FFmpeg audio conversion for cross-platform compatibility
- 10-minute voice message support with long-running transcription
- Temporal awareness — time-aware AI with timezone/DST support and 75-message context window
- Adaptive language — AI mirrors the user's communication style
- Crisis keyword detection with automatic 988/Crisis Text Line resources

#### Memory & Personalization

- User Story progressive profiling — AI learns about the user across conversations
- Mid-term memory — cross-conversation topic tracking with smart matching
- AI-generated conversation titles, summaries, and topic tags

#### The Dive

- 25-lesson somatic learning program based on Polyvagal Theory
- AI Somatic Guide persona for guided lessons
- Ocean Depth Map overview with zone progression
- Lesson persistence with cross-device sync

#### Illuminate (Lighthouse)

- 6-step CBT reflection wizard with speech-to-text input
- Reflection history with detail view
- Insight generation from completed reflections

#### Journal (Depths)

- Free-form journaling with 30-minute sedimentation mechanic
- Integration with data export

#### Vault

- Session history browser with AI-generated titles and summaries
- Topic tags for conversation categorization

#### Treasures (Achievements)

- Achievement system with ocean-themed badges
- Streak tracking with Cloud Function calculation
- Profile hero card with treasure overview

#### Profile & Settings

- Complete settings with haptics, analytics, and sound preferences
- Data management — export all data, clear cache, delete account
- Cross-device settings sync
- Crisis hotline quick access with expandable section

#### Infrastructure

- Internationalization with English and German
- Therapeutic haptic feedback system throughout the app
- 2-screen onboarding flow with disclaimer
- Firebase Remote Config for app version checking
- Usage monitoring with per-user cost tracking and admin functions
- Android minification with ProGuard rules
- App Store and Google Play deployment pipeline

#### Design System

- Bioluminescent deep-ocean aesthetic with glass morphism
- Viscous animation system (600ms+ durations) with Framer Motion
- Custom Tailwind design tokens (void-blue, biolum-cyan, warm-ember, mist-white)
- Safe area handling for notch and home indicator

#### Landing Page

- Marketing website with feature highlights, privacy section, and store links

[0.8.0]: https://github.com/mulkatz/anxiety-buddy/releases/tag/v0.8.0
