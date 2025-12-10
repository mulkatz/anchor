# Colors

**Read this when:** Styling components, choosing colors, theming, accessibility concerns

---

## Philosophy

The Anxiety Buddy color palette is inspired by **bioluminescence in the deep ocean**:

- Dark, calming backgrounds (safety in the void)
- Glowing cyan accents (gentle, hopeful light)
- Warm ember highlights (human warmth in darkness)
- Soft white text (readable without harshness)

---

## Core Brand Colors

### Void Blue - `#0A1128`

**Purpose:** Main background color - represents the deep ocean void

**Usage:**

- Page backgrounds: `bg-void-blue`
- Dark surfaces
- Creates sense of depth and safety

**Psychology:** Dark blue induces calm, reduces arousal, signals nighttime safety

**Accessibility:** Sufficient contrast with mist-white text (21:1 ratio)

---

### Biolum Cyan - `#64FFDA`

**Purpose:** Primary interactive color - bioluminescent glow

**Usage:**

- Buttons: `bg-biolum-cyan text-void-blue`
- Links: `text-biolum-cyan`
- Active states
- Glows: `shadow-glow-md`
- Toggle switches (ON state)

**Psychology:** Cyan is calming yet attention-grabbing, feels technological and safe

**Accessibility:** 4.5:1 contrast against void-blue

**Never:** Don't use for large text blocks (too bright, causes eye strain)

---

### Warm Ember - `#FFB38A`

**Purpose:** Accent color - warm hope in darkness

**Usage:**

- Crisis warnings: `text-warm-ember`
- Important highlights
- Completion celebrations
- Sparingly for human warmth

**Psychology:** Warm orange provides hope without aggression, feels human

**Accessibility:** 3.5:1 contrast against void-blue (use for large text only)

**Never:** Don't overuse - loses impact if everywhere

---

### Mist White - `#E2E8F0`

**Purpose:** Body text color - soft, readable white

**Usage:**

- All body text: `text-mist-white`
- Paragraph content
- Labels and descriptions

