# Testing Strategy

**Read this when:** Writing tests, QA process, CI/CD setup, manual testing

---

## Current State

Testing infrastructure is planned but not yet implemented. This document outlines the strategy.

---

## Unit Tests (Planned)

### Framework

- **Vitest** - Fast, Vite-native testing
- **React Testing Library** - Component testing

### What to Test

**Utils (Pure Functions):**

```typescript
// utils/formatTime.test.ts
import { formatRelativeTime } from './formatTime';

describe('formatRelativeTime', () => {
  it('returns "just now" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });
});
```

**Hooks:**

```typescript
// hooks/useHaptics.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useHaptics } from './useHaptics';

describe('useHaptics', () => {
  it('triggers light haptic', async () => {
    const { result } = renderHook(() => useHaptics());
    await result.current.triggerLight();
    // Verify Haptics.impact was called
  });
});
```

**Components (Isolated):**

```typescript
// components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when pressed', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## Integration Tests (Planned)

### SOS Flow

Test complete 7-step sequence:

```typescript
describe('SOS Flow', () => {
  it('completes full flow', async () => {
    // Step 1: Trigger
    await longPress(sosButton, 2000);
    expect(screen.getByText("I've got you")).toBeVisible();

    // Step 2: Auto-advance after 5s
    await waitFor(
      () => {
        expect(screen.getByText('Tap 5 things')).toBeVisible();
      },
      { timeout: 6000 }
    );

    // Steps 3-7...
  });
});
```

### Navigation

```typescript
describe('Navigation', () => {
  it('navigates between pages', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('link', { name: /profile/i }));
    expect(screen.getByText('Settings')).toBeVisible();
  });
});
```

---

## E2E Tests (Future - Detox)

### Why Detox?

- Native mobile E2E testing
- Real device testing
- Haptics verification

### Critical Paths

1. **Home → SOS → Completion**
2. **Home → Chat → Send Message → Receive Response**
3. **Profile → Settings → Toggle Haptics**

---

## Manual Testing Checklists

### Chat Feature

- [ ] Send text message
- [ ] Receive AI response
- [ ] Record voice message (mic permission)
- [ ] Voice message transcribes
- [ ] Crisis keywords trigger crisis card
- [ ] Messages persist after refresh

### Profile/Settings

- [ ] Toggle haptics → Verify haptic test fires
- [ ] Toggle analytics → Verify persists
- [ ] Export data → Verify JSON downloads
- [ ] Delete account → Verify sign out
- [ ] Crisis hotline → Verify phone opens

### Voice Recording

- [ ] Mic permission dialog shows
- [ ] Recording starts on tap
- [ ] Recording stops on second tap
- [ ] Duration counter updates
- [ ] 60s auto-cutoff works
- [ ] Upload succeeds
- [ ] Transcription appears

### SOS Flow

See [SOS Flow Testing Checklist](../04-features/sos-flow.md#testing-checklist)

### i18n

- [ ] Switch to German
- [ ] All screens show German text
- [ ] No English fallbacks visible
- [ ] German crisis hotlines correct
- [ ] Layout doesn't break (German ~30% longer)

---

## Device Testing Matrix

### iOS

| Device        | iOS Version | Priority |
| ------------- | ----------- | -------- |
| iPhone 15 Pro | iOS 17      | High     |
| iPhone 13     | iOS 16      | Medium   |
| iPhone SE     | iOS 15      | Medium   |
| iPad Pro      | iPadOS 17   | Low      |

### Android

| Device      | Android Version | Priority |
| ----------- | --------------- | -------- |
| Pixel 7     | Android 14      | High     |
| Samsung S23 | Android 13      | Medium   |
| OnePlus 11  | Android 13      | Low      |

---

## Haptics Testing

⚠️ **Haptics require real device** - simulators/emulators don't support haptics.

### Manual Verification

1. Enable haptics in Settings
2. Trigger each haptic type:
   - **Light:** Tap any button
   - **Medium:** Complete an action
   - **Heavy:** Trigger SOS
   - **Selection:** Drag in SOS Touch step

---

## Performance Testing

### Lighthouse (Web)

```bash
npx lighthouse http://localhost:5173 --view
```

**Targets:**

- Performance: >90
- Accessibility: >90
- Best Practices: >90

### Bundle Analysis

```bash
cd app
npm run build -- --report
```

Check for:

- Bundle size < 500KB (gzipped)
- No large unused dependencies

---

## CI/CD (Future)

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

---

## See Also

- [SOS Flow](../04-features/sos-flow.md) - Feature-specific testing
- [Voice Chat](../04-features/voice-chat.md) - Voice testing checklist
- [i18n Guide](../05-implementation/i18n-guide.md) - Language testing
- [Getting Started](getting-started.md) - Running the app
