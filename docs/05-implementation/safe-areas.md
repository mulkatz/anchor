# Safe Areas Implementation Guide

**Read this when:** Implementing full-screen layouts, working with navigation bars, handling notches/home indicators, or debugging layout issues on iOS devices.

---

## Overview

Safe areas ensure content doesn't get hidden behind device features like notches (iPhone X+), rounded corners, or home indicators. Proper safe area handling is critical for professional mobile app appearance.

**Plugin:** `tailwindcss-safe-area` - Configured in `tailwind.config.ts`

---

## What Are Safe Areas?

### Device Features That Require Safe Areas

**iPhone X and newer:**

- Top notch (Face ID sensor housing)
- Rounded screen corners
- Bottom home indicator

**Android devices:**

- Notches/punch-holes (varies by manufacturer)
- Gesture navigation bar
- Software navigation buttons

**iPad:**

- Rounded corners
- Home indicator (newer models)

---

## CSS Environment Variables

Modern iOS and Android expose safe area insets as CSS environment variables:

```css
env(safe-area-inset-top)     /* Top inset (notch) */
env(safe-area-inset-right)   /* Right inset (rounded corners) */
env(safe-area-inset-bottom)  /* Bottom inset (home indicator) */
env(safe-area-inset-left)    /* Left inset (rounded corners) */
```

**Values:**

- On iPhone X+: `top: 44px`, `bottom: 34px` (portrait)
- On Android: Varies by device
- On desktop/web: `0px` (no insets)

---

## Tailwind Safe Area Plugin

### Installation

Already installed and configured in `tailwind.config.ts`:

```typescript
import tailwindcssSafeArea from 'tailwindcss-safe-area';

export default {
  plugins: [tailwindCssSafeArea],
} satisfies Config;
```

---

### Generated Classes

The plugin generates utility classes for safe area handling:

#### Padding Classes

```css
.pt-safe  /* padding-top: env(safe-area-inset-top) */
.pr-safe  /* padding-right: env(safe-area-inset-right) */
.pb-safe  /* padding-bottom: env(safe-area-inset-bottom) */
.pl-safe  /* padding-left: env(safe-area-inset-left) */
.px-safe  /* horizontal safe padding */
.py-safe  /* vertical safe padding */
.p-safe   /* all sides safe padding */
```

#### Padding with Offset

Add extra padding beyond the safe area:

```css
.pt-safe-offset-4  /* padding-top: calc(env(safe-area-inset-top) + 1rem) */
.pt-safe-offset-6  /* padding-top: calc(env(safe-area-inset-top) + 1.5rem) */
.pt-safe-offset-8  /* padding-top: calc(env(safe-area-inset-top) + 2rem) */
/* ... and more offset variants */
```

#### Margin Classes

```css
.mt-safe  /* margin-top: env(safe-area-inset-top) */
.mr-safe  /* margin-right: env(safe-area-inset-right) */
.mb-safe  /* margin-bottom: env(safe-area-inset-bottom) */
.ml-safe  /* margin-left: env(safe-area-inset-left) */
```

---

## Common Use Cases

### Full-Screen Pages

Pages that fill the entire viewport need safe area padding to prevent content from being hidden.

**Example: ProfilePage**

```tsx
<div className="bg-void-blue pt-safe flex h-full flex-col overflow-y-auto px-6 pb-8">
  {/* Content automatically respects notch */}
  <h1>Profile</h1>
  {/* ... */}
</div>
```

**Result:**

- Content starts below the notch
- Scrollable content doesn't go under the home indicator
- Proper padding on all devices

---

### Dialogs and Modals

Dialogs need safe area padding to ensure buttons aren't hidden by home indicators.

**Example: ConfirmDialog**

```tsx
<div className="pt-safe pb-safe fixed inset-0 z-[9999] flex items-center justify-center px-4">
  <div className="bg-void-blue rounded-3xl p-6">
    <h2>{title}</h2>
    <p>{message}</p>
    <div className="flex gap-3">
      <button>Cancel</button>
      <button>Confirm</button>
    </div>
  </div>
</div>
```

**Why both `pt-safe` and `pb-safe`?**

- `pt-safe`: Ensures dialog doesn't go under status bar
- `pb-safe`: Ensures buttons aren't hidden by home indicator

