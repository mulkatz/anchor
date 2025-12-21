# App Store Submission Guide

**Anchor: Anxiety Navigator** | Version 0.7.1

---

## App Store Connect Settings

### Basic Information

| Field                       | Value                          |
| --------------------------- | ------------------------------ |
| **App Name**                | Anchor: Anxiety Navigator      |
| **Subtitle** (30 chars max) | Find calm in difficult moments |
| **Primary Category**        | Lifestyle                      |
| **Secondary Category**      | Health & Fitness               |

### Keywords (100 chars max)

```
anxiety,calm,grounding,wellness,mental,breathing,journal,CBT,mindfulness,panic,stress,meditation
```

### App Description (4000 chars max)

```
Anchor is your calm companion for difficult moments. When anxiety strikes, Anchor guides you back to steady ground with evidence-based techniques that actually work.

IMMEDIATE RELIEF
• SOS Mode: A 7-step grounding exercise for panic moments
• Breathing exercises with gentle haptic guidance
• Progressive calming techniques

TALK IT THROUGH
• AI companion trained in CBT and ACT techniques
• Voice or text conversations
• Time-aware responses that understand your context

UNDERSTAND YOURSELF
• The Dive: 25 guided lessons exploring your nervous system
• Polyvagal Theory concepts made accessible
• Deep self-discovery through interactive conversations

REFLECT & REFRAME
• Lighthouse: Identify thinking patterns
• AI-powered cognitive reframing
• Track your emotional intensity over time

DAILY CHECK-INS
• Tide Log: Quick mood and energy tracking
• Build your personal reef of check-ins
• Release thoughts to find peace

DESIGNED FOR YOUR WELLBEING
• Bioluminescent ocean aesthetic that soothes
• Therapeutic haptics for grounding
• Private and encrypted - your data stays yours
• Works offline for core features

Anchor is a wellness tool, not a replacement for professional mental health care. If you're in crisis, please reach out to a mental health professional or crisis hotline.

Find your anchor. Find your calm.
```

### Promotional Text (170 chars, can be updated without review)

```
Find calm in anxious moments with evidence-based grounding techniques, AI conversations, and daily check-ins. Your personal wellness companion.
```

---

## Privacy Labels (App Privacy)

### Data Not Collected

Anchor does not share data with third parties.

### Data Linked to You

| Data Type   | Purpose                               |
| ----------- | ------------------------------------- |
| Identifiers | App Functionality (anonymous user ID) |
| Usage Data  | Analytics (if enabled by user)        |

### Data Not Linked to You

| Data Type   | Purpose                           |
| ----------- | --------------------------------- |
| Diagnostics | App Functionality (crash reports) |

### Privacy Practices

- **Data encryption**: Yes, in transit and at rest
- **Account deletion**: Yes, from Profile > Delete Account
- **Data export**: Yes, from Profile > Export Data

---

## Screenshots Guide

### Required Sizes

| Device         | Size (pixels) | Required           |
| -------------- | ------------- | ------------------ |
| iPhone 6.7"    | 1290 x 2796   | Yes                |
| iPhone 6.5"    | 1284 x 2778   | Yes                |
| iPhone 5.5"    | 1242 x 2208   | Yes                |
| iPad Pro 12.9" | 2048 x 2732   | If supporting iPad |

### Recommended Screenshot Set (5-10 images)

1. **Home Screen**
   - Caption: "Your calm companion"
   - Shows: Main interface with tagline

2. **SOS Mode**
   - Caption: "Immediate grounding when you need it"
   - Shows: SOS button or breathing exercise

3. **Chat/Deep Talk**
   - Caption: "Talk through difficult moments"
   - Shows: AI conversation in progress

4. **The Dive**
   - Caption: "Understand your nervous system"
   - Shows: Lesson map with ocean depth zones

5. **Lighthouse Reflection**
   - Caption: "Identify and reframe thoughts"
   - Shows: Cognitive reframing flow

6. **Tide Log**
   - Caption: "Track your daily wellbeing"
   - Shows: Check-in interface or reef view

7. **Treasures/Achievements**
   - Caption: "Celebrate your progress"
   - Shows: Achievement grid with streak

8. **Profile Settings**
   - Caption: "Privacy-first design"
   - Shows: Settings with privacy options

### Screenshot Tips

- Use the iOS Simulator for consistent screenshots
- Enable "Show Device Frame" in Simulator > Window > Show Device Bezels
- Capture at 2x or 3x for retina quality
- Use real (but anonymized) content, not placeholder text
- Ensure dark mode looks good (app is dark by default)

### Capture Commands

```bash
# Run simulator with specific device
xcrun simctl boot "iPhone 15 Pro Max"

# Take screenshot
xcrun simctl io booted screenshot ~/Desktop/screenshot.png

# Or use Cmd+S in Simulator
```

---

## App Review Notes

Include for reviewers:

```
Anchor is a wellness app providing grounding exercises and journaling for anxious moments.

Key features to test:
1. SOS Mode: Hold the button for 2 seconds to start grounding
2. Chat: Tap the chat icon to start a conversation (requires internet)
3. The Dive: Tap any unlocked lesson to begin
4. Lighthouse: Create a new reflection to see the CBT flow
5. Tide Log: Check in with your current mood

Note: AI features require an internet connection. Core grounding exercises work offline.

No login is required for basic features - anonymous auth is used automatically.
```

---

## Pre-Submission Checklist

### Required

- [ ] App icon (1024x1024 PNG, no transparency)
- [ ] Screenshots for all required sizes
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] App description
- [ ] Keywords

### Recommended

- [ ] App preview video (15-30 seconds)
- [ ] Promotional text
- [ ] What's New text for updates

### Technical

- [ ] Test on physical device (not just simulator)
- [ ] Test offline mode
- [ ] Verify all deep links work
- [ ] Check haptics on device
- [ ] Verify audio recording permissions work

---

## Version History Template

### What's New (for updates)

```
Version X.Y.Z

• [Main feature or fix]
• [Secondary improvement]
• [Bug fixes and performance improvements]
```

---

## Rejection Prevention

### Common iOS Review Rejections to Avoid

1. **Guideline 4.2 - Minimum Functionality**
   - Anchor has multiple features (SOS, Chat, Dive, Lighthouse, Tide Log)
   - Each provides distinct value

2. **Guideline 5.1.1 - Data Collection**
   - Privacy labels accurately reflect data usage
   - User can delete all data from within the app

3. **Guideline 2.1 - App Completeness**
   - No placeholder content
   - All features are functional
   - Links work (Privacy Policy, Terms, Support)

4. **Health Claims**
   - App is categorized as Lifestyle, not Medical
   - Disclaimer is shown during onboarding
   - No claims of treating or diagnosing conditions

---

_Last Updated: December 2024_
