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
  "@capacitor/camera": "^7.0.1", // Future: Photo journaling
  "@capacitor/filesystem": "^7.0.1" // Future: Local data persistence
}
```

### UI Components

- **Icons:** `lucide-react` (Consistent, minimal icon set)
- **Utilities:** `clsx`, `tailwind-merge` (Conditional styling)

### Backend (Future)

- **Platform:** Firebase (Firestore, Auth, Functions)
- **Offline-First:** Dexie (IndexedDB wrapper for local data)

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

- [ ] None yet (greenfield)

### 🚧 In Progress

- [ ] Base Layout (MainLayout + FloatingDock)
- [ ] SOS Flow (7-step state machine)
- [ ] Haptics integration

### 📋 Planned

- [ ] Home screen with quick access
- [ ] Vault (session history, journal entries)
- [ ] Profile (settings, preferences, crisis contacts)
- [ ] Offline-first data sync
- [ ] Firebase Auth integration
- [ ] Pink noise audio playback
- [ ] Photo journaling

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

```tsx
// All screens must respect safe areas
<div className="bg-void-blue safe-area-top safe-area-bottom h-screen w-full">{/* Content */}</div>
```

### Prevent Overscroll Bounce (iOS)

```css
/* Already in index.css */
html,
body {
  overscroll-behavior: none;
}
```

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
