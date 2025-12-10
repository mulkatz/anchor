# Project Structure

**Read this when:** Creating new files, organizing code, refactoring, understanding codebase layout

---

## Repository Structure

```
anxiety-buddy/
├── CLAUDE.md                 # AI assistant navigation hub
├── README.md                 # User documentation
├── package.json              # Root workspace config
├── docs/                     # Modular documentation
│
├── app/                      # Mobile app (React + Capacitor)
│   ├── src/                  # Source code
│   ├── public/               # Static assets
│   ├── native/               # Native iOS/Android projects
│   ├── capacitor.config.ts   # Capacitor configuration
│   ├── tailwind.config.ts    # Design system tokens
│   ├── vite.config.ts        # Build configuration
│   ├── tsconfig.json         # TypeScript config
│   └── package.json          # Frontend dependencies
│
└── backend/                  # Firebase Functions
    ├── functions/            # Cloud Functions code
    ├── firestore.rules       # Database security rules
    ├── storage.rules         # Storage security rules
    ├── firebase.json         # Firebase configuration
    └── .firebaserc           # Firebase project aliases
```

---

## App Source Structure

```
app/src/
├── main.tsx                  # App entry point
├── index.css                 # Global styles (Tailwind imports)
│
├── pages/                    # Top-level screens (routes)
│   ├── App.tsx               # Root component with Router
│   ├── HomePage.tsx          # Landing screen
│   ├── ChatPage.tsx          # AI chat interface
│   ├── ArchivePage.tsx       # Conversation history
│   ├── ProfilePage.tsx       # Settings, preferences
│   └── SOSPage.tsx           # Panic de-escalation flow (future)
│
├── components/               # React components
│   ├── layouts/              # Layout wrappers
│   │   └── MainLayout.tsx    # Shell with floating nav
│   │
│   ├── ui/                   # Atomic/reusable UI components
│   │   ├── Button.tsx
│   │   ├── GlassCard.tsx
│   │   ├── PulseOrb.tsx
│   │   ├── Toggle.tsx
│   │   ├── SettingRow.tsx
│   │   ├── SettingSection.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ...
│   │
│   ├── features/             # Feature-specific components
│   │   ├── navigation/
│   │   │   └── FloatingDock.tsx     # Bottom nav bar
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatInput.tsx        # Message/voice input
│   │   │   ├── UserMessage.tsx      # User message bubble
│   │   │   ├── AssistantMessage.tsx # AI response bubble
│   │   │   ├── AudioMessageBubble.tsx # Voice transcription UI
│   │   │   ├── CrisisCard.tsx       # Crisis resource card
│   │   │   └── MessageList.tsx      # Scrollable messages
│   │   │
│   │   ├── archive/
│   │   │   ├── ConversationCard.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── FeedbackDialog.tsx
│   │   │   ├── DisclaimerDialog.tsx
│   │   │   └── AppLikePromptDialog.tsx
│   │   │
│   │   └── sos/                     # Future: SOS flow components
│   │       ├── SOSSession.tsx       # State machine
│   │       ├── BreachScreen.tsx     # Step 1: Trigger
│   │       ├── AcknowledgeScreen.tsx # Step 2: "I've got you"
│   │       ├── GroundingSight.tsx   # Step 3: Tap 5 things
│   │       ├── GroundingTouch.tsx   # Step 4: Tactile scrub
│   │       ├── GroundingSound.tsx   # Step 5: Pink noise
│   │       ├── ExitBreath.tsx       # Step 6: 4-7-8 breathing
│   │       └── CompletionScreen.tsx # Step 7: Success
│   │
│   └── index.ts              # Component exports (optional)
│
├── hooks/                    # Custom React hooks
│   ├── useHaptics.tsx        # Wrapper for Capacitor Haptics
│   ├── useChat.tsx           # Chat state management
│   ├── useVoiceRecorder.tsx  # Voice recording logic
│   ├── useConversations.tsx  # Firestore conversation queries
│   ├── useSettings.tsx       # Settings persistence
│   └── useSOSSession.tsx     # Future: SOS state machine
│
├── contexts/                 # React Context providers
│   ├── AppContext.tsx        # Global app state (version, user, settings)
│   ├── UIContext.tsx         # UI measurements (navbar dimensions)
│   └── DialogContext.tsx     # Modal/dialog stack management
│
├── services/                 # External integrations
│   ├── firebase.service.ts   # Firebase initialization
│   ├── analytics.service.ts  # Event tracking
│   ├── rating.service.ts     # In-app review
│   └── api.ts                # Future: API client
│
├── utils/                    # Pure helper functions
│   ├── cn.ts                 # Tailwind class merger (clsx + twMerge)
│   ├── logger.ts             # Console logging wrapper
│   ├── i18n.ts               # Internationalization setup
│   ├── dataManagement.ts     # Export/delete data utilities
│   ├── crisisHotlines.ts     # Language-specific crisis resources
│   ├── formatTime.ts         # Relative time formatting
│   └── ...
│
├── models/                   # TypeScript types & interfaces
│   └── index.ts              # All type definitions
│
└── assets/                   # Static assets
    ├── icons/                # App icons, logo
    ├── sounds/               # Future: Pink noise, ambient sounds
    └── translations/         # i18n translation files
        ├── en-US.json        # English translations
        └── de-DE.json        # German translations
```

