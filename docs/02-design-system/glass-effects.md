# Glass Effects

**Read this when:** Creating glass UI elements, adding depth/layering, designing floating components

---

## Philosophy

Glass morphism creates depth without harsh shadows. It's central to the "Bioluminescence in the Deep" aesthetic - frosted glass surfaces with subtle glows, like looking through layers of water.

**Core Principle:** Glass Morphism Everywhere ([Design Principles](../01-vision/design-principles.md#4-glass-morphism-everywhere))

---

## What is Glass Morphism?

Glass morphism combines:

1. **Semi-transparent background** - Shows content behind
2. **Backdrop blur** - Frosted glass effect
3. **Subtle border** - Defines edges
4. **Soft shadows/glows** - Adds depth

**Result:** Floating elements that feel light, layered, and non-intrusive.

---

## Core Components

### 1. Backdrop Blur

Creates the frosted glass effect.

#### Standard Glass

```css
backdrop-blur-glass /* 12px blur */
```

**Usage:** Most floating elements (cards, nav bar, dialogs)

#### Heavy Glass

```css
backdrop-blur-glass-heavy /* 24px blur */
```

**Usage:** Modal overlays, important dialogs

---

### 2. Semi-Transparent Background

```css
bg-glass-bg /* rgba(255, 255, 255, 0.05) */
bg-glass-bg-hover /* rgba(255, 255, 255, 0.08) */
```

**Why 5% white?**

- Visible against void-blue background
- Subtle, not overpowering
- Lets background content show through

---

### 3. Glass Border

```css
border-glass-border /* rgba(255, 255, 255, 0.1) */
```

**Why needed?**

- Defines edges of glass element
- Without border, glass blends into background
- 10% white is visible but not harsh

---

### 4. Shadows & Glows

#### Glass Shadow (Depth)

```css
shadow-glass /* 0 8px 32px rgba(0, 0, 0, 0.3) */
```

**Purpose:** Adds depth, makes element feel elevated

---

#### Bioluminescent Glows

```css
shadow-glow-sm /* 0 0 10px rgba(100, 255, 218, 0.3) */
shadow-glow-md /* 0 0 20px rgba(100, 255, 218, 0.4) */
shadow-glow-lg /* 0 0 40px rgba(100, 255, 218, 0.5) */
```

**Purpose:** Adds bioluminescent glow to interactive elements

---

## Tailwind Configuration

Add to `tailwind.config.ts`:

```typescript
backdropBlur: {
  'glass': '12px',
  'glass-heavy': '24px',
},

boxShadow: {
  'glow-sm': '0 0 10px rgba(100, 255, 218, 0.3)',
  'glow-md': '0 0 20px rgba(100, 255, 218, 0.4)',
  'glow-lg': '0 0 40px rgba(100, 255, 218, 0.5)',
  'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
  'inner-glow': 'inset 0 0 20px rgba(100, 255, 218, 0.2)',
},

dropShadow: {
  'glow': '0 0 8px rgba(100, 255, 218, 0.6)',
  'glow-strong': '0 0 16px rgba(100, 255, 218, 0.8)',
},
```

---

## Common Patterns

### Basic Glass Card

```tsx
<div className="border-glass-border bg-glass-bg backdrop-blur-glass rounded-3xl border p-6">
  <p className="text-mist-white">Content here</p>
</div>
```

**Breakdown:**

- `rounded-3xl` - Large border radius (24px)
- `border border-glass-border` - 1px frosted edge
- `bg-glass-bg` - Semi-transparent white background
- `backdrop-blur-glass` - 12px blur effect
- `p-6` - 24px padding

**Usage:** Setting sections, content cards, floating containers

---

### Glass Card with Shadow

```tsx
<div className="border-glass-border bg-glass-bg backdrop-blur-glass shadow-glass rounded-3xl border p-6">
  {/* Content */}
</div>
```

**Added:** `shadow-glass` for depth

**Usage:** More prominent cards, elevated elements

---

### Interactive Glass Button

```tsx
<button className="border-glass-border bg-glass-bg backdrop-blur-glass ease-viscous hover:bg-glass-bg-hover hover:shadow-glow-md rounded-2xl border px-6 py-3 transition-all duration-300">
  {/* Label */}
</button>
```

**Hover effects:**

- Background lightens slightly (`hover:bg-glass-bg-hover`)
- Adds bioluminescent glow (`hover:shadow-glow-md`)
- Smooth transition (300ms viscous)

**Usage:** Secondary buttons, non-primary actions

---

### Glass Dialog Overlay

```tsx
<div className="bg-void-blue/80 backdrop-blur-glass-heavy fixed inset-0 z-[9998]">
  <div className="flex h-full items-center justify-center p-6">
    <div className="border-glass-border bg-glass-bg backdrop-blur-glass shadow-glass w-full max-w-md rounded-3xl border p-8">
      {/* Dialog content */}
    </div>
  </div>
</div>
```

**Two glass layers:**

1. **Backdrop:** Heavy blur (24px) + dark tint
2. **Dialog card:** Standard glass card

**Usage:** Modals, important dialogs

---

### Floating Navigation Bar

```tsx
<nav className="border-glass-border bg-glass-bg backdrop-blur-glass pb-safe fixed bottom-0 left-0 right-0 border-t">
  <div className="flex items-center justify-around px-6 py-4">{/* Nav items */}</div>
</nav>
```

**Features:**

- Glass background with blur
- Top border for definition
- Safe area padding (`pb-safe`)

**Usage:** Bottom navigation (FloatingDock component)

---

## Layering & Depth

Glass morphism creates depth through **layering**. Each layer is slightly elevated.

### Layer Hierarchy

| Layer Level        | z-index | Usage           | Example          |
| ------------------ | ------- | --------------- | ---------------- |
| **Background**     | 0       | Page background | `bg-void-blue`   |
| **Content**        | 1       | Main content    | Text, images     |
| **Floating Cards** | 10      | Glass cards     | Setting sections |
| **Navigation**     | 50      | Floating nav    | Bottom nav bar   |
| **Overlays**       | 9998    | Modal backdrops | Dialog backdrop  |
| **Dialogs**        | 9999    | Modal content   | Dialog cards     |

### Stacking Glass Elements

```tsx
<div className="relative">
  {/* Layer 1: Background */}
  <div className="bg-void-blue p-6">
    {/* Layer 2: First glass card */}
    <div className="border-glass-border bg-glass-bg backdrop-blur-glass rounded-3xl border p-6">
      <p>First layer</p>

      {/* Layer 3: Nested glass card */}
      <div className="border-glass-border bg-glass-bg backdrop-blur-glass mt-4 rounded-2xl border p-4">
        <p>Second layer (elevated)</p>
      </div>
    </div>
  </div>
</div>
```

**Effect:** Nested glass creates sense of depth

---

## Glow Effects

### Static Glow

```tsx
<div className="bg-biolum-cyan shadow-glow-md rounded-3xl">{/* Bioluminescent element */}</div>
```

**Usage:** SOS button, primary interactive elements

---

### Pulsing Glow

```tsx
<div className="bg-biolum-cyan shadow-glow-md animate-pulse-glow rounded-3xl">
  {/* Pulsing bioluminescent element */}
</div>
```

**Usage:** Recording indicator, SOS button on active, loading states

---

### Hover Glow

```tsx
<button className="bg-glass-bg hover:shadow-glow-lg rounded-2xl transition-shadow duration-300">
  {/* Glows on hover */}
</button>
```

**Usage:** Interactive cards, buttons, clickable elements

---

### Inner Glow

```tsx
<div className="shadow-inner-glow rounded-3xl">{/* Inset glow effect */}</div>
```

**Usage:** Rare - active states, focused inputs

---

## Border Radius

Glass elements use large border radii for organic feel.

| Size         | Value | Usage                   | Class            |
| ------------ | ----- | ----------------------- | ---------------- |
| **Standard** | 24px  | Cards, sections         | `rounded-3xl`    |
| **Compact**  | 16px  | Buttons, small elements | `rounded-2xl`    |
| **Large**    | 32px  | Hero cards, modals      | `rounded-[32px]` |

**Never:** Don't use sharp corners (`rounded-none`) - feels harsh

---

## Performance Considerations

### Backdrop Blur is Expensive

Backdrop blur is GPU-intensive. Optimize:

1. **Limit layers:** Max 2-3 blurred elements on screen
2. **Reduce blur radius:** Use 12px (glass) not 24px (glass-heavy) when possible
3. **Avoid animating blur:** Don't transition backdrop-blur values
4. **Use will-change sparingly:** Only for frequently scrolled elements

### Example: Optimized Floating Nav

```tsx
<nav className="backdrop-blur-glass fixed bottom-0 will-change-transform">
  {/* will-change hints browser to optimize */}
</nav>
```

---

## Browser Support

### Backdrop Blur Support

- ✅ **Safari:** Full support
- ✅ **Chrome/Edge:** Full support (v76+)
- ✅ **Firefox:** Full support (v103+)
- ⚠️ **Older browsers:** Falls back to semi-transparent background

### Fallback for Unsupported Browsers

```tsx
<div className="bg-glass-bg backdrop-blur-glass supports-[backdrop-filter]:bg-glass-bg">
  {/* Fallback: solid background if backdrop-blur not supported */}
</div>
```

**Our approach:** Don't worry about fallback - all target browsers support backdrop-blur.

---

## Accessibility

### Contrast on Glass

Glass elements reduce contrast. Ensure text remains readable:

✅ **Good:**

```tsx
<div className="bg-glass-bg backdrop-blur-glass">
  <p className="text-mist-white">{/* 16:1 contrast */}</p>
</div>
```

❌ **Bad:**

```tsx
<div className="bg-glass-bg backdrop-blur-glass">
  <p className="text-mist-white/30">{/* Low contrast, hard to read */}</p>
</div>
```

**Rule:** Always use full opacity text (`text-mist-white`) on glass backgrounds.

---

## Common Mistakes

### ❌ Too Much Blur

```tsx
// BAD: Excessive blur looks messy
<div className="backdrop-blur-[50px]">
```

### ✅ Appropriate Blur

```tsx
// GOOD: 12px is sufficient
<div className="backdrop-blur-glass">
```

---

### ❌ No Border

```tsx
// BAD: Glass blends into background
<div className="bg-glass-bg backdrop-blur-glass">
```

### ✅ With Border

```tsx
// GOOD: Border defines edges
<div className="border border-glass-border bg-glass-bg backdrop-blur-glass">
```

---

### ❌ Sharp Corners

```tsx
// BAD: Harsh, doesn't match aesthetic
<div className="rounded-none bg-glass-bg">
```

### ✅ Rounded Corners

```tsx
// GOOD: Organic, soft
<div className="rounded-3xl bg-glass-bg">
```

---

## See Also

- [Design System Overview](README.md) - Quick reference
- [Colors](colors.md) - Glass color values
- [Design Principles](../01-vision/design-principles.md) - Glass Morphism Everywhere principle
- [Animations](animations.md) - Animating glass elements
