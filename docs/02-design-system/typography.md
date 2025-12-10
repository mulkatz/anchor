# Typography

**Read this when:** Typography decisions, text hierarchy, readability concerns, mobile layouts

---

## Philosophy

Typography in Anxiety Buddy prioritizes **mobile readability** during cognitive overload:

- **Large enough** to read during visual disturbances (panic can blur vision)
- **Clear hierarchy** so users know what's important
- **Generous line height** for breathing room
- **System fonts** for native feel and fast loading

---

## Font Families

### Sans Serif (Default)

```typescript
fontFamily: {
  sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
}
```

**Primary:** Inter (web font, loaded from Google Fonts)
**Fallback:** SF Pro Display (iOS), system-ui (Android/system default), sans-serif

**Why Inter?**

- Designed for screens
- Excellent readability at small sizes
- Neutral, professional feel
- Wide language support

**Usage:** All UI text, body copy, headings

---

### Monospace

```typescript
fontFamily: {
  mono: ['SF Mono', 'Menlo', 'Monaco', 'monospace'],
}
```

**Usage:**

- Code snippets (rare in this app)
- Version numbers
- Technical data

**Rarely used** - only when monospace spacing is needed.

---

## Font Size Scale

### Mobile-First Approach

Designed for mobile screens (375px - 428px wide). Scales up on tablets/desktop.

| Size Name | Rem      | Pixels | Line Height    | Usage                          | Tailwind Class |
| --------- | -------- | ------ | -------------- | ------------------------------ | -------------- |
| **xs**    | 0.75rem  | 12px   | 1rem (16px)    | Captions, metadata, timestamps | `text-xs`      |
| **sm**    | 0.875rem | 14px   | 1.25rem (20px) | Small labels, secondary text   | `text-sm`      |
| **base**  | 1rem     | 16px   | 1.5rem (24px)  | Body text (default)            | `text-base`    |
| **lg**    | 1.125rem | 18px   | 1.75rem (28px) | Emphasized text, large labels  | `text-lg`      |
| **xl**    | 1.25rem  | 20px   | 1.75rem (28px) | Section headers                | `text-xl`      |
| **2xl**   | 1.5rem   | 24px   | 2rem (32px)    | Page titles                    | `text-2xl`     |
| **3xl**   | 1.875rem | 30px   | 2.25rem (36px) | Large headings, hero text      | `text-3xl`     |
| **4xl**   | 2.25rem  | 36px   | 2.5rem (40px)  | Extra large hero text          | `text-4xl`     |

---

## Tailwind Configuration

Add to `tailwind.config.ts`:

```typescript
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'base': ['1rem', { lineHeight: '1.5rem' }],
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
}
```

---

## Typography Hierarchy

### Page Title (H1)

```tsx
<h1 className="text-mist-white text-2xl font-semibold">Profile</h1>
```

**Size:** `text-2xl` (24px)
**Weight:** `font-semibold` (600)
**Color:** `text-mist-white`

**Usage:** Page headers, primary screen titles

---

### Section Header (H2)

```tsx
<h2 className="text-mist-white text-xl font-medium">App Preferences</h2>
```

**Size:** `text-xl` (20px)
**Weight:** `font-medium` (500)
**Color:** `text-mist-white`

**Usage:** Section dividers, card headers

---

### Subsection Header (H3)

```tsx
<h3 className="text-mist-white text-lg font-medium">Therapeutic Haptics</h3>
```

**Size:** `text-lg` (18px)
**Weight:** `font-medium` (500)
**Color:** `text-mist-white`

**Usage:** Setting labels, subsection titles

---

### Body Text

```tsx
<p className="text-mist-white text-base">This is body text for instructions and descriptions.</p>
```

**Size:** `text-base` (16px) - **Default**
**Weight:** `font-normal` (400)
**Color:** `text-mist-white`

**Usage:** All body copy, paragraphs, instructions

---

### Small Text

```tsx
<p className="text-mist-white/70 text-sm">This is secondary descriptive text.</p>
```

**Size:** `text-sm` (14px)
**Weight:** `font-normal` (400)
**Color:** `text-mist-white/70` (70% opacity for subtle)

**Usage:** Descriptions, help text, secondary info

---

### Caption / Metadata

```tsx
<span className="text-mist-white/50 text-xs">2 mins ago</span>
```

**Size:** `text-xs` (12px)
**Weight:** `font-normal` (400)
**Color:** `text-mist-white/50` (50% opacity for deemphasized)

**Usage:** Timestamps, version numbers, captions

---

## Font Weights

| Weight       | Value | Tailwind Class  | Usage                                       |
| ------------ | ----- | --------------- | ------------------------------------------- |
| **Normal**   | 400   | `font-normal`   | Body text (default)                         |
| **Medium**   | 500   | `font-medium`   | Labels, setting rows, emphasized text       |
| **Semibold** | 600   | `font-semibold` | Page titles, buttons                        |
| **Bold**     | 700   | `font-bold`     | **Rarely used** - only for extreme emphasis |

**Rule:** Never go below 400 (normal) - lighter weights are hard to read on dark backgrounds.

---

## Line Height

Line heights are built into the font size scale (see table above).

