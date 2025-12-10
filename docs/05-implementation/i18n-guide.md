# Internationalization (i18n) Guide - CRITICAL

**Read this when:** Implementing any user-facing feature, adding new text to the UI, troubleshooting translation issues, or adding a new language.

---

## ⚠️ ABSOLUTE RULE: NEVER Hardcode User-Facing Strings

**ALL user-facing text MUST use i18n translation keys. Hardcoded strings are STRICTLY FORBIDDEN.**

### Why This Matters

- Anxiety Buddy supports multiple languages (currently English and German)
- Users expect 100% coverage in their language
- Hardcoded strings break the localized experience
- Every new feature must work in all supported languages
- Mental health content is culturally sensitive - proper localization is critical

---

## Current Languages

### English (en-US)

- **Status:** Primary language
- **Coverage:** 100%
- **Tone:** Warm, empathetic, Gen Z-friendly
- **File:** `/app/src/assets/translations/en-US.json`

### German (de-DE)

- **Status:** Secondary language
- **Coverage:** 100% required
- **Tone:** Informal 'du' (NOT formal 'Sie')
- **Target Audience:** Gen Z German speakers
- **File:** `/app/src/assets/translations/de-DE.json`

---

## Usage in Components

### React Components

```typescript
import { useTranslation } from 'react-i18next';

export const MyComponent: FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('namespace.key')}</h1>
      <p>{t('namespace.description')}</p>
      <button>{t('namespace.buttonLabel')}</button>
    </div>
  );
};
```

### Example: ProfilePage

```typescript
import { useTranslation } from 'react-i18next';

export const ProfilePage: FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('profile.title')}</h1>

      <SettingRow
        icon={Zap}
        label={t('profile.settings.haptics')}
        description={t('profile.settings.hapticsDesc')}
      />

      <button onClick={handleExport}>
        {t('profile.data.export')}
      </button>
    </div>
  );
};
```

---

## Usage in Hooks & Utilities

### Option 1: Import i18next Directly (Recommended)

Use this for non-React contexts like utility functions or hook internals.

```typescript
import i18next from 'i18next';

export const myUtility = () => {
  const errorMessage = i18next.t('errors.myError');
  setError(errorMessage);

  toast.error(i18next.t('toasts.operationFailed'));
};
```

### Option 2: Pass t Function as Parameter

Use this when the hook is called from a React component.

```typescript
import type { TFunction } from 'i18next';

export const useMyHook = ({ t }: { t: TFunction }) => {
  const handleError = () => {
    setError(t('errors.myError'));
  };
};

// Usage in component
const MyComponent = () => {
  const { t } = useTranslation();
  const { handleError } = useMyHook({ t });
};
```

---

## Translation Files

### File Locations

- **English:** `/app/src/assets/translations/en-US.json`
- **German:** `/app/src/assets/translations/de-DE.json`

### File Structure (Namespaces)

```json
{
  "home": {
    "title": "Home",
    "startSession": "Start Session",
    "quickAccess": "Quick Access"
  },
  "vault": {
    "title": "Vault",
    "noSessions": "No saved sessions yet"
  },
  "sos": {
    "breach": {
      "title": "Hold for help",
      "instruction": "Press and hold the button"
    },
    "acknowledge": {
      "message": "I've got you.",
      "subtext": "You're safe. Let's work through this together."
    }
  },
  "crisis": {
    "hotline": "988 - Crisis Hotline",
    "emergency": "911 - Emergency",
    "disclaimer": "If you're in immediate danger, call 911"
  },
  "chat": {
    "inputPlaceholder": "Type a message...",
    "sending": "Sending...",
    "aiTyping": "Anxiety Buddy is typing..."
  },
  "archive": {
    "title": "Conversation Archive",
    "deleteConfirm": "Delete this conversation?"
  },
  "audio": {
    "transcribing": "Transcribing your message...",
    "transcribed": "Transcribed",
    "failed": "Transcription failed"
  },
  "time": {
    "justNow": "Just now",
    "minutesAgo_one": "{{count}} min ago",
    "minutesAgo_other": "{{count}} mins ago",
    "hoursAgo_one": "{{count}} hour ago",
    "hoursAgo_other": "{{count}} hours ago"
  },
  "navigation": {
    "home": "Home",
    "sos": "SOS",
    "vault": "Vault",
    "profile": "Profile"
  },
  "errors": {
    "chatLoadFailed": "Failed to load chat. Please try again.",
    "voicePermissionDenied": "Microphone access required. Enable in Settings?",
    "uploadFailed": "Connection issue. Retrying...",
    "archiveLoadFailed": "Failed to load conversations"
  },
  "toasts": {
    "settingsSaved": "Settings saved",
    "dataExported": "Your data has been exported",
    "cacheCleared": "Cache cleared successfully",
    "feedbackSubmitted": "Thank you for your feedback!"
  },
  "profile": {
    "title": "Profile",
    "settings": {
      "haptics": "Therapeutic Haptics",
      "hapticsDesc": "Feel gentle vibrations as you interact",
      "analytics": "Anonymous Analytics",
      "analyticsDesc": "Help us improve (no personal data collected)"
    },
    "data": {
      "export": "Export My Data",
      "exportDesc": "Download all your data in JSON format",
      "clearCache": "Clear Cache",
      "deleteAll": "Delete All Data",
      "deleteAccount": "Delete Account"
    }
  },
  "general": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "delete": "Delete",
    "save": "Save",
    "close": "Close",
    "loading": "Loading..."
  }
}
```