---

### Fixed Navigation Bars

Bottom navigation bars (like FloatingDock) need safe area padding to stay above the home indicator.

**Example: FloatingDock**

```tsx
<nav className="pb-safe fixed bottom-0 left-0 right-0 z-50">
  <div className="mx-auto flex max-w-md items-center justify-around px-6 py-4">
    {/* Navigation buttons */}
  </div>
</nav>
```

**Result:**

- Nav bar sits above home indicator
- Buttons remain fully interactive
- No accidental home gesture triggers

---

### Toast Notifications

Toasts at the top of screen need to avoid the notch.

**Example: react-hot-toast Configuration**

```tsx
import { Toaster } from 'react-hot-toast';

<Toaster
  position="top-center"
  containerStyle={{
    top: 'env(safe-area-inset-top, 0px)', // Respects notch
  }}
  toastOptions={{
    duration: 2500,
    style: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      color: '#E2E8F0',
      borderRadius: '16px',
    },
  }}
  gutter={8}
/>;
```

**Result:**

- Toasts appear below the notch
- Fallback to `0px` on devices without notch

---

## Dynamic Safe Area Handling

### UIContext for Navbar Measurements

Some pages need to account for **both** safe areas and floating navigation bars.

**Problem:**

- Safe area insets are static CSS values
- FloatingDock height is dynamic (content-dependent)
- Need to calculate: `page bottom padding = safe area + navbar height`

**Solution: UIContext**

**Location:** `/app/src/contexts/UIContext.tsx`

```typescript
interface UIState {
  navbarHeight: number;
  navbarBottom: number; // window.innerHeight - rect.top
  isScrolled: boolean;
  setNavbarDimensions: (height: number, bottom: number) => void;
}
```

---

### FloatingDock Measurements

**Location:** `/app/src/components/features/navigation/FloatingDock.tsx`

```typescript
const navRef = useRef<HTMLDivElement>(null);
const { setNavbarDimensions } = useUI();

useEffect(() => {
  const updateDimensions = () => {
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      const height = rect.height;
      const bottom = window.innerHeight - rect.top;
      setNavbarDimensions(height, bottom);
    }
  };

  updateDimensions();
  window.addEventListener('resize', updateDimensions);

  return () => window.removeEventListener('resize', updateDimensions);
}, [setNavbarDimensions]);

return <nav ref={navRef} className="pb-safe fixed bottom-0 left-0 right-0">
  {/* ... */}
</nav>;
```

---

### Using UIContext in Pages

**Example: ProfilePage**

```typescript
import { useUI } from '@/contexts/UIContext';

export const ProfilePage = () => {
  const { navbarBottom } = useUI();

  return (
    <div
      className="bg-void-blue pt-safe flex h-full flex-col overflow-y-auto px-6 pb-8"
      style={{ paddingBottom: `${navbarBottom + 32}px` }}
    >
      {/* Content with proper bottom clearance */}
    </div>
  );
};
```

**How it works:**

1. FloatingDock measures itself: `navbarBottom = 120px` (example)
2. Page adds extra padding: `120px + 32px = 152px`
3. Content never hidden by navbar

---

## Prevent Overscroll Bounce (iOS)

iOS has a "rubber band" effect when scrolling past content boundaries. This can expose the browser chrome and break immersion.

**Solution:** Disable overscroll globally.

**Location:** `/app/src/index.css`

```css
html,
body {
  overscroll-behavior: none;
}
```

**Result:**

- No rubber band effect
- Content stops at boundaries
- Maintains full-screen app feel

---

## viewport-fit=cover

To enable safe area CSS variables, the HTML must include `viewport-fit=cover` in the viewport meta tag.

**Location:** `/app/index.html`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

**Why needed:**

- Without `viewport-fit=cover`, safe area insets are all `0px`
- With it, iOS provides actual inset values

---

## Testing Safe Areas

### Testing on Devices

**iPhone X+ (with notch):**

- [ ] Content starts below notch (not hidden)
- [ ] Bottom content above home indicator (not hidden)
- [ ] Dialogs properly centered
- [ ] Navigation bar fully interactive
- [ ] Toasts appear below notch

**Android (various notches):**

