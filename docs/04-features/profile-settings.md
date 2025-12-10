# Profile & Settings Page

**Read this when:** Implementing settings features, understanding data management, working with dialogs, or integrating in-app review/feedback systems.

---

## Overview

Comprehensive settings and preferences screen providing users with complete control over app behavior, data management, and access to critical resources. Built with bioluminescent aesthetic and glass morphism design throughout.

**Route:** `/profile`
**Status:** ✅ Implemented

---

## Architecture

### State Management

**DialogContext** (`/app/src/contexts/DialogContext.tsx`)

- Stack-based dialog management for modals
- `push(dialog)`, `pop()`, `replace(dialog)` operations
- Portal rendering for proper z-index layering
- ~120 lines

**UIContext** (`/app/src/contexts/UIContext.tsx`)

- UI measurements (navbar height/bottom) for proper content spacing
- `setNavbarDimensions(height, bottom)` function
- Dynamic bottom padding calculations
- ~50 lines

**AppContext** (`/app/src/contexts/AppContext.tsx`)

- Global state for version, user profile, settings
- Extended with profile/settings support
- ~70 lines

**useSettings Hook** (`/app/src/hooks/useSettings.tsx`)

- localStorage persistence with future Firestore sync ready
- `updateSetting(key, value)` function
- Debounced sync structure (not active)
- ~50 lines

---

## Settings Sections

### 1. App Preferences Section

**Therapeutic Haptics**

- **Type:** Toggle (default: ON)
- **Description:** "Feel gentle vibrations as you interact with the app"
- **Behavior:** Light haptic test when enabled
- **Storage:** `localStorage.hapticsEnabled`
- **Analytics:** `HAPTICS_TOGGLED`

**Anonymous Analytics**

- **Type:** Toggle (default: ON)
- **Description:** "Help us improve by sharing anonymous usage data. No personal information is collected."
- **Behavior:** Respects Do Not Track browser setting
- **Storage:** `localStorage.analyticsEnabled`
- **Analytics:** `ANALYTICS_TOGGLED` (always logs, even if disabled)

**Sound Effects**

- **Type:** Toggle (default: ON)
- **Description:** "Subtle sounds for UI interactions"
- **Behavior:** UI interaction sounds throughout app
- **Storage:** `localStorage.soundEffectsEnabled`
- **Analytics:** `SOUND_EFFECTS_TOGGLED`

---

### 2. Data & Privacy Section

#### Export My Data

**Description:** "Download all your data in JSON format"

**Flow:**

1. User taps "Export My Data"
2. Function calls: `exportUserData(userId)`
3. Downloads JSON file: `anxiety-buddy-data-YYYY-MM-DD.json`
4. Toast: "Your data has been exported"

**Data Included:**

- All conversations
- All messages (text and transcriptions)
- Settings and preferences
- Session data
- Timestamps

**Implementation:** `/app/src/utils/dataManagement.ts`

```typescript
export const exportUserData = async (userId: string) => {
  const conversations = await getConversations(userId);
  const messages = await getAllMessages(userId);
  const settings = localStorage.getItem('settings');

  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    userId,
    conversations,
    messages,
    settings: JSON.parse(settings),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  downloadFile(blob, `anxiety-buddy-data-${dateString}.json`);
};
```

**Analytics:** `DATA_EXPORTED`

---

#### Clear Cache

**Description:** "Clear temporary files (audio recordings)"

**Flow:**

1. User taps "Clear Cache"
2. Show ConfirmDialog: "Clear temporary cache? This will free up storage space but won't delete your conversations."
3. If confirmed: `clearLocalStorage()`
4. Toast: "Cache cleared successfully"

**What's Cleared:**

- Temporary audio files
- Cached assets
- Local thumbnails

**What's Preserved:**

- Conversations
- Messages
- Settings
- Profile data

**Analytics:** `CACHE_CLEARED`

---

#### Delete All Data (Destructive)

**Description:** "Delete all conversations and messages"

**Flow:**

1. User taps "Delete All Data"
2. Show **destructive** ConfirmDialog with AlertTriangle icon
3. Heavy haptic warning on dialog open
4. If confirmed: `deleteAllUserData(userId)`
5. Toast: "All data has been deleted"