---

## File Naming Conventions

### Components

- **PascalCase:** `ComponentName.tsx`
- **Examples:** `Button.tsx`, `ChatInput.tsx`, `FloatingDock.tsx`

### Hooks

- **camelCase with `use` prefix:** `useSomething.tsx`
- **Examples:** `useHaptics.tsx`, `useChat.tsx`

### Contexts

- **PascalCase with `Context` suffix:** `SomethingContext.tsx`
- **Examples:** `AppContext.tsx`, `DialogContext.tsx`

### Services

- **camelCase with `.service.ts` suffix:** `something.service.ts`
- **Examples:** `firebase.service.ts`, `analytics.service.ts`

### Utils

- **camelCase:** `utilityName.ts`
- **Examples:** `cn.ts`, `logger.ts`, `formatTime.ts`

### Types

- **Single file:** `index.ts` in `/models` directory
- **Export interfaces:** All types exported from this one file

---

## Where to Place New Code

### New Page/Screen

**Location:** `/app/src/pages/`
**File name:** `PageName.tsx` (e.g., `VaultPage.tsx`)
**Routing:** Add route to `/app/src/pages/App.tsx`

**Example:**

```tsx
// app/src/pages/VaultPage.tsx
export const VaultPage: FC = () => {
  return <div>Vault content</div>;
};

// Add route in App.tsx
<Route path="/vault" element={<VaultPage />} />;
```

---

### Reusable UI Component

**Location:** `/app/src/components/ui/`
**File name:** `ComponentName.tsx`

**Characteristics:**

- No business logic
- Accepts props
- Reusable across features
- Purely presentational

**Examples:** Button, Card, Toggle, Input

---

### Feature-Specific Component

**Location:** `/app/src/components/features/{featureName}/`
**File name:** `ComponentName.tsx`

**Characteristics:**

- Contains business logic
- Specific to one feature
- May use hooks/contexts

**Examples:** ChatInput, AudioMessageBubble, ConversationCard

---

### Custom Hook

**Location:** `/app/src/hooks/`
**File name:** `useSomething.tsx`

**Characteristics:**

- Starts with `use` prefix
- Returns state and/or functions
- Encapsulates reusable logic

**Example:**

```tsx
// app/src/hooks/useHaptics.tsx
export const useHaptics = () => {
  const triggerLight = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
  };

  return { triggerLight, triggerMedium, triggerHeavy };
};
```

---

### Context Provider

**Location:** `/app/src/contexts/`
**File name:** `SomethingContext.tsx`

**Characteristics:**

- Global state
- Used by multiple components
- Provides value to descendants

**Example:**

```tsx
// app/src/contexts/AppContext.tsx
export const AppContext = createContext<AppContextType>({});

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return <AppContext.Provider value={{ user, setUser }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
```

