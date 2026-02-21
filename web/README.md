# Anchor Landing Website

Promotional landing website for **Anchor: Anxiety Navigator** - a therapeutic app providing immediate relief during panic attacks.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Dev server runs at http://localhost:5173 (or 5174 if port in use).

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling with custom design tokens
- **Framer Motion** - Animations
- **React Router** - Routing
- **react-helmet-async** - SEO meta tags
- **Lucide React** - Icons

## Pages

| Route      | Description                 |
| ---------- | --------------------------- |
| `/`        | Main landing page           |
| `/privacy` | Privacy Policy              |
| `/terms`   | Terms of Service            |
| `/invite`  | Invite system (placeholder) |

## Project Structure

```
web/src/
├── assets/icons/           # App store badges (SVG)
│
├── components/
│   ├── effects/
│   │   ├── OceanicBubbles.tsx   # Animated background particles
│   │   ├── GlowOrb.tsx          # Hero pulsing orb
│   │   └── ScrollReveal.tsx     # Scroll animations
│   │
│   ├── layout/
│   │   ├── Header.tsx           # Navigation with glass morphism
│   │   ├── Footer.tsx           # Links and badges
│   │   └── PageWrapper.tsx      # Common page structure
│   │
│   ├── sections/
│   │   ├── HeroSection.tsx      # Hero with GlowOrb
│   │   ├── FeaturesSection.tsx  # 2x2 feature grid
│   │   ├── HowItWorksSection.tsx
│   │   ├── PhilosophySection.tsx
│   │   ├── PrivacyHighlightSection.tsx
│   │   └── CTASection.tsx       # Final download CTA
│   │
│   ├── ui/
│   │   ├── Button.tsx           # Primary/Secondary/Ghost
│   │   ├── GlassCard.tsx        # Glass morphism container
│   │   └── AppStoreBadges.tsx   # Official store badges
│   │
│   └── SEO.tsx                  # Meta tags component
│
├── hooks/
│   └── useReducedMotion.ts      # Accessibility hook
│
├── lib/
│   ├── cn.ts                    # Class name utility
│   └── constants.ts             # App constants and copy
│
├── pages/
│   ├── LandingPage.tsx
│   ├── PrivacyPolicyPage.tsx
│   ├── TermsOfServicePage.tsx
│   └── InvitePage.tsx
│
├── App.tsx                      # Router setup
├── main.tsx                     # Entry point
├── index.css                    # Global styles
└── vite-env.d.ts               # TypeScript declarations
```

## Design System

### Colors

| Token         | Hex       | Usage                       |
| ------------- | --------- | --------------------------- |
| `void-blue`   | `#0A1128` | Background                  |
| `biolum-cyan` | `#64FFDA` | Interactive elements, glows |
| `warm-ember`  | `#FFB38A` | Accents                     |
| `mist-white`  | `#E2E8F0` | Text                        |
| `success`     | `#4ECDC4` | Success states              |

### Glass Morphism

```tsx
<div className="rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-glass shadow-glass">
```

### Animations

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (viscous)
- **Minimum duration:** 400ms
- **Philosophy:** Slow, calming, never jarring

```tsx
// Tailwind class
className="transition-all duration-300 ease-viscous"

// Framer Motion
transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
```

### Glow Shadows

```css
shadow-glow-sm: 0 0 10px rgba(100, 255, 218, 0.3)
shadow-glow-md: 0 0 20px rgba(100, 255, 218, 0.4)
shadow-glow-lg: 0 0 40px rgba(100, 255, 218, 0.5)
```

## Key Components

### OceanicBubbles

Animated background particles creating a deep-ocean atmosphere.

```tsx
<OceanicBubbles count={25} />
```

- 25 bubbles with random size (2-6px), opacity (0.15-0.4), duration (25-45s)
- Wobble horizontally + rise vertically
- Respects `prefers-reduced-motion`

### GlowOrb

Pulsing bioluminescent orb for the hero section.

```tsx
<GlowOrb size="lg" /> // sm | md | lg | xl
```

### ScrollReveal

Scroll-triggered reveal animations with Framer Motion.

```tsx
<ScrollReveal direction="up" delay={0.2}>
  <Content />
</ScrollReveal>
```

### GlassCard

Reusable glass morphism container.

```tsx
<GlassCard hover glow className="p-6">
  <Content />
</GlassCard>
```

## Configuration

### App Store Links

Real store URLs are configured in `src/lib/constants.ts`:

```ts
export const APP_STORE_URL = 'https://apps.apple.com/de/app/id6756347720';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=cx.franz.anxietybuddy';
```

### Contact Emails

```ts
export const SUPPORT_EMAIL = 'support@getanchor.app';
export const LEGAL_EMAIL = 'legal@getanchor.app';
```

## Legal Pages

### Privacy Policy (`/privacy`)

Comprehensive privacy policy addressing:

- **Anonymous authentication** (no email, name, or personal info collected)
- 13+ age requirement
- Data collection (anonymous ID, conversations, voice recordings)
- Third-party services (Firebase, Google Vertex AI, Cloud Speech-to-Text)
- **7-day automatic voice recording deletion**
- User rights (export, delete)
- COPPA compliance for minors

### Terms of Service (`/terms`)

Includes critical sections:

- **Mental health disclaimer** (NOT a substitute for professional care)
- Crisis resources (988 Suicide & Crisis Lifeline, 911)
- AI limitations
- **Anonymous auth note** (data tied to device, not recoverable if lost)
- 13+ age requirement
- Acceptable use policy
- Limitation of liability

## SEO

Each page uses the `<SEO>` component:

```tsx
<SEO title="Page Title - Anchor" description="Page description" url="https://getanchor.app/page" />
```

Includes Open Graph, Twitter Cards, canonical URL, and MobileApplication schema.

## Accessibility

- WCAG AA contrast on all colors
- Semantic HTML with proper heading hierarchy
- Visible focus states
- Full keyboard navigation
- Respects `prefers-reduced-motion`

## Build Output

```
dist/
├── index.html              (~2.3 KB)
├── assets/
│   ├── index-*.css         (~24 KB)
│   ├── index-*.js          (~118 KB)
│   ├── framer-motion-*.js  (~126 KB)
│   ├── react-vendor-*.js   (~168 KB)
│   ├── app-store-*.svg     (~11 KB)
│   └── google-play-*.svg   (~7 KB)
```

## Deployment

### Build

```bash
npm run build
```

### Hosting

Works with any static hosting. For SPA routing, configure redirects to `index.html`:

**Vercel** - Works out of the box

**Netlify** - Add `public/_redirects`:

```
/* /index.html 200
```

**Firebase Hosting** - Add to `firebase.json`:

```json
{
  "hosting": {
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

## Difference from `/app`

- **`/app`**: Mobile-first app with Capacitor (iOS/Android + Web PWA) - the actual Anchor app
- **`/web`**: Pure web landing site for marketing, legal pages, and public-facing content

## Related

- **App:** `/app` - Main Anchor mobile app
- **Backend:** `/backend` - Firebase Cloud Functions
- **Docs:** `/docs` - Project documentation
