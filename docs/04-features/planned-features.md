# Planned Features

**Read this when:** Planning future development, prioritizing roadmap items, or understanding what's coming next for Anchor: Anxiety Navigator.

---

## Overview

This document tracks planned features that are not yet implemented but are part of the product vision. Features are organized by priority and complexity.

---

## High Priority

### Home Screen with Quick Access

**Status:** 📋 Planned

**Description:**
Landing screen providing immediate access to core features and recent activity.

**Features:**

- Large SOS button (immediate panic de-escalation)
- Quick access to recent conversations
- Mood check-in widget
- Daily grounding exercise prompt
- Streak tracker (days using app)

**Design:**

- Hero SOS button at center (pulsing glow)
- Glass morphism cards for recent items
- Minimal text, icon-heavy
- Smooth page transitions

**File Structure:**

```
app/src/pages/HomePage.tsx
app/src/components/features/home/
  ├── SOSButton.tsx
  ├── QuickAccessCard.tsx
  ├── MoodWidget.tsx
  └── StreakTracker.tsx
```

---

### Vault (Session History & Journal)

**Status:** 📋 Planned

**Description:**
Archive of saved SOS sessions, conversations, and journal entries. Provides users with a timeline of their progress.

**Features:**

- Chronological list of saved sessions
- Session details: duration, steps completed, mood ratings
- Search/filter by date, mood, tags
- Export individual sessions
- Session statistics (completion rate, average duration)
- Photo journal entries (future)

**Design:**

- Timeline view with date separators
- Glass morphism cards for each session
- Expandable details on tap
- Swipe actions (archive, delete)

**Data Model:**

```typescript
interface SOSSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  stepsCompleted: SOSStep[];
  moodBefore?: number; // 1-5
  moodAfter?: number; // 1-5
  notes?: string;
  tags?: string[];
}
```

**File Structure:**

```
app/src/pages/VaultPage.tsx
app/src/components/features/vault/
  ├── SessionCard.tsx
  ├── SessionDetails.tsx
  ├── SessionStats.tsx
  └── SessionTimeline.tsx
```

---

### Tutorial/Onboarding Flow

**Status:** 📋 Planned (reset logic exists)

**Description:**
Interactive tutorial introducing users to app features and therapeutic techniques.

**Flow:**

1. **Welcome Screen** - "Welcome to Anchor: Anxiety Navigator"
2. **Purpose** - "Immediate relief for anxiety & panic attacks"
3. **SOS Demo** - Interactive walkthrough of 7-step flow
4. **Voice Chat** - Show how to send voice messages
5. **Crisis Resources** - Highlight 988/911 access
6. **Permissions** - Request mic, haptics, notifications
7. **Ready** - "You're all set!"

**Features:**

- Skippable after first screen
- "Show me how" vs "Skip tutorial" option
- Progress indicator (dots)
- Framer Motion page transitions
- Sets `localStorage.hasSeenOnboarding = true`

**Design:**

- Full-screen slides
- Large illustrations
- Minimal text (5 words or less)
- Interactive demos (not just screenshots)

---

## Medium Priority

### Offline-First Data Sync with Firestore

**Status:** 📋 Planned

**Description:**
Seamless offline support with automatic background sync when online.

**Technical Stack:**

- **Dexie:** IndexedDB wrapper for local data
- **Firestore:** Cloud persistence
- **Sync Logic:** Background workers

**Features:**

- All data available offline
- Queue write operations when offline
- Sync on reconnection
- Conflict resolution (last-write-wins)
- Sync status indicator

**Sync Priority:**

1. User messages (highest)
2. Settings changes
3. Session data
4. Analytics events (lowest)

**Implementation:**

```
app/src/services/
  ├── offline.service.ts    # Offline detection
  ├── sync.service.ts       # Background sync
  └── dexie.service.ts      # IndexedDB wrapper
```

---

### Pink Noise Audio Playback

**Status:** 📋 Planned (placeholder in SOS Step 5)

**Description:**
Calming pink noise audio during SOS Step 5 (Grounding - SOUND).

**Features:**

- High-quality pink noise audio file
- Fade in/out (2s each)
- Volume control (user preference)
- Loopable for extended sessions
- Background playback (mobile)

**Technical:**

- Audio file: `/app/src/assets/sounds/pink-noise.mp3`
- Capacitor Audio plugin (native playback)
- Web Audio API (web fallback)

**Settings Integration:**

- "Pink Noise Volume" slider in Profile
- "Auto-play during SOS" toggle

---

### Profile Photo Upload

**Status:** 📋 Planned (Camera API ready)

**Description:**
Allow users to upload profile photos using device camera or gallery.

**Features:**

- Take photo with camera
- Choose from gallery
- Crop/resize preview
- Upload to Cloud Storage
- Display in Profile page

**Technical:**

- Capacitor Camera plugin
- Cloud Storage: `profile-photos/{userId}/{fileName}.jpg`
- Image optimization (resize to 512x512)
- Security rules already implemented

**File Structure:**