**What's Deleted:**

- All conversations
- All messages
- All audio files in Cloud Storage

**What's Preserved:**

- Settings (haptics, analytics, etc.)
- User account (stays signed in)

**Implementation:**

```typescript
export const deleteAllUserData = async (userId: string) => {
  // Delete Firestore data
  await deleteCollection(`users/${userId}/conversations`);

  // Delete Cloud Storage files
  await deleteStorageFolder(`audio-messages/${userId}/`);

  // Clear localStorage (except settings)
  const settings = localStorage.getItem('settings');
  localStorage.clear();
  if (settings) localStorage.setItem('settings', settings);

  toast.success('All data has been deleted');
};
```

**Analytics:** `DATA_DELETED`

---

#### Delete Account (Critical Destructive)

**Description:** "Permanently delete your account and all data"

**Flow:**

1. User taps "Delete Account"
2. Show **critical destructive** ConfirmDialog with strong warning
3. Heavy haptic feedback
4. Confirmation message: "This action cannot be undone. Your account and all data will be permanently deleted."
5. If confirmed: `deleteUserAccount()`
6. Delete auth user + all data
7. Sign out immediately
8. Reload app after 1 second

**What's Deleted:**

- Firebase Auth account
- All Firestore data
- All Cloud Storage files
- All localStorage data

**Requires:** Recent authentication (Firebase requirement)

**Implementation:**

```typescript
export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user signed in');

  // Delete all user data first
  await deleteAllUserData(user.uid);

  // Delete auth account
  await deleteUser(user);

  // Sign out and reload
  await signOut(auth);
  window.location.reload();
};
```

**Analytics:** `ACCOUNT_DELETED`

---

### 3. Support & Resources Section

#### Call Crisis Hotline

**Description:** "24/7 Mental Health Support: 988"

**Flow:**

1. User taps button
2. Heavy haptic feedback (CRITICAL ACTION)
3. **Native:** Opens `tel:988`
4. **Web:** Copies "988" to clipboard, shows toast

**Analytics:** `CRISIS_HOTLINE_CALLED`

**Localization:**

- **en-US:** 988 (Crisis Hotline), 911 (Emergency)
- **de-DE:** 0800-1110111 (Telefonseelsorge), 112 (Emergency)

**Implementation:**

```typescript
const callCrisisHotline = async () => {
  await Haptics.impact({ style: ImpactStyle.Heavy });

  if (Capacitor.isNativePlatform()) {
    window.open('tel:988', '_self');
  } else {
    await navigator.clipboard.writeText('988');
    toast.success('Crisis hotline number (988) copied to clipboard');
  }
};
```

---

#### Reset Tutorial

**Description:** "Show the tutorial again on next launch"

**Flow:**

1. User taps button
2. Set `localStorage.hasSeenOnboarding = false`
3. Toast: "Tutorial will show on next launch"

**Analytics:** `ONBOARDING_RESET`

**Note:** Tutorial/onboarding flow not yet implemented. Reset works, flow needs building.

---

#### Visit Website

**Description:** "Learn more about Anxiety Buddy"

**URL:** `https://franz.cx/p/anxiety-buddy`

**Flow:**

1. User taps button
2. Opens in new tab (`_blank`)

**Analytics:** `WEBSITE_VISITED`

---

#### Give Feedback

**Description:** "Your feedback helps us improve Anxiety Buddy for everyone. Thank you for sharing your thoughts!"

**Flow:**

1. User taps button
2. Opens FeedbackDialog (modal)
3. Segmented control: "Idea" vs "Bug"
4. Textarea with 1000 char limit
5. Submit to Firestore: `feedback` collection
6. Toast: "Thank you for your feedback!"

**Dialog Component:** `/app/src/components/features/profile/FeedbackDialog.tsx`

**Features:**

- Segmented control (bioluminescent active state)
- Multi-line textarea (5 rows)
- Character counter
- Close button at top-right edge
- Centered title
- Glass morphism styling

**Firestore Data:**

```typescript
interface Feedback {
  userId: string;
  kind: 'idea' | 'bug';
  text: string;
  timestamp: Date;
  platform: 'ios' | 'android' | 'web';
  appVersion: string;
  resolved: boolean; // Admin field
}
```

