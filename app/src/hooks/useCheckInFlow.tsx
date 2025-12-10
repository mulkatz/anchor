import { useState, useCallback } from 'react';
import type { WeatherType, DailyLog } from '../models';

export interface CheckInData {
  mood_depth: number;
  weather: WeatherType | null;
  note_text: string;
}

export interface UseCheckInFlowReturn {
  step: number;
  data: CheckInData;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<CheckInData>) => void;
  canProceed: boolean;
  direction: number; // For AnimatePresence direction animations
}

/**
 * State machine hook for 3-step check-in flow
 * Step 1: Depth slider (mood_depth)
 * Step 2: Weather selector (weather)
 * Step 3: Journal input (note_text + Keep/Release)
 */
export const useCheckInFlow = (existingLog?: DailyLog | null): UseCheckInFlowReturn => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [data, setData] = useState<CheckInData>({
    mood_depth: existingLog?.mood_depth ?? 50,
    weather: existingLog?.weather ?? null,
    note_text: existingLog?.note_text ?? '',
  });

  // Update data with partial values
  const updateData = useCallback((partial: Partial<CheckInData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    setDirection(1);
    setStep((prev) => Math.min(3, prev + 1));
  }, []);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    setDirection(-1);
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  // Determine if user can proceed to next step
  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        // Depth slider - always valid (0-100)
        return true;
      case 2:
        // Weather selector - must select a weather
        return data.weather !== null;
      case 3:
        // Journal input - optional, always valid
        return true;
      default:
        return false;
    }
  }, [step, data.weather]);

  return {
    step,
    data,
    nextStep,
    prevStep,
    updateData,
    canProceed: canProceed(),
    direction,
  };
};
