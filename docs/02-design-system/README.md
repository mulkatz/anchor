# Design System - Quick Reference

**Read this when:** Building any UI component, styling elements, quick lookups

This is your **fast reference card**. For detailed guidance, see individual docs.

---

## Color Palette

| Color           | Hex       | Usage                               | Tailwind Class     |
| --------------- | --------- | ----------------------------------- | ------------------ |
| **Void Blue**   | `#0A1128` | Main background                     | `bg-void-blue`     |
| **Biolum Cyan** | `#64FFDA` | Primary interactive elements, glows | `text-biolum-cyan` |
| **Warm Ember**  | `#FFB38A` | Accents, warm highlights            | `text-warm-ember`  |
| **Mist White**  | `#E2E8F0` | Body text, readable white           | `text-mist-white`  |

### State Colors

| Color       | Hex       | Usage                         |
| ----------- | --------- | ----------------------------- |
| **Success** | `#4ECDC4` | Completion, positive feedback |
| **Warning** | `#FFD93D` | Gentle alerts                 |
| **Danger**  | `#FF6B6B` | Destructive actions           |

### Glass Morphism

| Property   | Value                       | Tailwind Class        |
| ---------- | --------------------------- | --------------------- |
| Background | `rgba(255, 255, 255, 0.05)` | `bg-glass-bg`         |
| Border     | `rgba(255, 255, 255, 0.1)`  | `border-glass-border` |
| Hover BG   | `rgba(255, 255, 255, 0.08)` | `bg-glass-bg-hover`   |

**See:** [Colors Guide](colors.md) for detailed usage and examples

---

## Typography

### Font Families

- **Sans:** Inter, SF Pro Display, system-ui, sans-serif
- **Mono:** SF Mono, Menlo, Monaco, monospace

### Font Size Scale (Mobile-First)

| Size     | Rem      | Pixels | Line Height | Usage               | Class       |
| -------- | -------- | ------ | ----------- | ------------------- | ----------- |
| **xs**   | 0.75rem  | 12px   | 1rem        | Captions, metadata  | `text-xs`   |
| **sm**   | 0.875rem | 14px   | 1.25rem     | Small text, labels  | `text-sm`   |
| **base** | 1rem     | 16px   | 1.5rem      | Body text (default) | `text-base` |
| **lg**   | 1.125rem | 18px   | 1.75rem     | Emphasized text     | `text-lg`   |
| **xl**   | 1.25rem  | 20px   | 1.75rem     | Section headers     | `text-xl`   |
| **2xl**  | 1.5rem   | 24px   | 2rem        | Page titles         | `text-2xl`  |
| **3xl**  | 1.875rem | 30px   | 2.25rem     | Large headings      | `text-3xl`  |
| **4xl**  | 2.25rem  | 36px   | 2.5rem      | Hero text           | `text-4xl`  |

**See:** [Typography Guide](typography.md) for hierarchy and usage guidelines

---

## Animation

### Durations

| Type                   | Duration  | Usage                         |
| ---------------------- | --------- | ----------------------------- |
| **Micro-interactions** | 300-400ms | Button taps, toggle switches  |
| **UI feedback**        | 400-600ms | Toast messages, state changes |
| **Page transitions**   | 600-800ms | Route changes, screen swaps   |

### Easing Curves

| Name        | Cubic Bezier                 | Usage                          | Class          |
| ----------- | ---------------------------- | ------------------------------ | -------------- |
| **Viscous** | `(0.22, 1, 0.36, 1)`         | Default easing (slow ease-out) | `ease-viscous` |
| **Elastic** | `(0.68, -0.55, 0.265, 1.55)` | Playful bounces (rare)         | `ease-elastic` |

### Common Patterns

- **Fade in:** opacity 0 → 1, 600ms viscous
- **Slide up:** translateY(20px) → 0, 800ms viscous
- **Pulse glow:** scale + opacity loop, 2s ease-in-out infinite
- **Breathe:** scale breathing pattern, 10s ease-in-out infinite

**See:** [Animations Guide](animations.md) for detailed examples and Framer Motion patterns

---

## Haptics

| Type          | Impact Style           | When to Use                 | Purpose                |
| ------------- | ---------------------- | --------------------------- | ---------------------- |
| **Heavy**     | `ImpactStyle.Heavy`    | Crisis moments, SOS trigger | Acknowledge distress   |
| **Medium**    | `ImpactStyle.Medium`   | Completion, success         | Positive reinforcement |
| **Light**     | `ImpactStyle.Light`    | UI taps, swipes             | Confirm action         |
| **Selection** | `Haptics.selection*()` | Continuous scrubbing        | Tactile grounding      |