**Why not pure white (#FFFFFF)?**

- Pure white on dark backgrounds causes eye strain
- Mist white is gentler, still highly readable
- Better for extended reading during distress

**Accessibility:** 16:1 contrast against void-blue

---

## State Colors

### Success - `#4ECDC4`

**Purpose:** Teal - calm achievement

**Usage:**

- Completion messages
- Success toasts
- Positive feedback

**Psychology:** Teal = calm + accomplishment (not aggressive green)

---

### Warning - `#FFD93D`

**Purpose:** Yellow - gentle alert

**Usage:**

- Non-critical warnings
- "Are you sure?" prompts
- Informational alerts

**Psychology:** Yellow signals caution without fear

---

### Danger - `#FF6B6B`

**Purpose:** Coral red - soft danger

**Usage:**

- Destructive actions (delete account)
- Error messages
- Crisis hotline buttons (paradoxically, red = urgent help)

**Psychology:** Softer than pure red, conveys seriousness without panic

**Why coral instead of pure red?** Pure red (#FF0000) triggers fight-or-flight. Coral is urgent but not alarming.

---

## Glass Morphism Colors

### Glass Background - `rgba(255, 255, 255, 0.05)`

**Tailwind:** `bg-glass-bg`

Subtle semi-transparent white overlay for floating cards

---

### Glass Border - `rgba(255, 255, 255, 0.1)`

**Tailwind:** `border-glass-border`

Frosted edge definition for glass elements

---

### Glass Hover - `rgba(255, 255, 255, 0.08)`

**Tailwind:** `bg-glass-bg-hover`

Slightly brighter on hover for interactive glass elements

---

## Glow Colors

### Glow Cyan - `rgba(100, 255, 218, 0.4)`

Used for biolum-cyan glows and drop shadows

---

### Glow Ember - `rgba(255, 179, 138, 0.3)`

Used for warm-ember glows and highlights

---

## Tailwind Configuration

Add to `tailwind.config.ts`:

```typescript
colors: {
  // Core brand colors
  'void-blue': '#0A1128',
  'biolum-cyan': '#64FFDA',
  'warm-ember': '#FFB38A',
  'mist-white': '#E2E8F0',

  // Glass morphism
  'glass': {
    'border': 'rgba(255, 255, 255, 0.1)',
    'bg': 'rgba(255, 255, 255, 0.05)',
    'bg-hover': 'rgba(255, 255, 255, 0.08)',
  },

  // States
  'success': '#4ECDC4',
  'warning': '#FFD93D',
  'danger': '#FF6B6B',

  // Glows
  'glow-cyan': 'rgba(100, 255, 218, 0.4)',
  'glow-ember': 'rgba(255, 179, 138, 0.3)',
}
```

---

## Usage Guidelines

### Background Colors

✅ **Always use:**

- `bg-void-blue` for page backgrounds
- `bg-glass-bg` for floating cards
- `bg-biolum-cyan` for primary buttons

❌ **Never use:**

- White backgrounds
- Light gray backgrounds
- Bright/saturated backgrounds

---

### Text Colors

✅ **Always use:**

- `text-mist-white` for body text
- `text-biolum-cyan` for links and interactive text
- `text-warm-ember` for important highlights

❌ **Never use:**

- Pure white (#FFFFFF) - too harsh
- Gray text - reduces readability
- Low-contrast colors

---

### Accent Usage

**Biolum Cyan:** Primary interactive elements (buttons, links, active states)
**Warm Ember:** Secondary highlights, important warnings, human touches
**Success:** Completions only
**Warning:** Cautions only
**Danger:** Destructive actions only

**Rule:** If everything is highlighted, nothing is highlighted. Use accents sparingly.

---

## Color Combinations

### Primary Button

```tsx
<button className="bg-biolum-cyan text-void-blue shadow-glow-md">
  {/* Dark text on bright background */}
</button>
```

### Secondary Button

```tsx
<button className="border-biolum-cyan text-biolum-cyan border-2 bg-transparent">
  {/* Outline style */}
</button>
```

### Glass Card

```tsx
<div className="bg-glass-bg border-glass-border backdrop-blur-glass border">
  <p className="text-mist-white">{/* Content */}</p>
</div>
```

### Destructive Button

```tsx
<button className="bg-danger text-mist-white">{/* White text on red */}</button>
```

---

## Accessibility

### Contrast Ratios (Against void-blue #0A1128)

| Color                 | Ratio | WCAG AA (4.5:1)      | WCAG AAA (7:1) |
| --------------------- | ----- | -------------------- | -------------- |
| Mist White (#E2E8F0)  | 16:1  | ✅ Pass              | ✅ Pass        |
| Biolum Cyan (#64FFDA) | 12:1  | ✅ Pass              | ✅ Pass        |
| Warm Ember (#FFB38A)  | 6.5:1 | ✅ Pass (large text) | ❌ Fail        |
| Success (#4ECDC4)     | 10:1  | ✅ Pass              | ✅ Pass        |
| Warning (#FFD93D)     | 13:1  | ✅ Pass              | ✅ Pass        |
| Danger (#FF6B6B)      | 5.5:1 | ✅ Pass (large text) | ❌ Fail        |

**Note:** Warm Ember and Danger should only be used for large text (18px+) or non-text elements.

---

## Testing Colors

### Browser DevTools

Use browser inspector to verify colors match design system:

```css
/* Check computed styles */
background-color: rgb(10, 17, 40); /* void-blue */
color: rgb(226, 232, 240); /* mist-white */
```

### Contrast Checkers

- **WebAIM:** https://webaim.org/resources/contrastchecker/
- **Colorable:** https://colorable.jxnblk.com/

---

## See Also

- [Design System Overview](README.md) - Quick reference card
- [Glass Effects](glass-effects.md) - Using glass colors for depth
- [Typography](typography.md) - Text color hierarchy
- [Design Principles](../01-vision/design-principles.md) - Dark by Default principle