**Why generous line heights?**

- Easier to scan during cognitive overload
- Reduces visual density
- Improves comprehension under stress

**Minimum line height:** 1.5× font size for body text

---

## Letter Spacing

**Default:** Use browser defaults (no custom letter spacing)

**Exception:** ALL-CAPS text should use `tracking-wider` (0.05em) for readability.

```tsx
<span className="text-sm uppercase tracking-wider">Emergency</span>
```

---

## Text Alignment

### Default: Left-aligned

```tsx
<p className="text-left">Body text is left-aligned by default.</p>
```

**Why?** Easiest to scan on mobile, especially for multi-line text.

---

### Center-aligned

```tsx
<h1 className="text-center">Page Title</h1>
```

**Usage:**

- Page titles
- Short instructions (SOS flow)
- Dialog headers

**Never:** Don't center long paragraphs - hard to scan.

---

### Right-aligned

**Rarely used.** Only for metadata in specific layouts (e.g., timestamps in chat bubbles).

---

## Text Colors

| Usage                 | Color          | Tailwind Class       |
| --------------------- | -------------- | -------------------- |
| **Primary text**      | Mist White     | `text-mist-white`    |
| **Secondary text**    | Mist White 70% | `text-mist-white/70` |
| **Deemphasized text** | Mist White 50% | `text-mist-white/50` |
| **Interactive text**  | Biolum Cyan    | `text-biolum-cyan`   |
| **Important text**    | Warm Ember     | `text-warm-ember`    |
| **Error text**        | Danger         | `text-danger`        |

**See:** [Colors Guide](colors.md) for detailed color usage

---

## Mobile Readability

### Minimum Font Sizes

- **Body text:** 16px minimum (text-base)
- **Small text:** 14px minimum (text-sm)
- **Captions:** 12px minimum (text-xs)

**Never go below 12px** - unreadable on mobile, especially during panic.

---

### Touch Targets

When text is clickable, ensure sufficient touch target size:

```tsx
<button className="px-6 py-3 text-base">{/* Minimum 44×44px touch target */}</button>
```

**iOS guideline:** 44×44px minimum
**Android guideline:** 48×48dp minimum
**Our target:** 48×48px minimum

---

## Truncation & Overflow

### Single-line truncation

```tsx
<p className="truncate text-base">This text will truncate with ellipsis if too long...</p>
```

**Usage:** Labels that must fit on one line

---

### Multi-line truncation

```tsx
<p className="line-clamp-2 text-base">This text will truncate after 2 lines with an ellipsis...</p>
```

**Usage:** Preview text in cards (requires `@tailwindcss/line-clamp` plugin)

---

### Wrap behavior

```tsx
<p className="break-words text-base">This text will wrap long words to prevent overflow.</p>
```

**Usage:** User-generated content, URLs

---

## Special Cases

### All-Caps

```tsx
<span className="text-xs font-medium uppercase tracking-wider">SOS</span>
```

**Usage:** Labels, badges, status indicators
**Always add:** `tracking-wider` for readability

---

### Links

```tsx
<a href="#" className="text-biolum-cyan hover:text-biolum-cyan/80 underline">
  Learn more
</a>
```

**Color:** `text-biolum-cyan`
**Decoration:** `underline` (for accessibility)
**Hover:** Slightly dimmed

---

### Emphasized Text

```tsx
<p className="text-mist-white text-base">
  This is <strong className="text-biolum-cyan font-semibold">important</strong>.
</p>
```

**Method 1:** `font-semibold` for weight emphasis
**Method 2:** `text-biolum-cyan` for color emphasis
**Method 3:** Both for maximum emphasis

**Never use:** `<em>` or italics - harder to read on mobile

---

## Accessibility

### Text Contrast

All text must meet **WCAG AA** contrast ratio (4.5:1 for normal text, 3:1 for large text).

**Our ratios against void-blue:**

- Mist white (100%): 16:1 ✅
- Mist white (70%): 11.2:1 ✅
- Mist white (50%): 8:1 ✅
- Biolum cyan: 12:1 ✅

**All pass AAA** (7:1 ratio).

---

### Font Size for Accessibility

**Minimum:** 16px (1rem) for body text
**Zoom support:** Use rem units (respects user's browser font size)
**Never:** Use px for font sizes in CSS (use Tailwind classes)

---

## Common Patterns

### Setting Row Label

```tsx
<span className="text-mist-white text-base font-medium">Therapeutic Haptics</span>
```

---

### Setting Row Description

```tsx
<p className="text-mist-white/70 text-sm">Physical feedback to help ground you during anxiety</p>
```

---

### Dialog Title

```tsx
<h2 className="text-mist-white text-center text-xl font-semibold">Delete Account</h2>
```

---

### Button Label

```tsx
<button className="text-base font-semibold">Continue</button>
```

---

### Timestamp

```tsx
<span className="text-mist-white/50 text-xs">2 mins ago</span>
```

---

## See Also

- [Design System Overview](README.md) - Quick reference
- [Colors](colors.md) - Text color usage
- [Design Principles](../01-vision/design-principles.md) - Minimal Text principle
- [i18n Guide](../05-implementation/i18n-guide.md) - Translation and localization
