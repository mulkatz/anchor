# Design Principles

**Read this when:** Building UI, reviewing designs, making UX decisions, resolving design debates

---

These 5 principles guide every design decision in Anchor: Anxiety Navigator. When in doubt, return to these.

---

## 1. Viscosity Over Speed

**Principle:** All motion should feel like moving through thick liquid. Never jarring, never snappy.

### Why

During panic, sudden movements trigger startle responses. Slow, deliberate motion signals safety.

### Implementation

- **Minimum animation duration:** 400ms
- **Preferred easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (viscous ease-out)
- **Page transitions:** 600-800ms
- **Micro-interactions:** 300-400ms

### Examples

✅ **Good:** Button scales down over 300ms with viscous easing
❌ **Bad:** Button snaps to pressed state instantly

✅ **Good:** Page fades in over 600ms while sliding up slowly
❌ **Bad:** Page pops in with 150ms fade

**See:** [Animations Guide](../02-design-system/animations.md)

---

## 2. Haptics as Therapy

**Principle:** Haptic feedback is not UI candy. It is a grounding tool.

### Why

Touch is the most reliable sense during panic. Haptics provide tangible, physical presence when everything else feels unreal.

### Types & Usage

| Haptic Type       | When to Use                     | Purpose                                  |
| ----------------- | ------------------------------- | ---------------------------------------- |
| **Heavy Impact**  | Crisis moments (SOS trigger)    | Acknowledge distress, break dissociation |
| **Medium Impact** | Completion, success             | Positive reinforcement, closure          |
| **Light Impact**  | UI interactions (taps, swipes)  | Confirm action, maintain presence        |
| **Selection**     | Continuous feedback (scrubbing) | Tactile grounding, slow movement         |

### Implementation

Every user interaction should have appropriate haptic feedback. Ask: "What does this action need the user to _feel_?"

**See:** [Haptics Guide](../05-implementation/haptics.md)

---

## 3. Dark by Default

**Principle:** Background is always void-blue (#0A1128). Text is always mist-white (#E2E8F0). No light mode.

### Why

- **Nighttime use:** Anxiety/panic often peaks at night
- **Non-stimulating:** Bright colors trigger arousal, dark colors calm
- **Rejects wellness culture:** Bright "happy" apps feel invalidating
- **Easier on eyes:** Reduces strain during distress

### Implementation

- Always use `bg-void-blue` for backgrounds
- Always use `text-mist-white` for body text
- Use biolum-cyan (#64FFDA) for interactive elements
- Use warm-ember (#FFB38A) for accents sparingly

### Never

❌ Don't add a light mode toggle
❌ Don't use white/light backgrounds
❌ Don't use bright, saturated colors except as glows

**See:** [Colors Guide](../02-design-system/colors.md)

---

## 4. Glass Morphism Everywhere

**Principle:** Floating UI elements use frosted glass effects. Layering creates depth perception.

### Why

- **Depth without shadows:** Harsh drop shadows feel aggressive
- **Subtle hierarchy:** Glass layers suggest organization without shouting
- **Bioluminescent aesthetic:** Glass + glow = underwater feeling
- **Non-intrusive:** Semi-transparent UI doesn't block content

### Implementation

- **Backdrop blur:** `backdrop-blur-glass` (12px) or `backdrop-blur-glass-heavy` (24px)
- **Background:** `bg-glass-bg` (rgba(255, 255, 255, 0.05))
- **Border:** `border-glass-border` (rgba(255, 255, 255, 0.1))
- **Layering:** Multiple glass elements create depth

### Common Patterns

- **GlassCard:** Container for content sections
- **Floating nav:** Bottom navigation with glass background
- **Dialogs/modals:** Glass cards over dark backdrop
- **Settings rows:** Glass containers with hover states

**See:** [Glass Effects Guide](../02-design-system/glass-effects.md)

---

## 5. Minimal Text

**Principle:** Instructions should be 5 words or less. Assume user is in cognitive overload.

### Why

During panic attacks:

- Reading comprehension drops
- Working memory is impaired
- Focus is extremely limited
- Long text causes anxiety

### Implementation

**Good examples:**

- "Tap 5 things you see." (5 words)
- "Feel the texture." (3 words)
- "Breathe with the circle." (4 words)
- "I've got you." (3 words)

**Bad examples:**

- "Please tap on the screen five times to identify things you can see around you." (15 words)
- "Take a moment to feel the texture of the screen as you move your finger slowly across it." (18 words)

### Guidelines

1. **Imperative voice:** "Tap" not "You should tap"
2. **Present tense:** "Breathe" not "You will breathe"
3. **Active voice:** "Move your finger" not "Your finger should be moved"
4. **No explanations:** Instructions only, no "why" during the experience
5. **Icons + text:** Combine visual and verbal cues

### Exceptions

- Crisis resources (safety information must be complete)
- Error messages (clarity is critical)
- Legal text (disclaimer, privacy policy)

**See:** [i18n Guide](../05-implementation/i18n-guide.md) for translation guidelines

---

## Applying These Principles

### Decision Framework

When designing a new feature, ask:

1. **Viscosity:** Are animations slow and deliberate? (400ms+ minimum)
2. **Haptics:** Does every interaction have appropriate tactile feedback?
3. **Dark:** Is the background void-blue? Is text mist-white?
4. **Glass:** Are floating elements using frosted glass effects?
5. **Minimal:** Is text 5 words or less? Can I use an icon instead?

If the answer to any is "no," revise the design.

### Conflicts

If principles conflict (rare), prioritize in this order:

1. **Haptics as Therapy** (most critical for panic relief)
2. **Minimal Text** (cognitive overload is real)
3. **Viscosity Over Speed** (safety through motion)
4. **Glass Morphism** (aesthetic, less critical)
5. **Dark by Default** (aesthetic, less critical)

---

## See Also

- [Manifest](manifest.md) - Project vision and target audience
- [Design System Overview](../02-design-system/README.md) - Quick reference for colors, typography, animations
- [SOS Flow](../04-features/sos-flow.md) - See principles applied in the core feature
