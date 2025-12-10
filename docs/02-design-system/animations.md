please# Animations

**Read this when:** Animating components, page transitions, micro-interactions, motion design decisions

---

## Philosophy

All animations in Anxiety Buddy must feel **viscous and deliberate** - like moving through thick liquid. Never snappy, never jarring.

**Why?**

- Sudden movements trigger startle responses during panic
- Slow, predictable motion signals safety
- Viscous animations feel grounding, not energizing

**Core Principle:** Viscosity Over Speed ([Design Principles](../01-vision/design-principles.md#1-viscosity-over-speed))

---

## Animation Durations

### Guidelines

| Animation Type         | Duration  | Usage                                  |
| ---------------------- | --------- | -------------------------------------- |
| **Micro-interactions** | 200-400ms | Button taps, toggle switches, checkbox |
| **UI feedback**        | 400-600ms | Toast messages, state changes, reveals |
| **Page transitions**   | 600-800ms | Route changes, screen swaps            |
| **Ambient loops**      | 2-10s     | Pulsing glows, breathing animations    |

**Minimum duration:** 400ms (never go faster unless absolutely necessary)
**Maximum duration:** 800ms for transitions (longer feels unresponsive)

---

## Easing Curves

### Viscous (Default)

```typescript
cubic - bezier(0.22, 1, 0.36, 1);
```

**Tailwind:** `ease-viscous`

**Characteristics:**

- Slow start
- Very slow ease-out
- Feels like moving through thick liquid
- Calming, grounding

**Usage:** Default for all animations

**Visualization:**

```
 Speed
  ^
  |     ╱──────
  |    ╱
  |   ╱
  |  ╱
  | ╱
  |╱
  └──────────> Time
   Slow start, very slow finish
```

---

### Elastic (Rare)

```typescript
cubic - bezier(0.68, -0.55, 0.265, 1.55);
```

**Tailwind:** `ease-elastic`

**Characteristics:**

- Slight overshoot
- Playful bounce

**Usage:** Success celebrations only (completion screens)
**Never use:** During panic states - feels too playful

---

## Tailwind Configuration

Add to `tailwind.config.ts`:

```typescript
animation: {
  'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
  'fade-out': 'fadeOut 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  'slide-up': 'slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
  'slide-down': 'slideDown 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
  'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
  'breathe': 'breathe 10s ease-in-out infinite',
  'tap-scale': 'tapScale 0.2s ease-out',
},

transitionTimingFunction: {
  'viscous': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
},

keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeOut: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  slideUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  slideDown: {
    '0%': { transform: 'translateY(-20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  pulseGlow: {
    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
    '50%': { opacity: '0.7', transform: 'scale(1.05)' },
  },
  breathe: {
    '0%, 100%': { transform: 'scale(1)' },
    '40%': { transform: 'scale(1.15)' }, // 4s in
    '70%': { transform: 'scale(1.15)' }, // 3s hold (total 7s)
    // Remaining 3s = exhale back to 1
  },
  tapScale: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(0.95)' },
    '100%': { transform: 'scale(1)' },
  },
}
```

---

## Common Animation Patterns

### Button Tap Feedback

```tsx
<button className="ease-viscous transition-transform duration-300 active:scale-95">
  {/* Scales down 5% on press */}
</button>
```

**Duration:** 300ms
**Easing:** viscous
**Transform:** `scale(0.95)` on active

---

### Fade In

```tsx
<div className="animate-fade-in">{/* Fades in over 600ms */}</div>
```

**Usage:** Content reveals, modals appearing

---

### Slide Up (Page Entrance)

```tsx
<div className="animate-slide-up">{/* Slides up from 20px below, fades in */}</div>
```

**Usage:** Page transitions, new screen entry

---

### Pulse Glow (Ambient)

```tsx
<div className="animate-pulse-glow">{/* Pulsing scale + opacity loop */}</div>
```

**Usage:** SOS button, recording indicator, loading states

---

### Breathe (Therapeutic)

```tsx
<div className="animate-breathe">{/* 4s in, 7s hold, 8s out breathing pattern */}</div>
```

**Usage:** SOS Exit Breath step, calming visualizations

---

## Framer Motion Patterns

For complex animations, use Framer Motion:

### Page Transitions

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1], // Viscous easing
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        {/* Page content */}
      </motion.div>
    </AnimatePresence>
  );
}
```

**See:** [Page Transitions Guide](../05-implementation/page-transitions.md) for detailed examples

---

### Modal/Dialog Entry

```tsx
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