---

## Namespace Organization

### Guidelines

- **home** - Home page content
- **vault** - Vault/archive page content
- **sos** - SOS flow (7-step panic de-escalation)
- **crisis** - Crisis resources and hotlines
- **chat** - Chat interface and messages
- **archive** - Conversation archive
- **audio** - Voice message states
- **time** - Relative time formatting
- **navigation** - Navigation labels
- **errors** - Error messages (organized by feature)
- **toasts** - Toast notifications
- **profile** - Profile/settings page
- **general** - Shared UI text (buttons, actions, states)

---

## Before Committing Code

### MANDATORY CHECKLIST

#### 1. Search for Hardcoded Strings

Run these commands to detect hardcoded user-facing strings:

```bash
# Search components
grep -r '"[A-Z]' app/src/components --include="*.tsx" | grep -v "import\|export\|const\|type\|interface"

# Search hooks
grep -r '"[A-Z]' app/src/hooks --include="*.tsx" | grep -v "import\|export\|const\|type"

# Search pages
grep -r '"[A-Z]' app/src/pages --include="*.tsx" | grep -v "import\|export\|const\|type"
```

**Review results:** Any user-facing text MUST be moved to translation files.

---

#### 2. Verify Translation Function Usage

**Components must use:**

```typescript
const { t } = useTranslation();
```

**Hooks/utils must use:**

```typescript
import i18next from 'i18next';
// OR
import type { TFunction } from 'i18next';
```

---

#### 3. Test in Both Languages

**Manual Testing Flow:**

```bash
# 1. Start app
npm run dev

# 2. Navigate to Profile → Settings → Language
# 3. Switch to German (de-DE)

# 4. Navigate through all pages:
#    - Home
#    - SOS Flow (all 7 steps)
#    - Chat (send message, test voice, check crisis card)
#    - Vault
#    - Profile

# 5. Check for:
#    - Missing translations (English fallback)
#    - Layout breaks (German text is ~30% longer)
#    - Proper pluralization
#    - Crisis hotlines are German-specific (0800-1110111, not 988)
```

---

#### 4. Ensure 100% German Coverage

**Every English key must have a German translation.**

**Check for missing keys:**

```bash
# Run this script (or create one) to compare keys
node scripts/check-translation-coverage.js
```

**Example script:**

```javascript
const enUS = require('./app/src/assets/translations/en-US.json');
const deDE = require('./app/src/assets/translations/de-DE.json');

function compareKeys(obj1, obj2, path = '') {
  const keys1 = Object.keys(obj1);

  keys1.forEach((key) => {
    const newPath = path ? `${path}.${key}` : key;

    if (typeof obj1[key] === 'object' && obj1[key] !== null) {
      if (!obj2[key]) {
        console.error(`Missing in de-DE: ${newPath}`);
      } else {
        compareKeys(obj1[key], obj2[key], newPath);
      }
    } else {
      if (!obj2[key]) {
        console.error(`Missing in de-DE: ${newPath}`);
      }
    }
  });
}

compareKeys(enUS, deDE);
```

---

## Special Cases

### Pluralization

i18next automatically handles plural forms based on count.

**Translation Keys:**

```json
{
  "time": {
    "minutesAgo_one": "{{count}} min ago",
    "minutesAgo_other": "{{count}} mins ago",
    "hoursAgo_one": "{{count}} hour ago",
    "hoursAgo_other": "{{count}} hours ago"
  }
}
```

