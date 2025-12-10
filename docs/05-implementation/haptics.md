# Haptics Implementation Guide

**Read this when:** Implementing haptic feedback, understanding therapeutic touch patterns, troubleshooting haptics issues, or designing new interactions with physical feedback.

---

## Overview

Haptics in Anxiety Buddy are **not UI candy**—they are **therapeutic tools** for grounding during anxiety episodes. Every haptic interaction is intentionally designed to provide physical anchoring and sensory feedback.

**Plugin:** `@capacitor/haptics` v7.0.0

---

## Design Philosophy

### Haptics as Therapy

From [Design Principles](../02-design-system/design-principles.md):

> "Every user interaction should have appropriate haptic feedback. Haptics are not 'UI candy' - they are grounding tools."

**Core Principles:**

1. **Physical Grounding** - Touch feedback helps users reconnect with their body during panic
2. **Sensory Engagement** - Activates tactile sense as part of multi-sensory de-escalation
3. **Confirmation** - Provides physical acknowledgment of user actions
4. **Rhythm** - Rhythmic patterns (heartbeat) create calming effect
5. **Intensity Mapping** - Feedback intensity matches action severity

---

## Haptic Types

### Heavy Impact

**When to use:**

- Crisis moments (SOS trigger)
- Critical warnings (destructive actions)
- Emergency resource access (988/911 buttons)

**Characteristics:**

- Strong, pronounced pulse
- Immediate attention grabber
- Maximum intensity
- Single, decisive feedback

**Implementation:**

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

await Haptics.impact({ style: ImpactStyle.Heavy });
```

**Examples:**

- SOS button long-press completion
- Crisis resources card appearance
- Delete account confirmation
- Call crisis hotline button

---

### Medium Impact

**When to use:**

- Success states
- Completion of tasks
- Positive confirmations
- Save actions

**Characteristics:**

- Noticeable but not jarring
- Celebratory without being overwhelming
- Single pulse
- Moderate intensity

**Implementation:**

```typescript
await Haptics.impact({ style: ImpactStyle.Medium });
```

**Examples:**

- SOS flow completion (Step 7)
- Session saved successfully
- Settings updated
- Message sent confirmation

---

### Light Impact

**When to use:**

- UI interactions (taps, swipes)
- Button presses
- Toggle switches
- Navigation actions

**Characteristics:**

- Crisp, subtle click
- Confirms interaction without distraction
- Single pulse
- Light intensity

**Implementation:**

```typescript
await Haptics.impact({ style: ImpactStyle.Light });
```

**Examples:**

- Tap counter in SOS Step 3 (Grounding - SIGHT)
- Settings toggle switches
- Navigation bar taps
- General button presses

---

### Selection Feedback

**When to use:**

- Continuous dragging/scrubbing
- Scrolling through pickers
- Adjusting sliders
- Tactile exploration

**Characteristics:**

- Continuous, gritty vibration
- Simulates textured surface
- Varies with movement speed
- Multi-stage (start, changed, end)

**Implementation:**

```typescript
// On touch start
await Haptics.selectionStart();

// During drag (call periodically, e.g., every 50ms)
await Haptics.selectionChanged();

