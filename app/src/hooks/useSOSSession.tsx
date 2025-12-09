import { useState, useEffect } from 'react';

export type SOSStep =
  | 'trigger' // Step 1: Long-press to begin
  | 'acknowledgement' // Step 2: "I've got you"
  | 'grounding-sight' // Step 3: Tap 5 things
  | 'grounding-touch' // Step 4: Scrub texture
  | 'grounding-sound' // Step 5: Pink noise
  | 'exit-breath' // Step 6: 4-7-8 breathing
  | 'completion'; // Step 7: Success

interface SOSSessionState {
  currentStep: SOSStep;
  isActive: boolean;
  startTime: number | null;
  endTime: number | null;
}

/**
 * State machine for the 7-step SOS panic de-escalation flow
 */
export const useSOSSession = () => {
  const [session, setSession] = useState<SOSSessionState>({
    currentStep: 'trigger',
    isActive: false,
    startTime: null,
    endTime: null,
  });

  // Start session (triggered by long-press)
  const startSession = () => {
    setSession({
      currentStep: 'acknowledgement',
      isActive: true,
      startTime: Date.now(),
      endTime: null,
    });
  };

  // Move to next step
  const nextStep = () => {
    const stepOrder: SOSStep[] = [
      'trigger',
      'acknowledgement',
      'grounding-sight',
      'grounding-touch',
      'grounding-sound',
      'exit-breath',
      'completion',
    ];

    const currentIndex = stepOrder.indexOf(session.currentStep);
    const nextIndex = currentIndex + 1;

    if (nextIndex < stepOrder.length) {
      setSession((prev) => ({
        ...prev,
        currentStep: stepOrder[nextIndex],
      }));
    }
  };

  // Complete session
  const completeSession = () => {
    setSession((prev) => ({
      ...prev,
      isActive: false,
      endTime: Date.now(),
    }));
  };

  // Reset to beginning
  const resetSession = () => {
    setSession({
      currentStep: 'trigger',
      isActive: false,
      startTime: null,
      endTime: null,
    });
  };

  // Calculate session duration
  const getDuration = () => {
    if (!session.startTime) return 0;
    const end = session.endTime || Date.now();
    return Math.floor((end - session.startTime) / 1000); // seconds
  };

  return {
    currentStep: session.currentStep,
    isActive: session.isActive,
    startSession,
    nextStep,
    completeSession,
    resetSession,
    getDuration,
  };
};
