/**
 * App constants for the Anchor landing page
 */

// App Store links
export const APP_STORE_URL = 'https://apps.apple.com/de/app/id6756347720';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=cx.franz.anxietybuddy';

// Social links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/getanchorapp',
  instagram: 'https://instagram.com/getanchorapp',
} as const;

// Contact
export const SUPPORT_EMAIL = 'support@getanchor.app';
export const LEGAL_EMAIL = 'legal@getanchor.app';

// Crisis resources
export const CRISIS_HOTLINE = '988';
export const EMERGENCY_NUMBER = '911';

// Feature highlights for marketing
export const FEATURES = [
  {
    id: 'sos',
    title: '7-Step Panic Relief',
    description:
      'Clinically-informed de-escalation in 2-3 minutes. Multi-sensory grounding: sight, touch, sound, breath.',
    icon: 'AlertCircle',
    accent: 'warm-ember',
  },
  {
    id: 'ai-chat',
    title: '24/7 AI Support',
    description:
      'CBT and ACT-based therapeutic conversations. Crisis detection with immediate resources.',
    icon: 'MessageCircle',
    accent: 'biolum-cyan',
  },
  {
    id: 'voice',
    title: 'Speak, Don\'t Type',
    description:
      'Voice messages when typing feels impossible. Lower cognitive load during panic episodes.',
    icon: 'Mic',
    accent: 'biolum-cyan',
  },
  {
    id: 'privacy',
    title: 'Your Data, Your Control',
    description:
      '7-day audio auto-deletion. Export or delete anytime. We never sell your information.',
    icon: 'Shield',
    accent: 'success',
  },
] as const;

// How it works steps
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Trigger SOS',
    description: 'Long-press when panic hits',
  },
  {
    step: 2,
    title: 'Follow the Flow',
    description: 'Multi-sensory grounding guides you',
  },
  {
    step: 3,
    title: 'Return to Calm',
    description: '2-3 minutes to de-escalation',
  },
] as const;

// Philosophy points
export const PHILOSOPHY = [
  {
    title: 'Dark by Design',
    description: 'No toxic positivity. A calming void, not overwhelming brightness.',
  },
  {
    title: 'Evidence-Based',
    description: 'Built on CBT, ACT, and somatic grounding techniques.',
  },
  {
    title: 'Immediate Relief',
    description: 'For the acute moment, not daily meditation practice.',
  },
  {
    title: 'Therapeutic Touch',
    description: 'Haptic feedback as a grounding tool, not just UI.',
  },
] as const;

// Privacy highlights
export const PRIVACY_HIGHLIGHTS = [
  'Voice recordings auto-delete after 7 days',
  'Export all your data anytime',
  'We never sell your information',
  'End-to-end encryption in transit',
] as const;

// Navigation links
export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#privacy', label: 'Privacy' },
] as const;

// Footer links
export const FOOTER_LINKS = {
  product: [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#philosophy', label: 'Our Approach' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
  support: [
    { href: `mailto:${SUPPORT_EMAIL}`, label: 'Contact Support' },
    { href: `tel:${CRISIS_HOTLINE}`, label: 'Crisis Hotline (988)' },
  ],
} as const;
