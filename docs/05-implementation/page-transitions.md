# Page Transitions Implementation Guide

**Read this when:** Implementing page navigation, adding animated transitions, working with Framer Motion, or ensuring viscous animation feel.

---

## Overview

Page transitions in Anxiety Buddy follow the "viscous and deliberate" design principle. Every navigation should feel like moving through thick liquid—smooth, intentional, never jarring.

**Library:** Framer Motion (React animation library)

---

## Design Philosophy

### Viscosity Over Speed

From [Design Principles](../02-design-system/design-principles.md):

> "All transitions feel like moving through thick liquid. Minimum animation duration: 400ms. Preferred easing: `cubic-bezier(0.22, 1, 0.36, 1)`"

**Core Principles:**

- No jarring animations
- Smooth, deliberate motion
- Minimum 400ms duration
- Viscous easing curve

---

## Framer Motion Setup

### Installation

Already installed in project:

```bash
npm install framer-motion
```

### Basic Concepts

**Motion Components:**

- Framer Motion wraps React components with animation capabilities
- Use `motion.div`, `motion.button`, etc.

**AnimatePresence:**

- Handles exit animations when components unmount
- Critical for page transitions

**Variants:**

- Reusable animation states (initial, animate, exit)
- Keep animations consistent across app

---

## Page Transition Implementation

### Router Setup

**Location:** `/app/src/pages/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sos" element={<SOSPage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App = () => (
  <BrowserRouter>
    <MainLayout>
      <AnimatedRoutes />
    </MainLayout>
  </BrowserRouter>
);
```

**Key:**

- `mode="wait"` - Wait for exit animation before entering
- `key={location.pathname}` - Unique key triggers animation

---

### Page Wrapper Component

Create a reusable page wrapper with consistent transitions.

**Location:** `/app/src/components/layouts/PageTransition.tsx`

```typescript
import { motion } from 'framer-motion';
import type { FC, ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1], // Viscous easing
};

export const PageTransition: FC<PageTransitionProps> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className="h-full"
  >
    {children}
  </motion.div>
);
```

---

### Using PageTransition in Pages

**Example: HomePage**

```typescript
import { PageTransition } from '@/components/layouts/PageTransition';

export const HomePage = () => (
  <PageTransition>
    <div className="pt-safe bg-void-blue flex h-full flex-col px-6">
      <h1>Home</h1>
      {/* Page content */}
    </div>
  </PageTransition>
);
```

**Result:**

- Page fades in with upward motion (y: 20 → 0)
- On exit, fades out with downward motion (y: 0 → -20)
- 600ms duration with viscous easing

---

## Animation Variants

### Fade Transition

Simplest transition - opacity only.

```typescript
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
```

**Use case:** Dialogs, modals, tooltips

---

### Slide Up Transition

Enters from bottom, exits to top.

```typescript
const slideUpVariants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};
```

**Use case:** Main page transitions, forms

---

### Slide Horizontal Transition

Enters from right, exits to left (or reverse).

```typescript
const slideRightVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};
```

**Use case:** Step-by-step flows (e.g., SOS steps)

---

### Scale Transition

Subtle zoom effect.

```typescript
const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};
```

**Use case:** Dialogs, confirmation screens

---

## Easing Curves

### Viscous (Default)

**Bezier:** `cubic-bezier(0.22, 1, 0.36, 1)`

**Feel:** Slow start, smooth deceleration

**Usage:** Default for all page transitions

```typescript
transition={{ ease: [0.22, 1, 0.36, 1] }}
```

---

### Elastic

**Bezier:** `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

**Feel:** Slight overshoot, bouncy

**Usage:** Success states, playful interactions (use sparingly)

```typescript
transition={{ ease: [0.68, -0.55, 0.265, 1.55] }}
```

---

### Linear

**Easing:** `linear`

**Feel:** Constant speed

**Usage:** Loading spinners, progress bars

```typescript
transition={{ ease: 'linear' }}
```

---

## Staggered Animations

Animate multiple items with a delay between each.

**Example: List Items**

```typescript
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1, // 100ms delay between children
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

<motion.ul variants={containerVariants} initial="initial" animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

**Use case:** Vault session list, settings sections

---

## Gesture Animations

### Drag

Allow components to be dragged.

```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 300 }}
  dragElastic={0.2}
>
  Drag me
</motion.div>
```

**Use case:** Swipe-to-delete, card swiping

---

### Tap Scale

Subtle scale on press.

```typescript
<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Press Me
</motion.button>
```