**Code:**

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Heavy impact
await Haptics.impact({ style: ImpactStyle.Heavy });

// Selection feedback
await Haptics.selectionStart();
await Haptics.selectionChanged(); // During drag
await Haptics.selectionEnd();
```

**See:** [Haptics Guide](../05-implementation/haptics.md) for therapeutic patterns

---

## Glass Effects

### Backdrop Blur

| Value    | Usage                 | Class                       |
| -------- | --------------------- | --------------------------- |
| **12px** | Standard glass effect | `backdrop-blur-glass`       |
| **24px** | Heavy glass (modals)  | `backdrop-blur-glass-heavy` |

### Box Shadows (Glows)

| Name        | Value                               | Usage         | Class            |
| ----------- | ----------------------------------- | ------------- | ---------------- |
| **Glow SM** | `0 0 10px rgba(100, 255, 218, 0.3)` | Subtle glow   | `shadow-glow-sm` |
| **Glow MD** | `0 0 20px rgba(100, 255, 218, 0.4)` | Standard glow | `shadow-glow-md` |
| **Glow LG** | `0 0 40px rgba(100, 255, 218, 0.5)` | Strong glow   | `shadow-glow-lg` |
| **Glass**   | `0 8px 32px rgba(0, 0, 0, 0.3)`     | Depth shadow  | `shadow-glass`   |

### Glass Card Pattern

```tsx
<div className="border-glass-border bg-glass-bg backdrop-blur-glass shadow-glass rounded-3xl border p-6">
  {/* Content */}
</div>
```

**See:** [Glass Effects Guide](glass-effects.md) for layering and depth techniques

---

## Spacing Scale

Uses Tailwind's default spacing scale (4px increments):

| Class | Rem    | Pixels |
| ----- | ------ | ------ |
| `p-2` | 0.5rem | 8px    |
| `p-4` | 1rem   | 16px   |
| `p-6` | 1.5rem | 24px   |
| `p-8` | 2rem   | 32px   |

### Common Spacing

- **Page padding:** `px-6` (24px)
- **Section gaps:** `gap-6` (24px) or `gap-8` (32px)
- **Card padding:** `p-6` (24px)
- **Button padding:** `px-6 py-3` (24px x 12px)

---

## Safe Areas

For notch and home indicator handling:

| Class              | CSS                                           | Usage                  |
| ------------------ | --------------------------------------------- | ---------------------- |
| `pt-safe`          | `padding-top: env(safe-area-inset-top)`       | Top of screen          |
| `pb-safe`          | `padding-bottom: env(safe-area-inset-bottom)` | Bottom of screen       |
| `pt-safe-offset-6` | `calc(env(safe-area-inset-top) + 1.5rem)`     | Top with extra padding |

**See:** [Safe Areas Guide](../05-implementation/safe-areas.md)

---

## Common Patterns

### Full-Height Page with Safe Areas

```tsx
<div className="bg-void-blue pt-safe flex h-full flex-col overflow-y-auto px-6 pb-8">
  {/* Content */}
</div>
```

### Glass Card

```tsx
<div className="border-glass-border bg-glass-bg backdrop-blur-glass rounded-3xl border p-6">
  {/* Content */}
</div>
```

### Bioluminescent Button

```tsx
<button className="bg-biolum-cyan text-void-blue shadow-glow-md ease-viscous hover:shadow-glow-lg rounded-2xl px-6 py-3 font-medium transition-all duration-300 active:scale-95">
  {/* Label */}
</button>
```

### Page Transition (Framer Motion)

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
  {/* Page content */}
</motion.div>
```

---

## Detailed Guides

For comprehensive information, see:

- [Colors](colors.md) - Palette, usage guidelines, accessibility
- [Typography](typography.md) - Hierarchy, readability, mobile-first
- [Animations](animations.md) - Motion principles, Framer Motion patterns
- [Glass Effects](glass-effects.md) - Depth, layering, shadows

---

## Quick Decision Tree

**Choosing a color:**

- Background? → `void-blue`
- Text? → `mist-white`
- Interactive element? → `biolum-cyan`
- Accent? → `warm-ember`

**Choosing animation duration:**

- Button tap? → 300ms
- State change? → 400ms
- Page transition? → 600ms

**Choosing haptic:**

- Crisis moment? → Heavy
- Success? → Medium
- UI interaction? → Light
- Continuous drag? → Selection

**Choosing blur:**

- Floating card? → 12px (`backdrop-blur-glass`)
- Modal overlay? → 24px (`backdrop-blur-glass-heavy`)