**Security Rules:**

```javascript
match /feedback/{feedbackId} {
  allow create: if request.auth != null
                && request.resource.data.userId == request.auth.uid
                && request.resource.data.text.size() <= 1000;
  allow read, update, delete: if false; // Admin only
}
```

**Analytics:** `FEEDBACK_OPENED`, `FEEDBACK_SUBMITTED`

---

#### Rate Anxiety Buddy (Native Only)

**Description:** "Let us know what you think!"

**Flow:**

1. User taps button
2. Show AppLikePromptDialog: "Are you enjoying Anxiety Buddy?"
   - **YES (Heart icon):** Request native in-app review dialog
   - **NO (Meh icon):** Show FeedbackDialog instead
3. If native review available:
   - Call `InAppReview.requestReview()`
4. If native review unavailable or fails:
   - Fallback toast: "Enjoying Anxiety Buddy? Rate us on the [App Store / Play Store]"
   - Button: "Rate on Store" → `openAppStore()`

**Platform Detection:**

- iOS: Shows native SKStoreReviewController
- Android: Shows native ReviewManager
- Web: Shows fallback toast only

**Service:** `/app/src/services/rating.service.ts`

```typescript
export const requestAppRating = async (showToastOnFallback = true) => {
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    if (showToastOnFallback) {
      showRatingToast();
    }
    return;
  }

  try {
    await InAppReview.requestReview();
  } catch (error) {
    console.error('In-app review failed:', error);
    if (showToastOnFallback) {
      setTimeout(() => showRatingToast(), 1500);
    }
  }
};

const openAppStore = () => {
  const platform = Capacitor.getPlatform();
  const url =
    platform === 'ios'
      ? 'https://apps.apple.com/app/idXXXXXXXXXX' // TODO: Replace with actual ID
      : 'https://play.google.com/store/apps/details?id=com.anxietybuddy.app';

  window.open(url, '_blank');
};
```

**Analytics Events:**

- `RATING_PROMPT_SHOWN` - Like prompt shown
- `RATING_LIKED` - User clicked "Yes"
- `RATING_DISLIKED` - User clicked "No"
- `RATING_REQUESTED` - Native review requested
- `RATING_FALLBACK_SHOWN` - Fallback toast shown
- `APP_STORE_OPENED` - User tapped "Rate on Store"

---

### 4. Legal & Information Section

#### Disclaimer (Critical for Mental Health App)

**Description:** "Important information about this app"

**Flow:**

1. User taps button (or shown on first launch)
2. Show DisclaimerDialog

**Dialog Content:**

**Title:** "Important Disclaimer"

**Icon:** AlertCircle (warm-ember)

**Text:**

```
Anxiety Buddy is NOT a substitute for professional mental health care.

This app provides:
• Immediate coping strategies
• Grounding techniques
• Supportive conversation

This app does NOT provide:
• Medical diagnosis
• Professional therapy
• Crisis intervention

If you're in crisis:
• Call 988 (Crisis Hotline)
• Call 911 (Emergency)
• Contact your therapist
• Go to nearest emergency room

For ongoing support, please consult a licensed mental health professional.
```

**Button:** "I Understand"

**Storage:** `localStorage.hasSeenDisclaimer = true`

**Component:** `/app/src/components/features/profile/DisclaimerDialog.tsx`

**Analytics:** `DISCLAIMER_VIEWED`, `DISCLAIMER_ACCEPTED`

---

#### Privacy Policy

**Description:** "How we handle your data"

**URL:** `https://franz.cx/p/anxiety-buddy/privacy`

**Flow:**

1. User taps button
2. Opens in new tab (`_blank`)

**Analytics:** `PRIVACY_POLICY_VIEWED`

---

#### Terms of Service

**Description:** "Terms and conditions"

**URL:** `https://franz.cx/p/anxiety-buddy/terms`

**Flow:**

1. User taps button
2. Opens in new tab (`_blank`)

**Analytics:** `TERMS_VIEWED`

---

#### Version Footer

**Display:** "v0.1.0" (small, subtle text at bottom)