- [ ] Notch/punch-hole doesn't hide content
- [ ] Gesture navigation bar doesn't interfere
- [ ] Test on multiple manufacturers (Samsung, Google Pixel, OnePlus)

**iPad:**

- [ ] Rounded corners don't clip content
- [ ] Home indicator doesn't hide buttons

---

### Testing in Simulator

**iOS Simulator:**

1. Open Xcode
2. Select device with notch (e.g., iPhone 14 Pro)
3. Run app: `npm run ios`
4. Check safe areas visually

**Android Emulator:**

1. Open Android Studio
2. Select device with notch/gesture nav
3. Run app: `npm run android`
4. Check safe areas visually

---

### Debug Overlays

Add visual debug overlay to see safe area boundaries:

```css
/* Temporary debug styles */
.pt-safe {
  border-top: 2px solid red !important;
}

.pb-safe {
  border-bottom: 2px solid blue !important;
}
```

**Result:**

- Red border shows top safe area
- Blue border shows bottom safe area

---

## Common Issues

### Issue: Content Hidden by Notch

**Symptom:** Page title or header cut off at top

**Cause:** Missing `pt-safe` class

**Solution:**

```tsx
<div className="pt-safe">
  {' '}
  {/* Add this */}
  <h1>Page Title</h1>
</div>
```

---

### Issue: Buttons Hidden by Home Indicator

**Symptom:** Bottom buttons not clickable

**Cause:** Missing `pb-safe` or insufficient bottom padding

**Solution:**

```tsx
<div className="pb-safe">
  {' '}
  {/* Add this */}
  <button>Click Me</button>
</div>
```

---

### Issue: Dialog Cut Off

**Symptom:** Dialog extends off-screen on iPhone X+

**Cause:** Dialog container needs safe area padding

**Solution:**

```tsx
<div className="pt-safe pb-safe fixed inset-0">{/* Dialog content */}</div>
```

---

### Issue: Navigation Bar Overlaps Content

**Symptom:** Last item in list hidden by navbar

**Cause:** Page doesn't account for navbar height

**Solution:**

```typescript
const { navbarBottom } = useUI();

<div style={{ paddingBottom: `${navbarBottom + 32}px` }}>
  {/* List items */}
</div>
```

---

## Best Practices

### DO

✅ **Always use safe area classes on full-screen containers**

```tsx
<div className="pt-safe pb-safe"> ... </div>
```

✅ **Test on real devices with notches**

- Simulators work, but real device testing is critical

✅ **Use UIContext for complex layouts**

- When safe areas alone aren't enough

✅ **Add extra padding beyond safe areas**

- Use `pt-safe-offset-6` for breathing room

✅ **Consider landscape orientation**

- Safe areas change in landscape (especially on iPhone)

---

### DON'T

❌ **Hardcode safe area values**

```tsx
{/* ❌ Bad: Hardcoded */}
<div style={{ paddingTop: '44px' }}>

{/* ✅ Good: Dynamic */}
<div className="pt-safe">
```

❌ **Forget viewport-fit=cover**

- Without it, safe areas don't work

❌ **Assume all devices have same insets**

- Test on multiple devices (notch sizes vary)

❌ **Ignore landscape orientation**

- Safe areas are different in landscape

---

## Landscape Orientation

### Safe Area Changes

**Portrait:**

- Top: 44px (notch)
- Bottom: 34px (home indicator)

**Landscape:**

- Top: 0px (no notch on sides)
- Left: 44px (notch rotates to side)
- Right: 44px
- Bottom: 21px (home indicator)

**Handling:**

```tsx
<div className="p-safe">
  {' '}
  {/* All sides covered */}
  {/* Content safe in both orientations */}
</div>
```

---

## Accessibility Considerations

### Increased Touch Targets

Safe areas often result in larger touch targets (buttons away from edges).

**Benefit:** Easier to tap for users with motor disabilities

### Screen Readers

Safe areas don't affect screen reader navigation, but proper semantic HTML is still critical.

---

## See Also

- [Profile Settings](../04-features/profile-settings.md) - Full-screen page example
- [Design System - Colors](../02-design-system/colors.md) - Background colors for safe areas
- [Troubleshooting](../06-development/troubleshooting.md) - Debugging layout issues
- [File Structure](../03-architecture/file-structure.md) - UIContext location