```
app/src/components/features/profile/
  ├── ProfilePhotoUpload.tsx
  └── ImageCropper.tsx
```

---

### Crisis Contacts Management

**Status:** 📋 Planned (data model ready)

**Description:**
Add and manage emergency contacts for quick access during crisis.

**Features:**

- Add contact (name, phone, relationship)
- Edit/delete contacts
- Quick call button in Profile
- Auto-notify contact option (with permission)

**Data Model (already defined):**

```typescript
interface CrisisContact {
  name: string;
  phone: string;
  relationship: string;
}

// In UserProfile
crisisContacts?: CrisisContact[];
```

**UI:**

- List in Profile → Support & Resources section
- "Add Contact" button
- Contact cards with call/delete actions

---

### Photo Journaling

**Status:** 📋 Planned

**Description:**
Visual journaling for users who prefer images over text.

**Features:**

- Take photos during calm moments
- Add captions/tags
- Browse photo timeline
- Export photos with journal

**Technical:**

- Capacitor Camera plugin
- Cloud Storage for images
- Firestore for metadata

**Use Cases:**

- Gratitude photos (things that bring joy)
- Grounding photos (safe spaces)
- Progress photos (before/after therapy)

---

## Low Priority / Research

### Biometric Integration

**Status:** 🔬 Research

**Description:**
Integrate heart rate and other biometrics for adaptive experiences.

**Potential Features:**

- Heart rate monitoring during SOS flow
- Adaptive step duration based on heart rate
- Progress tracking over time
- Wearable integration (Apple Watch, Fitbit)

**Challenges:**

- Privacy concerns (health data)
- Device compatibility
- Battery usage
- HIPAA compliance

---

### Voice-Guided Instructions

**Status:** 🔬 Research

**Description:**
Optional voice narration during SOS flow for users who prefer audio guidance.

**Features:**

- Text-to-speech for instructions
- Calming voice tone
- Adjustable speed
- Multiple language support

**Technical:**

- Native TTS APIs (iOS/Android)
- Web Speech API (fallback)
- Pre-recorded audio (higher quality)

---

### Notification Check-Ins

**Status:** 🔬 Research

**Description:**
Gentle, optional check-ins to encourage app usage and track progress.

**Features:**

- Daily mood check-in notification
- Customizable time
- Opt-in only (never forced)
- "How are you feeling?" quick response

**Privacy Concerns:**

- Notifications must be non-intrusive
- No data collection without consent
- Easy to disable

---

### Therapist Data Sharing

**Status:** 🔬 Research

**Description:**
HIPAA-compliant export for sharing progress with therapist.

**Features:**

- Generate therapist-friendly reports
- Session summaries with trends
- Mood graph visualizations
- PDF export with encryption

**Compliance Requirements:**

- HIPAA compliance (critical)
- End-to-end encryption
- User consent flow
- Audit trail

**Challenges:**

- Legal compliance
- Security implementation
- User trust

---

### Adaptive SOS Flow

**Status:** 🔬 Research

**Description:**
AI-powered adaptive SOS flow based on user history and effectiveness.

**Features:**

- Learn which steps work best for user
- Adjust step duration based on completion patterns
- Skip less effective steps
- Suggest alternative techniques

**Technical:**

- Machine learning model
- Privacy-preserving training
- On-device inference (if possible)

**Ethical Considerations:**

- Transparency (user should understand adaptations)
- Override option (manual control)
- No false promises (AI is not therapy)

---

### Community Features (Maybe Never)

**Status:** ⚠️ Under Consideration

**Description:**
Peer support community for users.

**Why Hesitant:**

- Moderation burden (risk of harm)
- Privacy concerns (anonymity vs safety)
- Scope creep (app is for immediate relief, not social)
- Liability risks (crisis situations)

**If Implemented:**

- Anonymous support groups
- Moderated by professionals
- Clear crisis escalation protocol
- Opt-in only

---

## Feature Prioritization Framework

When deciding what to build next, consider:

1. **User Impact** - Does it reduce anxiety effectively?
2. **Core Mission Alignment** - Immediate relief vs. long-term support
3. **Technical Complexity** - Implementation effort
4. **Privacy/Safety** - Mental health app has higher bar
5. **Differentiation** - What makes Anxiety Buddy unique?

**Example:**

- ✅ **Offline-first sync:** High impact, aligns with mission, moderate complexity
- ⚠️ **Community features:** Unclear impact, potential safety risks, high complexity

---

## Requesting New Features

**Process:**

1. User submits via "Give Feedback" in Profile
2. Feedback stored in Firestore: `feedback` collection
3. Team reviews weekly
4. High-impact ideas added to roadmap
5. User notified if feature is implemented

**Feedback Collection:**

- Kind: "Idea" or "Bug"
- Text: 1000 char limit
- Metadata: Platform, app version, timestamp

---

## See Also

- [SOS Flow](sos-flow.md) - Core feature implementation
- [Voice Chat](voice-chat.md) - Implemented voice messaging
- [Profile Settings](profile-settings.md) - Feedback submission
- [Project Structure](../03-architecture/file-structure.md) - Where to add new features