---

### Service (External Integration)

**Location:** `/app/src/services/`
**File name:** `something.service.ts`

**Characteristics:**

- Interfaces with external APIs
- Pure functions (no React hooks)
- Exported functions

**Example:**

```typescript
// app/src/services/analytics.service.ts
export const logAnalyticsEvent = (event: AnalyticsEvent) => {
  if (!getAnalyticsEnabled()) return;
  console.log('Analytics:', event);
};
```

---

### Utility Function

**Location:** `/app/src/utils/`
**File name:** `utilityName.ts`

**Characteristics:**

- Pure functions (no side effects)
- No React hooks
- No external API calls
- Testable

**Example:**

```typescript
// app/src/utils/formatTime.ts
export const formatRelativeTime = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  // ...
};
```

---

### TypeScript Type/Interface

**Location:** `/app/src/models/index.ts` (single file)
**Naming:** PascalCase

**Example:**

```typescript
// app/src/models/index.ts
export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  text: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: Timestamp;
  hasAudio?: boolean;
  audioPath?: string;
  transcriptionStatus?: 'pending' | 'completed' | 'failed';
}
```

---

## Import/Export Patterns

### Named Exports (Preferred)

```tsx
// ✅ GOOD: Named export
export const Button: FC<ButtonProps> = ({ children }) => {
  return <button>{children}</button>;
};

// Import
import { Button } from '@/components/ui/Button';
```

### Default Exports (Pages Only)

```tsx
// ✅ OK for pages
export default function HomePage() {
  return <div>Home</div>;
}

// Import
import HomePage from '@/pages/HomePage';
```

### Barrel Exports (Optional)

```typescript
// app/src/components/index.ts
export { Button } from './ui/Button';
export { GlassCard } from './ui/GlassCard';
export { ChatInput } from './features/chat/ChatInput';

// Import from barrel
import { Button, GlassCard } from '@/components';
```

**Note:** We don't currently use barrel exports, but they're an option for future refactoring.

---

## Import Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage:**

```tsx
// Instead of:
import { Button } from '../../../components/ui/Button';

// Use:
import { Button } from '@/components/ui/Button';
```

---

## Backend Structure

```
backend/
├── functions/
│   ├── src/
│   │   ├── index.ts           # Function exports
│   │   ├── transcription.ts   # Speech-to-Text function
│   │   ├── chat.ts            # AI response function
│   │   └── utils/             # Shared backend utilities
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # Backend TypeScript config
│
├── firestore.rules            # Database security rules
├── storage.rules              # Storage security rules
├── firebase.json              # Firebase configuration
└── .firebaserc                # Firebase project aliases
```

---

## Configuration Files

### Capacitor: `app/capacitor.config.ts`

- App ID, name
- iOS/Android native projects
- Plugin configuration

### Tailwind: `app/tailwind.config.ts`

- Design tokens (colors, fonts, spacing)
- Custom utilities
- Plugins

**See:** [Design System](../02-design-system/README.md)

### Vite: `app/vite.config.ts`

- Dev server configuration
- Build optimization
- Plugin setup (React, PWA)

### TypeScript: `app/tsconfig.json`

- Compiler options
- Path aliases (@/\*)
- Strict mode enabled

---

## Native Projects

### iOS: `app/native/ios/`

**Generated by:** `npx cap add ios`
**Modified:** Native code, permissions (Info.plist)

**Key files:**

- `App/App/Info.plist` - Permissions, app info
- `App.xcodeproj` - Xcode project

### Android: `app/native/android/`

**Generated by:** `npx cap add android`
**Modified:** Native code, permissions (AndroidManifest.xml)

**Key files:**

- `app/src/main/AndroidManifest.xml` - Permissions
- `app/build.gradle` - Build configuration

---

## See Also

- [Tech Stack](tech-stack.md) - Technologies and dependencies
- [State Management](state-management.md) - Context patterns
- [Getting Started](../06-development/getting-started.md) - Setup instructions