**Use case:** All interactive buttons

---

### Hover Glow

Increase glow on hover (desktop).

```typescript
<motion.button
  whileHover={{ boxShadow: '0 0 40px rgba(100, 255, 218, 0.5)' }}
  transition={{ duration: 0.3 }}
  className="shadow-glow-md"
>
  Hover Me
</motion.button>
```

**Use case:** Call-to-action buttons, crisis resources

---

## SOS Flow Step Transitions

Each SOS step should have smooth, directional transitions.

**Implementation:**

```typescript
// useSOSSession.tsx
const [currentStep, setCurrentStep] = useState<SOSStep>('breach');
const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

const nextStep = () => {
  setDirection(1);
  setCurrentStep(/* next step */);
};

const prevStep = () => {
  setDirection(-1);
  setCurrentStep(/* prev step */);
};
```

**Step Transition Component:**

```typescript
const stepVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 100 : -100,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -100 : 100,
  }),
};

<motion.div
  key={currentStep}
  custom={direction}
  variants={stepVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
  {renderStep(currentStep)}
</motion.div>
```

**Result:**

- Forward: Slide in from right, exit to left
- Backward: Slide in from left, exit to right

---

## Dialog Animations

**Example: ConfirmDialog**

```typescript
import { motion } from 'framer-motion';

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => (
  <>
    {/* Backdrop */}
    <motion.div
      variants={backdropVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    />

    {/* Dialog */}
    <motion.div
      variants={dialogVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <div className="rounded-3xl bg-void-blue p-6">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </motion.div>
  </>
);
```

---

## Performance Optimization

### GPU Acceleration

Animate properties that trigger GPU acceleration:

✅ **GPU-accelerated (fast):**

- `opacity`
- `transform` (translate, scale, rotate)

❌ **Not GPU-accelerated (slow):**

- `height`, `width`
- `top`, `left`, `right`, `bottom`
- `background-color`

**Force GPU acceleration:**

```typescript
<motion.div style={{ transform: 'translateZ(0)' }}>
  {/* Content */}
</motion.div>
```

---

### Reduce Motion (Accessibility)

Respect user preference for reduced motion.

```typescript
import { useReducedMotion } from 'framer-motion';

const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  const pageVariants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      };

  return (
    <motion.div variants={pageVariants} /* ... */>
      {children}
    </motion.div>
  );
};
```

**System setting:** Users can enable "Reduce Motion" in OS accessibility settings.

---

### will-change Property

Hint browser to optimize animation.

```css
.animating-element {
  will-change: transform, opacity;
}
```

**Warning:** Use sparingly, only on actively animating elements. Overuse hurts performance.

---

## Best Practices

### DO

✅ **Use viscous easing for all transitions**

```typescript
ease: [0.22, 1, 0.36, 1];
```

✅ **Keep durations consistent**

- Page transitions: 600ms
- Micro-interactions: 200-300ms

✅ **Respect reduced motion preference**

```typescript
const shouldReduceMotion = useReducedMotion();
```

✅ **Use GPU-accelerated properties**

- `opacity`, `transform`

✅ **Test on real devices**

- Animations may lag on low-end Android devices

---

### DON'T

❌ **Use jarring, snappy transitions**

- Minimum duration: 400ms

❌ **Animate expensive properties**

- Avoid `height`, `width`, `background-color`

❌ **Overuse elastic easing**

- Reserve for celebratory moments only

❌ **Forget exit animations**

- Always include exit state in variants

❌ **Chain too many sequential animations**

- Keep flows simple, 2-3 stages max

---

## Debugging Animations

### Visual Debug Tools

**Framer Motion DevTools:**

```bash
npm install framer-motion-devtools
```

**Usage:**

```typescript
import { MotionDevTools } from 'framer-motion-devtools';

<MotionDevTools />
```

**Features:**

- Visual timeline of animations
- Inspect animation states
- Adjust timings in real-time

---

### Performance Profiling

**React DevTools Profiler:**

1. Open React DevTools
2. Go to "Profiler" tab
3. Start recording
4. Navigate between pages
5. Stop recording
6. Analyze render times

**Goal:** Page transitions should complete in <600ms total.

---

## See Also

- [Design Principles](../02-design-system/design-principles.md) - Viscosity over speed
- [SOS Flow](../04-features/sos-flow.md) - Step-by-step transitions
- [File Structure](../03-architecture/file-structure.md) - Where to place animation components
- [Performance](../07-reference/performance.md) - Animation performance targets
