# Anxiety Buddy (Project Anchor)

> 🧭 A therapeutic mobile app for Gen Z providing immediate relief during anxiety and panic attacks

**Stage:** Active Development
**Platform:** iOS, Android, Web (Capacitor 7.0)
**Backend:** Firebase + Google Cloud Platform

---

## 🎯 Overview

Anxiety Buddy is a mental health companion app designed specifically for Gen Z (18-26 years old) experiencing anxiety and panic attacks. Unlike traditional wellness apps with gamification, this is a **therapeutic interface** where every pixel, animation, and interaction is designed to ground and de-escalate panic.

### Core Philosophy

> **The Interface IS the Therapy**

- Evidence-based: Built on CBT (Cognitive Behavioral Therapy) + Somatic Grounding
- Mobile-first: Native iOS/Android with Capacitor (feels native, not web-wrapped)
- Therapeutic UX: Viscous animations, haptic feedback, minimal text
- Safety-first: Crisis keyword detection + immediate resource access

---

## ✨ Features

### ✅ Implemented

#### 🎤 Voice Chat

- **WhatsApp-style voice messaging** for users who find typing difficult during anxiety
- Click-to-record (60s max), automatic transcription via Google Cloud Speech-to-Text
- **Server-side audio conversion:** AAC/MP4 (Android/iOS) → LINEAR16 WAV for compatibility
- Transcribed text flows through AI for therapeutic response
- ~$0.036/minute ($180/month for 1000 users with 10 msgs/month)

#### 🤖 AI Chat

- **Gemini 2.5 Flash** powered therapeutic conversations
- CBT and ACT techniques integrated into responses
- Context-aware (remembers last 10 messages)
- Crisis keyword detection with automatic resource provision

#### 🆘 Crisis Detection

- Real-time keyword monitoring (self-harm, suicidal ideation)
- Immediate crisis resources (988 Suicide & Crisis Lifeline, Crisis Text Line)
- Works for both text and voice messages

#### 📱 Therapeutic Haptics

- Selection start/changed/end patterns during recording
- Light/medium/heavy impact for different interactions
- Integrated throughout the app for grounding effect

### 🚧 In Progress

- SOS Flow: 7-step panic de-escalation (breath work, grounding exercises)
- Main navigation layout with floating dock

### 📋 Planned

- Session history vault with journaling
- Profile settings with crisis contacts
- Offline-first data sync
- Pink noise audio playback
- Photo journaling

---

## 🛠️ Technology Stack

### Frontend

- **React 18** + **TypeScript 5.7** (Strict mode, functional components)
- **Vite 6.0** (Fast HMR, optimized builds)
- **Tailwind CSS 3.4** (Custom therapeutic design system)
- **Capacitor 7.0** (Native iOS/Android runtime)
- **Framer Motion** (Viscous animations, 600ms+ durations)
- **Firebase SDK** (Firestore, Auth, Storage)

### Backend

- **Firebase Functions** (Node.js 20, TypeScript)
- **Google Cloud Speech-to-Text API** (v2, `latest_long` model)
- **Google Vertex AI** (Gemini 2.5 Flash)
- **Firebase Cloud Storage** (Audio file hosting)
- **Firestore** (Real-time message sync)
- **FFmpeg** (Server-side audio conversion: AAC/MP4 → LINEAR16 WAV for Android/iOS compatibility)

### Key Dependencies

```json
{
  "capacitor-voice-recorder": "^7.0.6",
  "@capacitor/haptics": "^7.0.0",
  "firebase": "^12.6.0",
  "framer-motion": "^12.23.25",
  "lucide-react": "^0.554.0",
  "react-router-dom": "^7.9.4"
}
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm 9+
- **Firebase CLI:** `npm install -g firebase-tools`
- **For iOS:** Xcode 14+ (macOS only)
- **For Android:** Android Studio
- **GCP Project** with Speech-to-Text API enabled

### Installation

```bash
# Clone repository
cd anxiety-buddy