**Usage:**

```typescript
t('time.minutesAgo', { count: 1 }); // "1 min ago"
t('time.minutesAgo', { count: 5 }); // "5 mins ago"
t('time.hoursAgo', { count: 1 }); // "1 hour ago"
t('time.hoursAgo', { count: 24 }); // "24 hours ago"
```

**German Pluralization:**

```json
{
  "time": {
    "minutesAgo_one": "vor {{count}} Minute",
    "minutesAgo_other": "vor {{count}} Minuten"
  }
}
```

---

### Interpolation

Inject dynamic values into translations.

**Translation Key:**

```json
{
  "sos": {
    "exitBreath": {
      "cycleProgress": "Cycle {{current}} of {{total}}"
    }
  }
}
```

**Usage:**

```typescript
t('sos.exitBreath.cycleProgress', { current: 2, total: 3 });
// English: "Cycle 2 of 3"
// German: "Zyklus 2 von 3"
```

---

### Dynamic Language Switching

Change language at runtime (e.g., in Settings).

```typescript
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language; // 'en-US' or 'de-DE'

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <select value={currentLanguage} onChange={e => changeLanguage(e.target.value)}>
      <option value="en-US">English</option>
      <option value="de-DE">Deutsch</option>
    </select>
  );
};
```

---

### Context-Specific Translations

Sometimes the same word has different meanings in different contexts.

**Translation Keys:**

```json
{
  "navigation": {
    "home": "Home"
  },
  "actions": {
    "goHome": "Go Home"
  },
  "location": {
    "atHome": "at home"
  }
}
```

**Usage:**

```typescript
<NavButton>{t('navigation.home')}</NavButton>
<Button>{t('actions.goHome')}</Button>
<p>You are {t('location.atHome')}</p>
```

---

## What NOT To Translate

### ✅ DO Translate

- Button labels
- Page titles and headings
- Instructions and prompts
- Error messages
- Toast notifications
- Placeholder text
- Aria labels (for accessibility)
- Alt text for images
- Dialog content
- Help text

### ❌ DO NOT Translate

- Variable names
- Function names
- CSS classes
- Firebase collection names
- API keys
- Import/export statements
- Type names
- Console logs (debugging only)
- Code comments (use English for consistency)
- File paths
- URLs (unless localized pages exist)

---

## Common Mistakes

### ❌ WRONG

```typescript
// Hardcoded string
<button>Start Session</button>

// Hardcoded error message
setError('Failed to load data');

// Hardcoded toast
toast.success('Settings saved');

// Mixed hardcoded and translated
<div>
  <h1>{t('profile.title')}</h1>
  <p>Your profile settings</p>  {/* ❌ Hardcoded */}
</div>
```

### ✅ CORRECT

```typescript
// All text translated
<button>{t('home.startSession')}</button>

// Error message from i18next
setError(i18next.t('errors.loadFailed'));

// Toast from i18next
toast.success(i18next.t('toasts.settingsSaved'));

// All text translated
<div>
  <h1>{t('profile.title')}</h1>
  <p>{t('profile.description')}</p>
</div>
```

---

## Crisis Resources Localization

Crisis hotlines are **language-specific** and **critical for user safety**.

### English (en-US)

```json
{
  "crisis": {
    "hotline": "988 - Crisis Hotline",
    "hotlineDesc": "24/7 Mental Health Support",
    "emergency": "911 - Emergency"
  }
}
```

### German (de-DE)

```json
{
  "crisis": {
    "hotline": "Telefonseelsorge",
    "hotlineNumber": "0800-1110111",
    "hotlineAlt": "0800-1110222",
    "hotlineDesc": "24/7 Kostenlose Beratung",
    "emergency": "112 - Notruf"
  }
}
```

### Implementation

**Location:** `/app/src/utils/crisisHotlines.ts`

```typescript
import i18next from 'i18next';
import { Capacitor } from '@capacitor/core';

export const callCrisisHotline = () => {
  const language = i18next.language;

  const hotlineNumbers = {
    'en-US': '988',
    'de-DE': '0800-1110111',
  };

  const number = hotlineNumbers[language] || '988';

  if (Capacitor.isNativePlatform()) {
    window.open(`tel:${number}`, '_self');
  } else {
    navigator.clipboard.writeText(number);
    toast.success(i18next.t('crisis.numberCopied', { number }));
  }
};
```

