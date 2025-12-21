import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div className="absolute left-0 right-0 top-0 z-10 pt-safe">
      <div className="flex justify-center gap-2 py-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <motion.div
            key={step}
            animate={{
              width: step === currentStep ? 24 : 8,
              backgroundColor:
                step <= currentStep ? 'rgba(100, 255, 218, 1)' : 'rgba(226, 232, 240, 0.2)',
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-2 rounded-full"
            style={{
              boxShadow: step === currentStep ? '0 0 10px rgba(100, 255, 218, 0.5)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
