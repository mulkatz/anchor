import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../hooks/useOnboarding';
import { useHaptics } from '../hooks/useHaptics';
import { OceanicBubbles } from '../components/ui/OceanicBubbles';
import {
  OnboardingProgress,
  WelcomeStep,
  PillarsStep,
  DisclaimerStep,
} from '../components/features/onboarding';

const TOTAL_STEPS = 3;

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { light } = useHaptics();

  const goToStep = async (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
    await light();
  };

  const handleComplete = () => {
    completeOnboarding();
    navigate('/', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-void-blue">
      {/* Ambient background */}
      <OceanicBubbles />

      {/* Step indicator */}
      <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      {/* Step content with directional transitions */}
      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 && (
          <WelcomeStep key="welcome" onContinue={() => goToStep(2)} direction={direction} />
        )}
        {step === 2 && (
          <PillarsStep key="pillars" onComplete={() => goToStep(3)} direction={direction} />
        )}
        {step === 3 && (
          <DisclaimerStep key="disclaimer" onComplete={handleComplete} direction={direction} />
        )}
      </AnimatePresence>
    </div>
  );
}