# Install dependencies
npm install              # Root
cd app && npm install    # Frontend
cd ../backend/functions && npm install  # Backend
```

### Environment Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Create new project (or use existing)
   - Enable Authentication, Firestore, Cloud Storage, Functions

2. **Enable GCP APIs**
   - Cloud Speech-to-Text API
   - Vertex AI API (for Gemini)
   - Cloud Storage API

3. **Configure IAM**
   - Grant Cloud Functions service account the **Cloud Speech Client** role:

   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:YOUR_PROJECT_ID@appspot.gserviceaccount.com" \
     --role="roles/speech.client"
   ```

4. **Set Environment Variables**

   ```bash
   cp app/.env.example app/.env
   # Add your Firebase credentials to app/.env
   ```

5. **Deploy Backend**
   ```bash
   cd backend
   firebase use --add  # Select your Firebase project
   npm run build
   firebase deploy --only functions,storage
   ```

### Development

**Web Development:**

```bash
cd app
npm run dev
# Visit http://localhost:5173
```

**iOS:**

```bash
cd app
npm run build
npx cap sync
npx cap open ios
# Run from Xcode
```

**Android:**

```bash
cd app
npm run build
npx cap sync
npx cap open android
# Run from Android Studio
```

**Backend (Local Emulator):**

```bash
cd backend
firebase emulators:start
```

---

## 🎨 Design System

### Aesthetic: "Bioluminescence in the Deep"

The app mimics the deep ocean at night—calming darkness punctuated by gentle glowing life forms.

**Color Palette:**

