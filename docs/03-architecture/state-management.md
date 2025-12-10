# State Management

**Read this when:** Managing state, creating contexts, building custom hooks, understanding data flow

---

## Overview

Anxiety Buddy uses **React Context API** for global state and **custom hooks** for feature-specific logic. No Redux or external state libraries - keeping it simple.

**Philosophy:** Local state first, lift to context only when truly global.

---

## State Hierarchy

```
┌─ App.tsx
│  └─ AppProvider (user, version, settings)
│     └─ UIProvider (navbar measurements)
│        └─ DialogProvider (modal stack)
│           └─ BrowserRouter
│              └─ MainLayout
│                 └─ Pages (local state)
```

**Order matters:** Providers are nested in dependency order.

---

## Global Contexts

### AppContext

**Location:** `/app/src/contexts/AppContext.tsx`

**Purpose:** Global app state (user, version, settings)

**Provided Values:**

```typescript
interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  version: string;
  isLoading: boolean;
}
```

**Usage:**

```tsx
import { useApp } from '@/contexts/AppContext';

const MyComponent = () => {
  const { user, version } = useApp();
  return <div>Version: {version}</div>;
};
```

**When to use:** Accessing user info, app version

---

### UIContext

**Location:** `/app/src/contexts/UIContext.tsx`

**Purpose:** UI measurements (navbar dimensions for proper content spacing)

**Provided Values:**

```typescript
interface UIContextType {
  navbarHeight: number;
  navbarBottom: number; // Distance from top to navbar top
  setNavbarDimensions: (height: number, bottom: number) => void;
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
}
```

**Usage:**

```tsx
import { useUI } from '@/contexts/UIContext';

const ProfilePage = () => {
  const { navbarBottom } = useUI();

  return (
    <div style={{ paddingBottom: `${navbarBottom + 32}px` }}>
      {/* Content doesn't overlap navbar */}
    </div>
  );
};
```

**How it works:**

1. FloatingDock measures its dimensions on mount/resize
2. Calls `setNavbarDimensions(height, bottomPosition)`
3. Pages use `navbarBottom` to add dynamic padding

**When to use:** Any full-height page that needs to avoid navbar overlap

---

### DialogContext

**Location:** `/app/src/contexts/DialogContext.tsx`

**Purpose:** Stack-based dialog/modal management

**Provided Values:**

```typescript
interface DialogContextType {
  dialogs: DialogConfig[];
  pushDialog: (dialog: DialogConfig) => void;
  popDialog: () => void;
  replaceDialog: (dialog: DialogConfig) => void;
  clearDialogs: () => void;
}

interface DialogConfig {
  id: string;
  component: ReactNode;
}
```

**Usage:**

```tsx
import { useDialog } from '@/contexts/DialogContext';

const SettingsPage = () => {
  const { pushDialog, popDialog } = useDialog();

  const openFeedback = () => {
    pushDialog({
      id: 'feedback',
      component: <FeedbackDialog onClose={popDialog} />,
    });
  };

  return <button onClick={openFeedback}>Give Feedback</button>;
};
```

**Features:**

- **Stack-based:** Multiple dialogs can stack on top of each other
- **Portal rendering:** Dialogs rendered outside React tree (high z-index)
- **Backdrop:** Automatic backdrop with blur effect
- **Keyboard handling:** ESC to close (future)

**When to use:** Opening modals, dialogs, overlays

---

## Custom Hooks

### useHaptics

**Location:** `/app/src/hooks/useHaptics.tsx`

**Purpose:** Wrapper for Capacitor Haptics API with settings check

**Returns:**

```typescript
{
  triggerLight: () => Promise<void>;
  triggerMedium: () => Promise<void>;
  triggerHeavy: () => Promise<void>;
  selectionStart: () => Promise<void>;
  selectionChanged: () => Promise<void>;
  selectionEnd: () => Promise<void>;
}
```

**Usage:**

```tsx
import { useHaptics } from '@/hooks/useHaptics';

const Button = () => {
  const { triggerLight } = useHaptics();

  const handleClick = async () => {
    await triggerLight();
    // Button logic
  };

  return <button onClick={handleClick}>Tap me</button>;
};
```

**Features:**

- Checks `hapticsEnabled` setting before triggering
- Gracefully handles errors (non-haptic devices)
- TypeScript typed

---

### useChat

**Location:** `/app/src/hooks/useChat.tsx`

**Purpose:** Chat state management (messages, sending, voice)

**Parameters:**

```typescript
useChat(conversationId: string)
```

**Returns:**

```typescript
{
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  sendVoiceMessage: (recordingData: RecordingData) => Promise<void>;
}
```

**Usage:**

```tsx
import { useChat } from '@/hooks/useChat';

const ChatPage = () => {
  const { messages, sendMessage, isLoading } = useChat(conversationId);

  return (
    <div>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};
```

**Features:**

- Real-time Firestore subscription (auto-updates)
- Automatic message upload (Firestore)
- Voice message handling (Cloud Storage + transcription)
- Error handling

---

### useVoiceRecorder

**Location:** `/app/src/hooks/useVoiceRecorder.tsx`

**Purpose:** Voice recording state machine

**Returns:**

```typescript
{
  isRecording: boolean;
  duration: number; // seconds
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingData | null>;
  cancelRecording: () => void;
  hasPermission: boolean;
  checkPermission: () => Promise<boolean>;
}

interface RecordingData {
  blob: Blob;
  mimeType: string;
  duration: number;
}
```

**Usage:**

```tsx
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';

const ChatInput = () => {
  const { isRecording, startRecording, stopRecording, duration } = useVoiceRecorder();

  const handleMicClick = async () => {
    if (isRecording) {
      const data = await stopRecording();
      if (data) {
        // Upload recording
      }
    } else {
      await startRecording();
    }
  };

  return (
    <button onClick={handleMicClick}>{isRecording ? `Recording ${duration}s` : 'Start'}</button>
  );
};
```

