# SOS Flow - 7-Step Panic De-escalation

**Read this when:** Implementing or modifying the core SOS panic de-escalation feature, designing the multi-sensory grounding experience, or understanding the therapeutic state machine.

---

## Overview

The SOS Flow is the heart of Anxiety Buddy. A guided, multi-sensory experience designed to ground users during panic attacks. Built on evidence-based CBT and somatic grounding techniques.

**Status:** 🚧 In Progress

---

## State Machine Architecture

The SOS Flow is implemented as a 7-step state machine. Each step is designed to engage different senses and progressively de-escalate panic.

**Flow Duration:** Approximately 2-3 minutes total

**Completion Target:** > 80% completion rate

---

## Step 1: The Breach (Trigger)

### Purpose

Immediate acknowledgement of distress. The moment the user signals they need help.

### User Action

Long-press the SOS button (2 seconds)

### Haptic Feedback

- **Type:** Heavy Impact
- **Pattern:** Strong, single pulse
- **Intent:** Physical acknowledgment of the crisis moment

### Visual Design

- Screen darkens dramatically
- SOS button pulses with cyan glow (`biolum-cyan`)
- Ripple animation emanates from button
- Smooth transition to Step 2

### Implementation Notes

- Use `Haptics.impact({ style: ImpactStyle.Heavy })`
- Require full 2-second press to prevent accidental triggers
- Visual feedback starts at 0.5s to show progress

---

## Step 2: Acknowledgement

### Purpose

Establish safety and presence. Let the user know they're not alone.

### Screen Text

"I've got you."

### Haptic Feedback

- **Type:** Rhythmic pattern
- **Pattern:** Heartbeat at 60 BPM (1 pulse per second)
- **Duration:** 5 seconds
- **Intent:** Physical grounding through rhythmic feedback

### Visual Design

- Soft breathing animation (slow, gentle expansion/contraction)
- Text fades in smoothly
- Calming bioluminescent glow
- No user interaction required (auto-advance)

### Duration

5 seconds (auto-advance)

### Implementation Notes

- Use `setInterval` for heartbeat pattern
- Breathing animation: 4s cycle (2s expand, 2s contract)
- Framer Motion for smooth text fade-in

---

## Step 3: Grounding - SIGHT

### Purpose

Engage visual cortex to break panic loop. Based on 5-4-3-2-1 grounding technique.

### Instruction

"Tap 5 things you can see."

### User Action

Tap screen 5 times (anywhere)

### Haptic Feedback

- **Type:** Light Impact
- **Pattern:** Crisp click on each tap
- **Intent:** Confirmation feedback for each interaction

### Visual Design

- Ripple effect emanates from each tap point
- Counter displays progress (1/5, 2/5, etc.)
- Each ripple fades slowly (2s duration)
- Layered ripples create depth

### Completion

After 5 taps, auto-advance to Step 4

### Implementation Notes

- Track tap count in state
- Ripple component uses Framer Motion
- Position ripples absolutely at tap coordinates
- Use `event.clientX` and `event.clientY` for positioning

---

## Step 4: Grounding - TOUCH

### Purpose

Engage tactile sense, slow down movements. Somatic grounding through physical interaction.

### Instruction

"Feel the texture. Move your finger slowly."

### User Action

Drag finger across screen (scrubbing motion)

### Haptic Feedback

- **Type:** Selection feedback
- **Pattern:** Continuous, gritty vibration while dragging
- **Intent:** Simulated texture feedback

### Visual Design

- Particle trail follows finger movement
- Glass texture overlay appears
- Particles fade slowly (3s lifetime)
- Textured background suggests tactile surface

### Completion

Drag for 10 seconds total (cumulative)

### Implementation Notes

- Use `Haptics.selectionStart()` on touch start
- `Haptics.selectionChanged()` continuously while dragging
- `Haptics.selectionEnd()` on touch end
- Track total drag duration across multiple touches
- Particle system uses Canvas or SVG

---

## Step 5: Grounding - SOUND

### Purpose

Auditory grounding, sensory reset. Create safe, womb-like auditory environment.

### Instruction

"Close your eyes. Just listen."

### User Action

None (passive listening)

### Haptic Feedback

None (silence - intentional contrast)

### Visual Design

- Screen fades to near-black
- Minimal pulsing orb at center (slow, gentle)
- No text after initial instruction fades
- Focus shifts entirely to sound

### Audio

Pink noise (soft, womb-like ambient sound)

### Duration

20 seconds (auto-advance)

### Implementation Notes

- Pink noise audio file in `/app/src/assets/sounds/`
- Fade audio in over 2s
- Maintain constant volume
- Fade out over 2s before advancing
- Orb animation: 4s cycle, subtle opacity changes

---

## Step 6: The Exit Breath

### Purpose

Activate parasympathetic nervous system through 4-7-8 breathing technique (Dr. Andrew Weil).

### Instruction

"Breathe with the circle."

### User Action

Follow animation for 3 cycles

### Visual Design

- Expanding/contracting circle
- **Inhale:** Circle expands (4 seconds)
- **Hold:** Circle pauses at max size (7 seconds)
- **Exhale:** Circle contracts (8 seconds)
- Cycle counter: "Cycle 1 of 3"

### Haptic Feedback

- **Inhale:** Gentle, building swell
- **Hold:** Silence
- **Exhale:** Gradual fade
- **Intent:** Physical cue for breathing rhythm

### Duration

57 seconds total (3 × 19s cycles)

### Implementation Notes

- Use Framer Motion for smooth circle scaling
- Haptic feedback syncs with animation phases
- Progress indicator shows current cycle
- Use `scale` transform for circle (GPU-accelerated)

---

## Step 7: Completion

### Purpose