<motion.div
  variants={modalVariants}
  initial="hidden"
  animate="visible"
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
  {/* Dialog content */}
</motion.div>;
```

**Duration:** 400ms
**Transforms:** Fade + scale + slide

---

### Stagger Children

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay between each child
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>;
```

**Usage:** List reveals, settings sections

---

### Drag Gesture

```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
  dragElastic={0.1}
  dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
>
  {/* Draggable element */}
</motion.div>
```

**Usage:** SOS Grounding - Touch step (scrubbing gesture)

---

## Performance Optimization

### GPU Acceleration

Always animate these properties (GPU-accelerated):

✅ **Use:**

- `transform` (translate, scale, rotate)
- `opacity`

❌ **Avoid:**

- `width`, `height` (causes reflow)
- `top`, `left`, `margin` (causes reflow)
- `background-color` (expensive)

---

### Will-Change Hint

For frequently animated elements:

```tsx
<div className="will-change-transform">{/* Hints browser to optimize for transforms */}</div>
```

**Warning:** Don't overuse - creates new layer, uses memory.

**Use only for:**

- SOS flow animations
- Continuous drags
- Page transitions

---

### Reducing Motion

Respect user's accessibility preferences:

```tsx
import { useReducedMotion } from 'framer-motion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();

  const transition = shouldReduceMotion
    ? { duration: 0.01 } // Instant
    : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }; // Viscous

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transition}>
      {/* Content */}
    </motion.div>
  );
}
```

**Accessibility:** Always check `prefers-reduced-motion` for users with vestibular disorders.

---

## Animation Testing

### Checklist

- [ ] Duration is 400ms+ (unless micro-interaction)
- [ ] Easing is viscous (`cubic-bezier(0.22, 1, 0.36, 1)`)
- [ ] No jarring snaps or instant changes
- [ ] Respects `prefers-reduced-motion`
- [ ] Runs at 60 FPS (use DevTools Performance tab)
- [ ] Uses GPU-accelerated properties (`transform`, `opacity`)

---

### DevTools

**Chrome DevTools:**

1. Open Performance tab
2. Record interaction
3. Check for jank (dropped frames)
4. Ensure animations stay above 60 FPS

**Frame rate:**

- 60 FPS = smooth (16.67ms per frame)
- 30 FPS = noticeable stutter
- <30 FPS = janky, unacceptable

---

## Common Mistakes

### ❌ Too Fast

```tsx
// BAD: 150ms is too snappy
<div className="transition-all duration-150">
```

### ✅ Correct Speed

```tsx
// GOOD: 400ms with viscous easing
<div className="transition-all duration-400 ease-viscous">
```

---

### ❌ Wrong Properties

```tsx
// BAD: Animating width causes reflow
<div className="transition-all" style={{ width: isOpen ? '300px' : '0' }}>
```

### ✅ GPU-Accelerated

```tsx
// GOOD: Transform is GPU-accelerated
<div className="transition-transform" style={{ transform: isOpen ? 'scaleX(1)' : 'scaleX(0)' }}>
```

---

### ❌ No Easing Specified

```tsx
// BAD: Default easing is linear (robotic)
<div className="transition-opacity duration-500">
```

### ✅ Viscous Easing

```tsx
// GOOD: Viscous easing feels natural
<div className="transition-opacity duration-500 ease-viscous">
```

---

## See Also

- [Design System Overview](README.md) - Quick reference
- [Design Principles](../01-vision/design-principles.md) - Viscosity Over Speed principle
- [Page Transitions Guide](../05-implementation/page-transitions.md) - Detailed Framer Motion examples
- [SOS Flow](../04-features/sos-flow.md) - Animations in the core experience
