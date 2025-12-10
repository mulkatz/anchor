import { SEO } from '@/components/SEO';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { PhilosophySection } from '@/components/sections/PhilosophySection';
import { PrivacyHighlightSection } from '@/components/sections/PrivacyHighlightSection';
import { CTASection } from '@/components/sections/CTASection';

/**
 * Main landing page
 * Composes all sections with oceanic bubble background
 */
export function LandingPage() {
  return (
    <>
      <SEO />
      <PageWrapper>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PhilosophySection />
        <PrivacyHighlightSection />
        <CTASection />
      </PageWrapper>
    </>
  );
}