Celebrate success, reinforce safety, offer next steps.

### Screen Text

"You did it. You're safe."

### Visual Design

- Success animation (gentle glow, particle burst)
- Warm colors (`warm-ember`)
- Calm, celebratory without being overwhelming

### Haptic Feedback

- **Type:** Medium Impact
- **Pattern:** Single success pulse
- **Intent:** Completion acknowledgment

### Actions

Three button options:

1. **"Save Session"**
   - Saves session data to Vault
   - Records completion time, steps, notes

2. **"Return Home"**
   - Navigates back to home screen
   - Clears session state

3. **"How do you feel?"** (Optional)
   - 1-5 scale mood rating
   - Saved with session data
   - Used for tracking progress

### Implementation Notes

- Show buttons with staggered fade-in
- Save session data to IndexedDB/Firestore
- Track analytics: `SOS_COMPLETED`, duration, mood rating
- Smooth navigation transitions

---

## Design Considerations

### Viscous Animations

All animations must feel like moving through thick liquid:

- Minimum duration: 400ms
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (viscous)
- No jarring transitions

### Haptic Therapy

Haptics are not UI candy—they are grounding tools:

- **Heavy Impact:** Crisis moments
- **Medium Impact:** Success, completion
- **Light Impact:** UI interactions
- **Selection:** Continuous feedback

### Minimal Text

Users are in cognitive overload:

- Instructions: 5 words or less
- Use icons + text
- High contrast, large text
- Never scrolling required

### Safety First

- No flashing animations (seizure risk)
- No sudden loud sounds
- Clear exit option at all times
- No penalties for incomplete sessions

---

## File Structure

```
app/src/
├── pages/
│   └── SOSPage.tsx              # SOS flow container
├── components/features/sos/
│   ├── SOSSession.tsx           # State machine controller
│   ├── BreachScreen.tsx         # Step 1: Trigger
│   ├── AcknowledgeScreen.tsx    # Step 2: "I've got you"
│   ├── GroundingSight.tsx       # Step 3: Tap 5 things
│   ├── GroundingTouch.tsx       # Step 4: Tactile scrub
│   ├── GroundingSound.tsx       # Step 5: Pink noise
│   ├── ExitBreath.tsx           # Step 6: 4-7-8 breathing
│   └── CompletionScreen.tsx     # Step 7: Success
└── hooks/
    └── useSOSSession.tsx        # State management hook
```

---

## State Machine Implementation

```typescript
// State types
type SOSStep = 'breach' | 'acknowledge' | 'sight' | 'touch' | 'sound' | 'breath' | 'complete';

interface SOSState {
  currentStep: SOSStep;
  startTime: Date;
  tapCount: number; // Step 3: Sight
  dragDuration: number; // Step 4: Touch
  breathCycle: number; // Step 6: Breath
  moodRating?: number; // Step 7: Optional
}

// Hook usage
const { state, nextStep, saveSession, exitSession } = useSOSSession();
```

---

## Analytics Events

Track these events for monitoring and improvement:

- `SOS_STARTED` - User enters SOS flow
- `SOS_STEP_COMPLETED` - Each step completion (include step name)
- `SOS_COMPLETED` - Full flow completion (include duration)
- `SOS_EXITED_EARLY` - User exits before completion (include step)
- `SOS_SESSION_SAVED` - User saves session to Vault
- `SOS_MOOD_RATED` - User provides mood rating (include rating)

---

## Clinical References

1. **5-4-3-2-1 Grounding Technique**
   - Engage 5 senses sequentially
   - Break panic loop through sensory focus

2. **4-7-8 Breathing (Dr. Andrew Weil)**
   - Activates parasympathetic nervous system
   - Proven to reduce anxiety and heart rate

3. **Somatic Experiencing (Peter Levine)**
   - Body-based trauma therapy
   - Physical grounding through sensory engagement

4. **Cognitive Behavioral Therapy (CBT)**
   - Interrupt automatic panic responses
   - Replace with structured, guided actions

---

## Testing Checklist

- [ ] Long-press triggers SOS flow (2s hold)
- [ ] Heavy haptic feedback on trigger
- [ ] Heartbeat pattern during acknowledgment
- [ ] Tap counter increments correctly (Step 3)
- [ ] Ripple effects render at correct positions
- [ ] Drag tracking accumulates across touches (Step 4)
- [ ] Selection haptics continuous while dragging
- [ ] Pink noise plays for 20 seconds (Step 5)
- [ ] Screen fades to near-black during audio
- [ ] Breathing circle scales correctly (Step 6)
- [ ] Haptics sync with inhale/exhale
- [ ] Cycle counter updates (1/3, 2/3, 3/3)
- [ ] Success haptic on completion
- [ ] All buttons functional on completion screen
- [ ] Session data saves correctly
- [ ] Analytics events fire at each step
- [ ] Exit option available at all times
- [ ] All animations feel viscous (400ms+)
- [ ] Safe areas respected (notch, home indicator)

---

## Future Enhancements

### Planned

- [ ] Customizable step duration
- [ ] Skip/repeat individual steps
- [ ] Voice-guided instructions
- [ ] Session history visualization
- [ ] Progress tracking over time

### Research

- [ ] Adaptive difficulty (based on user history)
- [ ] Biometric integration (heart rate)
- [ ] Emergency contact auto-notify
- [ ] Integration with wearables

---

## See Also

- [Design Principles](../02-design-system/design-principles.md) - Viscosity, haptics, minimal text
- [Haptics Implementation](../05-implementation/haptics.md) - Therapeutic haptic patterns
- [Page Transitions](../05-implementation/page-transitions.md) - Framer Motion animations
- [i18n Guide](../05-implementation/i18n-guide.md) - Translating SOS instructions