**Features:**

- Permission checking
- 60s auto-cutoff
- Haptic feedback integration
- Cross-platform (iOS/Android/Web)

**See:** [Voice Chat Feature](../04-features/voice-chat.md)

---

### useConversations

**Location:** `/app/src/hooks/useConversations.tsx`

**Purpose:** Firestore conversation queries

**Returns:**

```typescript
{
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  createConversation: () => Promise<string>; // Returns conversationId
  deleteConversation: (id: string) => Promise<void>;
}
```

**Usage:**

```tsx
import { useConversations } from '@/hooks/useConversations';

const ArchivePage = () => {
  const { conversations, isLoading } = useConversations();

  return (
    <div>
      {conversations.map((conv) => (
        <ConversationCard key={conv.id} conversation={conv} />
      ))}
    </div>
  );
};
```

**Features:**

- Real-time Firestore subscription
- Sorted by most recent first
- Includes message count, last message timestamp

---

### useSettings

**Location:** `/app/src/hooks/useSettings.tsx`

**Purpose:** LocalStorage-persisted settings

**Returns:**

```typescript
{
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: any) => void;
}

interface AppSettings {
  hapticsEnabled: boolean;
  analyticsEnabled: boolean;
  soundEffectsEnabled: boolean;
}
```

**Usage:**

```tsx
import { useSettings } from '@/hooks/useSettings';

const SettingsPage = () => {
  const { settings, updateSetting } = useSettings();

  return (
    <Toggle
      checked={settings.hapticsEnabled}
      onChange={(checked) => updateSetting('hapticsEnabled', checked)}
    />
  );
};
```

**Features:**

- Loads from localStorage on mount
- Saves to localStorage on update
- Future: Debounced Firestore sync (2s delay) - structured but not active

---

## Local State Patterns

### When to Use Local State

✅ **Use local state when:**

- State is only needed in one component
- State doesn't need to persist
- State is derived from props

**Example:**

```tsx
const ChatInput = () => {
  const [text, setText] = useState(''); // Local - only needed here

  return <input value={text} onChange={(e) => setText(e.target.value)} />;
};
```

---

### When to Lift to Context

⚠️ **Lift to context when:**

- Multiple unrelated components need the same state
- State needs to persist across route changes
- State is truly global (user, theme, etc.)

**Example:**

```tsx
// Before: Local state (bad - needed in multiple places)
const NavBar = () => {
  const [user, setUser] = useState(null);
  // ...
};

const ProfilePage = () => {
  const [user, setUser] = useState(null); // Duplicate!
  // ...
};

// After: Context (good - single source of truth)
const { user } = useApp();
```

---

## Data Flow

```
┌─────────────────────────────────────────┐
│ User Interaction                        │
│ (Button click, input change)            │
└─────────────┬───────────────────────────┘
              │
              v
┌─────────────────────────────────────────┐
│ Event Handler                           │
│ (onClick, onChange)                     │
└─────────────┬───────────────────────────┘
              │
              v
┌─────────────────────────────────────────┐
│ Hook/Context Update                     │
│ (setState, updateSetting)               │
└─────────────┬───────────────────────────┘
              │
              v
┌─────────────────────────────────────────┐
│ Re-render                               │
│ (React automatically re-renders)        │
└─────────────────────────────────────────┘
```

---

## Best Practices

### 1. Colocate State

Keep state as close to where it's used as possible.

```tsx
// ✅ GOOD: State in component that uses it
const ChatInput = () => {
  const [text, setText] = useState('');
  return <input value={text} onChange={(e) => setText(e.target.value)} />;
};

// ❌ BAD: State in parent when only child needs it
const ChatPage = () => {
  const [inputText, setInputText] = useState(''); // Unnecessary
  return <ChatInput text={inputText} onChange={setInputText} />;
};
```

---

### 2. Avoid Prop Drilling

If passing props through 3+ levels, consider context.

```tsx
// ❌ BAD: Prop drilling
<Page>
  <Section user={user}>
    <Card user={user}>
      <Profile user={user} />
    </Card>
  </Section>
</Page>;

// ✅ GOOD: Context
const { user } = useApp(); // In Profile component
```

---

### 3. Memoize Expensive Computations

```tsx
import { useMemo } from 'react';

const MessageList = ({ messages }) => {
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => a.createdAt - b.createdAt);
  }, [messages]);

  return <div>{sortedMessages.map(...)}</div>;
};
```

---

### 4. Batch State Updates

React 18 automatically batches, but be aware:

```tsx
// These are batched automatically in React 18
const handleClick = () => {
  setCount(count + 1);
  setName('Alice');
  setActive(true);
  // Only one re-render
};
```

---

## Performance Optimization

### useCallback for Functions

```tsx
import { useCallback } from 'react';

const ChatPage = () => {
  const { sendMessage } = useChat(conversationId);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  ); // Memoized

  return <ChatInput onSend={handleSend} />;
};
```

---

### React.memo for Components

```tsx
import { memo } from 'react';

const MessageBubble = memo(({ message }: { message: Message }) => {
  return <div>{message.text}</div>;
});

// Won't re-render unless message changes
```

---

## Debugging State

### React DevTools

1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Inspect component tree
4. View props, state, hooks

### Console Logging

```tsx
useEffect(() => {
  console.log('Messages updated:', messages);
}, [messages]);
```

---

## See Also

- [Tech Stack](tech-stack.md) - React, Context API
- [Project Structure](project-structure.md) - Where hooks/contexts live
- [Hooks Documentation](https://react.dev/reference/react/hooks) - Official React docs