- `void-blue` (#0A1128) - Main background
- `biolum-cyan` (#64FFDA) - Primary accent glow
- `warm-ember` (#FFB38A) - Warm hope accent
- `mist-white` (#E2E8F0) - Text

**Animation Philosophy:**

- **Viscous, never snappy** (600ms+ durations)
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Deliberate, calming motion
- Glass morphism with 12px backdrop blur

**Typography:**

- Font: Inter, SF Pro Display, system-ui
- Minimal text (5 words or less for instructions)
- Large, readable sizes for panic state users

See `CLAUDE.md` for complete design tokens and guidelines.

---

## 📁 Project Structure

```
anxiety-buddy/
├── app/                      # Mobile app (React + Capacitor)
│   ├── src/
│   │   ├── pages/            # Top-level screens
│   │   ├── components/       # UI components
│   │   │   ├── ui/           # Atomic, reusable components
│   │   │   └── features/     # Feature-specific components
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useVoiceRecorder.tsx
│   │   │   ├── useChat.tsx
│   │   │   └── useHaptics.tsx
│   │   ├── services/         # External integrations
│   │   │   └── firebase.service.ts
│   │   ├── models/           # TypeScript types
│   │   └── utils/            # Helper functions
│   ├── native/               # iOS & Android projects
│   └── capacitor.config.ts
│
├── backend/                  # Firebase Functions
│   ├── functions/src/
│   │   ├── chat.ts           # AI chat responses (Gemini)
│   │   ├── transcription.ts  # Speech-to-Text
│   │   └── index.ts
│   ├── storage.rules         # Cloud Storage security
│   └── firebase.json
│
├── CLAUDE.md                 # Complete technical documentation
└── README.md                 # This file
```

---

## 🔒 Security & Privacy

### Data Protection

- **User-scoped access:** Users can only access their own data
- **Audio retention:** Voice recordings auto-delete after 7 days
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **No PHI collection:** Minimized data collection for privacy

### Permissions Required

- **iOS:** Microphone (`NSMicrophoneUsageDescription` in Info.plist)
- **Android:** `RECORD_AUDIO` permission

### Firebase Security Rules

- Firestore: User-scoped read/write
- Storage: Max 5MB, audio files only, user-scoped

---

## 💰 Cost Estimate

### Monthly Cost (1000 Active Users)

| Service         | Usage                                       | Cost            |
| --------------- | ------------------------------------------- | --------------- |
| Speech-to-Text  | 5,000 mins (10 msgs × 0.5 min × 1000 users) | $180            |
| Cloud Storage   | ~1GB (7-day retention)                      | <$1             |
| Cloud Functions | Included in Firebase                        | $0              |
| Firestore       | Light usage                                 | ~$10            |
| **Total**       |                                             | **~$191/month** |

**Per user:** $0.19/month

### Cost Optimization

- 60-second max recording duration
- 7-day audio retention policy
- Rate limiting (20 voice messages/user/day)
- Future: On-device transcription (iOS Speech Framework) - FREE

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Voice recording with mic permission
- [ ] Transcription accuracy
- [ ] AI response quality
- [ ] Crisis keyword detection (text + voice)
- [ ] Haptic feedback patterns
- [ ] Offline behavior
- [ ] iOS and Android compatibility

### Run Tests

```bash
cd app
npm test              # Run Vitest tests
npm run test:coverage # Coverage report
```

---

## 📚 Documentation

- **CLAUDE.md** - Complete technical documentation for AI assistants
- **Voice Chat Flow** - See CLAUDE.md § Voice Chat Feature
- **Design System** - See CLAUDE.md § Design Tokens
- **SOS Flow** - See CLAUDE.md § The SOS Flow

---

## 🚢 Deployment

### Mobile Apps

**iOS:**

```bash
cd app
npm run build
npx cap sync ios
npx cap open ios
# In Xcode: Product → Archive → Distribute to App Store
```

**Android:**

```bash
cd app
npm run build
npx cap sync android
npx cap open android
# In Android Studio: Build → Generate Signed Bundle/APK
```

### Backend

```bash
cd backend
firebase deploy --only functions,storage
```

---

## ⚠️ Troubleshooting

### Voice Recording Not Working

- Check microphone permissions in device settings
- Verify `capacitor-voice-recorder` is installed
- Test on real device (simulator has limited mic support)

### Transcription Failing

- Verify Speech-to-Text API is enabled in GCP Console
- Check IAM: Service account needs Cloud Speech Client role
- Review Cloud Function logs in Firebase Console
- **Android/iOS 0% confidence:** Ensure `fluent-ffmpeg` and `@ffmpeg-installer/ffmpeg` are installed in backend/functions
  - These dependencies enable server-side audio conversion (AAC/MP4 → LINEAR16 WAV)
  - Without them, Android/iOS recordings will fail to transcribe

### Build Errors

```bash
npm run clean  # Remove node_modules and rebuild
npm install
```

### iOS Issues

- Ensure Xcode Command Line Tools: `xcode-select --install`
- Check `Info.plist` has `NSMicrophoneUsageDescription`

### Android Issues

- Verify `ANDROID_HOME` environment variable
- Check `AndroidManifest.xml` has `RECORD_AUDIO` permission

---

## 🤝 Contributing

This is a mental health application. Please be mindful of:

- **Clinical accuracy:** Ensure therapeutic approaches are evidence-based
- **Safety-first:** Crisis detection must be robust
- **Accessibility:** Design for cognitive overload states
- **Privacy:** Minimize data collection, maximize user control

---

## 📄 License

**Internal Project** - Not for public distribution without permission.

---

## 📞 Resources

### Crisis Support

- **988 Suicide & Crisis Lifeline:** Call or text 988 (24/7)
- **Crisis Text Line:** Text HOME to 741741
- **International:** findahelpline.com

### Technical Resources

- [Capacitor Docs](https://capacitorjs.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text)
- [Vertex AI (Gemini)](https://cloud.google.com/vertex-ai)

---

**Last Updated:** December 9, 2024
**Version:** 0.2.0 (Voice Chat Release)

---

_Built with care for those navigating anxiety. You matter. You're not alone._ 💙