// On touch end
await Haptics.selectionEnd();
```

**Examples:**

- SOS Step 4 (Grounding - TOUCH) - finger dragging
- Volume slider adjustment
- Scrubbing audio timeline

---

## Therapeutic Haptic Patterns

### Heartbeat Pattern

**Purpose:** Establish calming rhythm, simulate human heartbeat at resting rate.

**Used in:** SOS Step 2 (Acknowledgement)

**Pattern:**

- 60 BPM (1 pulse per second)
- Medium impact
- Consistent rhythm
- 5-second duration

**Implementation:**

```typescript
const heartbeatPattern = async (durationSeconds: number = 5) => {
  const intervalMs = 1000; // 60 BPM
  const pulses = durationSeconds;

  for (let i = 0; i < pulses; i++) {
    await Haptics.impact({ style: ImpactStyle.Medium });
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
};

// Usage
await heartbeatPattern(5);
```

---

### Breathing Pattern

**Purpose:** Physical cue for 4-7-8 breathing technique.

**Used in:** SOS Step 6 (Exit Breath)

**Pattern:**

- **Inhale (4s):** Gentle, building swell
- **Hold (7s):** Silence (no haptics)
- **Exhale (8s):** Gradual fade

**Implementation:**

```typescript
const breathingCycle = async () => {
  // Inhale: Build up over 4 seconds
  for (let i = 0; i < 4; i++) {
    await Haptics.impact({ style: ImpactStyle.Light });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Hold: 7 seconds of silence
  await new Promise((resolve) => setTimeout(resolve, 7000));

  // Exhale: Gentle pulses fading out
  for (let i = 3; i > 0; i--) {
    await Haptics.impact({ style: ImpactStyle.Light });
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

// Repeat for 3 cycles
for (let cycle = 0; cycle < 3; cycle++) {
  await breathingCycle();
}
```

---

### Continuous Selection (Tactile Scrub)

**Purpose:** Simulate textured surface for grounding through touch.

**Used in:** SOS Step 4 (Grounding - TOUCH)

**Pattern:**

- Start on touch down
- Changed continuously while dragging
- End on touch up
- Gritty, textured feeling

**Implementation:**

```typescript
const [isDragging, setIsDragging] = useState(false);

const handleTouchStart = async () => {
  setIsDragging(true);
  await Haptics.selectionStart();
};

const handleTouchMove = async (e: TouchEvent) => {
  if (isDragging) {
    // Throttle to avoid overwhelming
    await Haptics.selectionChanged();
  }
};

const handleTouchEnd = async () => {
  setIsDragging(false);
  await Haptics.selectionEnd();
};

<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  {/* Draggable area */}
</div>
```

---

## User Preferences

### Haptics Toggle

Users can disable haptics in Profile → Settings.

**Storage:** `localStorage.hapticsEnabled`

**Default:** `true` (enabled)

**Implementation:**

```typescript
// Check before triggering haptics
const triggerHaptic = async (style: ImpactStyle) => {
  const hapticsEnabled = localStorage.getItem('hapticsEnabled') === 'true';

  if (hapticsEnabled) {
    await Haptics.impact({ style });
  }
};
```

**Wrapper Hook:**

**Location:** `/app/src/hooks/useHaptics.tsx`

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useSettings } from './useSettings';

export const useHaptics = () => {
  const { settings } = useSettings();

  const impact = async (style: ImpactStyle) => {
    if (!settings.hapticsEnabled) return;

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptics not supported or failed:', error);
    }
  };

  const selectionStart = async () => {
    if (!settings.hapticsEnabled) return;
    await Haptics.selectionStart();
  };

  const selectionChanged = async () => {
    if (!settings.hapticsEnabled) return;
    await Haptics.selectionChanged();
  };

  const selectionEnd = async () => {
    if (!settings.hapticsEnabled) return;
    await Haptics.selectionEnd();
  };

  return {
    impact,
    selectionStart,
    selectionChanged,
    selectionEnd,
  };
};
```

**Usage in Components:**

```typescript
const MyComponent = () => {
  const { impact } = useHaptics();

  const handleButtonPress = async () => {
    await impact(ImpactStyle.Light);
    // ... rest of logic
  };
};
```

---

## Platform Differences

### iOS

**Support:** Excellent

- All haptic types supported
- Taptic Engine provides rich, nuanced feedback
- Low latency (<50ms)
- Requires iOS 13+

**Best Experience:**

- iPhone 7+ (Taptic Engine)
- iPhone X+ (Advanced Haptics)

---

### Android

**Support:** Varies by device

- Modern Android (8+) supports haptics well
- Quality depends on hardware (vibration motor)
- Higher latency than iOS (~100-200ms)
- Intensity may vary across devices

**Testing:**

- Test on multiple devices (Samsung, Google Pixel, OnePlus)
- Provide fallback for unsupported devices

---

### Web

**Support:** Limited

- Vibration API available in some browsers
- Not supported in Safari (iOS)
- Desktop browsers: no haptics
- Mobile web: limited support

**Fallback:**

- Visual feedback only
- Don't rely on haptics for critical functionality

---

## Error Handling

### Graceful Degradation

Haptics should **never** break functionality if unsupported.

```typescript
export const safeHaptic = async (style: ImpactStyle) => {
  try {
    await Haptics.impact({ style });
  } catch (error) {
    // Silently fail - haptics are enhancement, not requirement
    console.warn('Haptics not available:', error);
  }
};
```

### Permission Handling

Some platforms may require permission (though rare for haptics).

```typescript
import { Capacitor } from '@capacitor/core';

const checkHapticsSupport = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    return false; // Web has limited support
  }

  try {
    // Test if haptics work
    await Haptics.impact({ style: ImpactStyle.Light });
    return true;
  } catch (error) {
    console.warn('Haptics not supported:', error);
    return false;
  }
};
```

---

## Best Practices

### DO

✅ **Provide haptic feedback for all interactive elements**

- Buttons, toggles, sliders, taps

✅ **Match intensity to action severity**

- Light: UI interactions
- Medium: Success states
- Heavy: Critical actions

✅ **Test on real devices**

- Simulators don't support haptics

✅ **Respect user preferences**

- Always check `hapticsEnabled` setting

✅ **Use therapeutic patterns intentionally**

- Heartbeat for calming
- Breathing for guided exercises
- Selection for grounding

---

### DON'T

❌ **Overuse haptics**

- Not every animation needs feedback
- Avoid haptic spam (e.g., rapid repeated pulses)

❌ **Rely on haptics for critical functionality**

- Must work without haptics (web, accessibility)

❌ **Ignore user preferences**

- Some users dislike haptics (sensory sensitivity)

❌ **Use random patterns**

- Every haptic should have clear purpose

❌ **Forget error handling**

- Always wrap in try-catch

---

## Accessibility Considerations

### Sensory Sensitivity

Some users have **sensory processing sensitivity** and may find haptics overwhelming.

**Solution:**

- Provide clear toggle in settings
- Default to ON (most users benefit)
- Make toggle easy to find

---

### Deaf/Hard of Hearing

Haptics are especially valuable for users who rely on **physical feedback** instead of audio cues.

**Guidelines:**

- Pair haptics with visual feedback
- Use distinct patterns for different actions
- Don't assume users can hear audio cues

---

### Motor Disabilities

Users with motor disabilities may benefit from **stronger haptic confirmation** of actions.

**Consideration:**

- Medium/Heavy impacts more noticeable
- Selection feedback helps with dragging

---

## Debugging Haptics

### Testing Checklist

- [ ] Haptics work on real iOS device (iPhone 7+)
- [ ] Haptics work on real Android device (Android 8+)
- [ ] Haptics respect user preference (toggle off works)
- [ ] No crashes when haptics unsupported
- [ ] No performance issues (smooth animations)
- [ ] Latency acceptable (<100ms perceived)
- [ ] Patterns match intended therapeutic effect

---

### Common Issues

**Issue:** Haptics don't work in simulator

- **Cause:** Simulators don't support haptics
- **Solution:** Test on real device

**Issue:** Haptics feel weak/inconsistent

- **Cause:** Device vibration motor quality varies
- **Solution:** Test on multiple devices, adjust patterns

**Issue:** Haptics lag behind UI

- **Cause:** Async call overhead
- **Solution:** Trigger haptics **before** expensive operations

**Issue:** Haptics drain battery

- **Cause:** Overuse, continuous feedback
- **Solution:** Throttle selection feedback, use sparingly

---

## Analytics

Track haptics usage to understand user preferences:

```typescript
logAnalyticsEvent('HAPTIC_TRIGGERED', {
  type: 'heavy',
  context: 'sos_trigger',
  userHapticsEnabled: settings.hapticsEnabled,
});
```

**Metrics to track:**

- Haptics toggle rate (% of users who disable)
- Context of haptic triggers
- Platform distribution (iOS vs Android)

---

## Future Enhancements

### Adaptive Haptics

**Idea:** Adjust haptic intensity based on user stress level (if biometrics available).

**Example:**

- During high anxiety: Stronger, slower patterns (calming)
- During low anxiety: Lighter, crisper patterns (confirming)

---

### Custom Patterns

**Idea:** Allow users to customize haptic intensity per action type.

**Settings:**

- "Gentle" mode: All light impacts
- "Standard" mode: Default patterns
- "Strong" mode: All medium/heavy impacts

---

### Haptic Audio Sync

**Idea:** Sync haptics with audio cues (pink noise, breathing sounds).

**Example:**

- Pink noise plays → Gentle, rhythmic haptics
- Breathing sound exhale → Fading haptic pattern

---

## See Also

- [SOS Flow](../04-features/sos-flow.md) - Therapeutic haptic patterns in action
- [Design Principles](../02-design-system/design-principles.md) - Haptics as therapy
- [Profile Settings](../04-features/profile-settings.md) - Haptics toggle implementation
- [Troubleshooting](../06-development/troubleshooting.md) - Debugging haptics issues