---

## Adding New Languages

To add a new language (e.g., Spanish - es-ES):

### 1. Create Translation File

**File:** `/app/src/assets/translations/es-ES.json`

- Copy `en-US.json` structure
- Translate all keys
- Use informal tone (Gen Z audience)
- Keep text concise (mobile screens)

### 2. Add Crisis Hotlines

Research and add region-specific crisis resources:

```json
{
  "crisis": {
    "hotline": "Línea de Prevención del Suicidio",
    "hotlineNumber": "1-888-628-9454",
    "emergency": "911 - Emergencia"
  }
}
```

### 3. Update TypeScript Types

**Location:** `/app/src/models/index.ts`

```typescript
export type SupportedLanguage = 'en-US' | 'de-DE' | 'es-ES';
```

### 4. Update i18n Config

**Location:** `/app/src/utils/i18n.ts`

```typescript
import esES from '../assets/translations/es-ES.json';

i18next.use(initReactI18next).init({
  resources: {
    'en-US': { translation: enUS },
    'de-DE': { translation: deDE },
    'es-ES': { translation: esES }, // Add new language
  },
  lng: localStorage.getItem('language') || 'en-US',
  fallbackLng: 'en-US',
  supportedLngs: ['en-US', 'de-DE', 'es-ES'], // Add to supported list
});
```

### 5. Add to Language Selector

**Location:** `/app/src/components/features/profile/LanguageSelector.tsx`

```typescript
<option value="es-ES">Español</option>
```

### 6. Test All Screens

- Test layout with longer/shorter text
- Verify crisis hotlines are correct
- Check pluralization rules (Spanish has different rules than English)
- Ensure cultural appropriateness

---

## Testing i18n

### Visual Testing

**Checklist for each language:**

- [ ] All text displays in selected language
- [ ] No English fallbacks appear (indicates missing keys)
- [ ] Layout doesn't break (text overflow, truncation)
- [ ] Crisis hotlines are language-specific
- [ ] Pluralization works correctly
- [ ] Date/time formatting is appropriate
- [ ] Numbers formatted correctly (commas vs periods)

**Layout Testing Tips:**

- **German text is ~30% longer** than English
- Test with longest reasonable translations
- Use flexible layouts (avoid fixed widths)
- Test on smallest target device (iPhone SE)

---

### Automated Testing (Future)

**Create test script:**

```typescript
// tests/i18n.test.ts
import { describe, it, expect } from 'vitest';
import enUS from '../app/src/assets/translations/en-US.json';
import deDE from '../app/src/assets/translations/de-DE.json';

describe('i18n Coverage', () => {
  it('should have 100% German coverage', () => {
    const enKeys = getAllKeys(enUS);
    const deKeys = getAllKeys(deDE);

    const missing = enKeys.filter((key) => !deKeys.includes(key));

    expect(missing).toEqual([]);
  });
});

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}
```

---

## Performance Considerations

### Current Setup

- Translations loaded **synchronously** on app start
- Both en-US.json and de-DE.json are small (~50KB combined)
- No lazy loading needed at current scale
- Language detection: localStorage → browser → fallback to en-US

### Future Optimization

If translation files grow large (>100KB):

- **Lazy load** translations per language
- **Code split** by namespace (load only needed sections)
- **Cache** translations in localStorage

```typescript
// Future: Lazy loading example
const loadTranslation = async (lang: string) => {
  const translation = await import(`../assets/translations/${lang}.json`);
  i18next.addResourceBundle(lang, 'translation', translation.default);
};
```

---

## Resources

### Official Documentation

- **i18next:** https://www.i18next.com/
- **react-i18next:** https://react.i18next.com/
- **Pluralization Rules:** https://www.i18next.com/translation-function/plurals
- **Interpolation:** https://www.i18next.com/translation-function/interpolation

### Tools

- **i18next Parser:** Extract keys from code automatically
- **Lokalise/Crowdin:** Translation management platforms (for scaling)
- **DeepL API:** High-quality automated translations (review required)

---

## See Also

- [Profile Settings](../04-features/profile-settings.md) - Language selector implementation
- [Voice Chat](../04-features/voice-chat.md) - Translating voice UI
- [SOS Flow](../04-features/sos-flow.md) - Translating grounding instructions
- [Design Principles](../02-design-system/design-principles.md) - Minimal text principle