**Source:** `AppContext.version`

**Styling:**

- Centered
- `text-mist-white/30` (very subtle)
- `text-xs` (12px)
- Bottom margin for navbar clearance

---

## Component Architecture

### Reusable UI Components

#### SettingRow

**Location:** `/app/src/components/ui/SettingRow.tsx`

**Props:**

```typescript
interface SettingRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  value?: string;
  onClick?: () => void;
  toggle?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  destructive?: boolean;
  hideChevron?: boolean;
  customRight?: React.ReactNode;
}
```

**Features:**

- Glass morphism styling with active states
- Toggle switch integration
- Chevron right indicator (hidden when toggle present)
- Destructive state (red text for dangerous actions)
- Haptic feedback on interactions
- ~100 lines

---

#### SettingSection

**Location:** `/app/src/components/ui/SettingSection.tsx`

**Props:**

```typescript
interface SettingSectionProps {
  title?: string;
  children: React.ReactNode;
}
```

**Features:**

- Glass card wrapper with `rounded-3xl` borders
- `backdrop-blur-glass` effect
- Optional title prop (section header)
- Automatic dividers between children
- ~50 lines

---

#### Toggle

**Location:** `/app/src/components/ui/Toggle.tsx`

**Props:**

```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}
```

**Design:**

- **ON state:** `bg-biolum-cyan` track with `shadow-glow-md`, dark `void-blue` thumb
- **OFF state:** `bg-mist-white/20` track with `border-mist-white/30`, white thumb
- Smooth 300ms transition with `ease-viscous`
- Thumb translates 20px right when ON
- Accessible (sr-only checkbox input)
- ~60 lines

---

#### ConfirmDialog

**Location:** `/app/src/components/ui/ConfirmDialog.tsx`

**Props:**

```typescript
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Features:**

- Title, message, confirm/cancel buttons
- Destructive variant (red confirm button with AlertTriangle icon)
- Callback-based actions
- Framer Motion animations (scale + opacity)
- Properly centered using flexbox
- Safe area support (`pt-safe`, `pb-safe`)
- High z-index (z-[9999]) to appear above navbar
- Backdrop at z-[9998] with blur effect

---

### Dialog Components

#### FeedbackDialog

**Location:** `/app/src/components/features/profile/FeedbackDialog.tsx`

**Features:**

- Segmented control: "Idea" vs "Bug"
- Multi-line textarea (5 rows, 1000 char limit)
- Character counter
- Submit to Firestore
- Bioluminescent styling
- Close button at top-right
- ~100 lines

---

#### DisclaimerDialog

**Location:** `/app/src/components/features/profile/DisclaimerDialog.tsx`

**Features:**

- AlertCircle icon (warm-ember)
- Critical mental health disclaimer
- Crisis resources list
- "I Understand" button
- Sets localStorage flag
- ~80 lines

---

#### AppLikePromptDialog

**Location:** `/app/src/components/features/profile/AppLikePromptDialog.tsx`

**Features:**

- Heart icon (Yes) vs Meh icon (No)
- Pre-rating filter (prevents negative reviews)
- onLike/onDislike callbacks
- Bioluminescent button states
- ~60 lines

---

## UIContext - Navbar Measurements

### Purpose

Provides UI measurements (navbar dimensions) to all components for proper content spacing.

### Context

**Location:** `/app/src/contexts/UIContext.tsx`

**State:**

```typescript
interface UIState {
  navbarHeight: number;
  navbarBottom: number;
  isScrolled: boolean;
  setNavbarDimensions: (height: number, bottom: number) => void;
}
```

### FloatingDock Integration

**Location:** `/app/src/components/features/navigation/FloatingDock.tsx`

```typescript
const navRef = useRef<HTMLDivElement>(null);
const { setNavbarDimensions } = useUI();

useEffect(() => {
  if (navRef.current) {
    const rect = navRef.current.getBoundingClientRect();
    const height = rect.height;
    const bottom = window.innerHeight - rect.top;
    setNavbarDimensions(height, bottom);
  }
}, []);
```

### Usage in Pages

```typescript
const { navbarBottom } = useUI();

