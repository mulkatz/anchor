import { useState, useCallback } from 'react';

interface OnboardingState {
  hasCompleted: boolean;
  completedAt: string | null;
}

function loadOnboardingState(): OnboardingState {
  return {
    hasCompleted: localStorage.getItem('onboardingCompleted') === 'true',
    completedAt: localStorage.getItem('onboardingCompletedAt'),
  };
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(loadOnboardingState);

  const completeOnboarding = useCallback(() => {
    const completedAt = new Date().toISOString();
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingCompletedAt', completedAt);
    setState({ hasCompleted: true, completedAt });
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('onboardingCompletedAt');
    setState({ hasCompleted: false, completedAt: null });
  }, []);

  return {
    ...state,
    completeOnboarding,
    resetOnboarding,
  };
}