<div
  className="bg-void-blue pt-safe flex h-full flex-col overflow-y-auto px-6"
  style={{ paddingBottom: `${navbarBottom + 32}px` }}
>
  {/* Content */}
</div>
```

---

## Internationalization (i18n)

### Setup

**Location:** `/app/src/utils/i18n.ts`

- react-i18next configuration
- Language detection: localStorage → navigator
- Fallback: en-US
- ~30 lines

### Translations

**Location:** `/app/src/assets/translations/en-US.json`

- All ProfilePage strings
- Settings labels and descriptions
- Dialog titles and messages
- Toast messages
- ~200 lines of JSON

### Usage in Components

```typescript
const { t } = useTranslation();

<SettingRow
  label={t('profile.settings.haptics')}
  description={t('profile.settings.hapticsDesc')}
/>
```

---

## Firebase Security Rules

### Firestore Rules

**Location:** `/backend/firestore.rules`

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

### Cloud Storage Rules

**Location:** `/backend/storage.rules`

```javascript
// Profile photos (future feature)
match /profile-photos/{userId}/{fileName} {
  allow write: if request.auth != null
               && request.auth.uid == userId
               && request.resource.size < 2 * 1024 * 1024  // 2MB max
               && request.resource.contentType.matches('image/.*');
  allow read: if request.auth != null && request.auth.uid == userId;
}
```

---

## TypeScript Types

**Location:** `/app/src/models/index.ts`

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

---

## Testing Checklist

### Settings Persistence

- [ ] Toggle haptics → Reload app → Verify state persists
- [ ] Toggle analytics → Reload → Verify persists
- [ ] Toggle sound effects → Reload → Verify persists

### Data Management

- [ ] Export data → Verify JSON structure and content
- [ ] Clear cache → Verify toast appears, cache cleared
- [ ] Delete all data → Verify confirmation, data deleted
- [ ] Delete account → Verify confirmation, user signed out

### Crisis Resources

- [ ] Tap 988 button → Verify phone dialer opens (native) or number copied (web)
- [ ] Verify heavy haptic feedback on tap
- [ ] Test with both en-US and de-DE languages

### Feedback System

- [ ] Open feedback dialog
- [ ] Switch between Idea/Bug
- [ ] Submit feedback → Verify Firestore document created
- [ ] Verify analytics events fire

### In-App Rating

- [ ] Tap "Rate App" (native only)
- [ ] Like → Verify native dialog attempts to show
- [ ] Dislike → Verify feedback dialog shows
- [ ] Verify fallback toast appears after 1.5s (if native fails)

### Legal & Info

- [ ] Tap Disclaimer → Verify dialog shows, content correct
- [ ] Tap Privacy Policy → Verify opens in new tab
- [ ] Tap Terms → Verify opens in new tab
- [ ] Verify version number displays correctly

### Animations & Styling

- [ ] Verify glass morphism renders correctly
- [ ] Verify bioluminescent toggle switch
- [ ] Verify smooth animations (300ms ease-viscous)
- [ ] Verify safe areas respected (notch, home indicator)

### Haptics

- [ ] Verify light haptic on all setting taps
- [ ] Verify medium haptic on success actions
- [ ] Verify heavy haptic on destructive confirmations
- [ ] Verify heavy haptic on crisis resource taps

---

## Known Limitations & Future Enhancements

### Not Implemented

- Profile photo upload (Camera API integration ready, upload logic pending)
- Crisis contacts management (data model ready)
- Firestore settings sync (debounced sync structured but not active)
- Tutorial/onboarding flow (reset works, flow needs building)

### Future Features

- Multi-language support (infrastructure ready, add translations)
- Notification preferences
- Data storage preference (local-only vs cloud sync)
- Export to PDF/CSV formats
- Share data with therapist (HIPAA-compliant export)

---

## See Also

- [i18n Guide](../05-implementation/i18n-guide.md) - Translating settings UI
- [Firebase Setup](../05-implementation/firebase.md) - Firestore rules, Cloud Storage
- [Haptics Implementation](../05-implementation/haptics.md) - Therapeutic haptic patterns
- [Safe Areas](../05-implementation/safe-areas.md) - Notch/home indicator handling
