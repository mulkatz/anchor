import { useState, useCallback, useRef } from 'react';
import type { EmotionType, DetectedDistortion, CognitiveDistortion } from '../models';
import { analyzeAndReframe } from '../services/illuminate.service';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';

/**
 * State for the 6-step Illuminate flow
 */
export interface IlluminateFlowData {
  // Step 1: The Situation
  situation: string;

  // Step 2: The Thoughts
  automaticThoughts: string;

  // Step 3: The Feelings
  primaryEmotions: EmotionType[];

  // Step 4: The Intensity
  emotionalIntensity: number;

  // Step 5: The Pattern (AI-detected)
  aiDetectedDistortions: DetectedDistortion[];
  userConfirmedDistortions: CognitiveDistortion[];
  userDismissedDistortions: CognitiveDistortion[];

  // Step 6: The Reframe
  aiSuggestedReframes: string[];
  selectedReframe: string;
  customReframe: boolean;
  reframeHelpfulness?: number;
}

export interface UseIlluminateFlowReturn {
  step: number;
  direction: number; // For animation direction
  data: IlluminateFlowData;
  isLoading: boolean;
  error: string | null;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  canProceed: boolean;

  // Data updates
  updateData: (updates: Partial<IlluminateFlowData>) => void;

  // Step 5: Distortion handling
  confirmDistortion: (type: CognitiveDistortion) => void;
  dismissDistortion: (type: CognitiveDistortion) => void;

  // Step 6: Reframe handling
  selectReframe: (reframe: string, isCustom: boolean) => void;

  // AI processing
  processWithAI: (language: string) => Promise<void>;

  // Completion
  getEntryDuration: () => number;
  reset: () => void;
}

const TOTAL_STEPS = 6;

const INITIAL_DATA: IlluminateFlowData = {
  situation: '',
  automaticThoughts: '',
  primaryEmotions: [],
  emotionalIntensity: 50,
  aiDetectedDistortions: [],
  userConfirmedDistortions: [],
  userDismissedDistortions: [],
  aiSuggestedReframes: [],
  selectedReframe: '',
  customReframe: false,
};

// Step names for analytics
const STEP_NAMES = ['situation', 'thoughts', 'feelings', 'intensity', 'pattern', 'reframe'];

/**
 * Hook to manage the 6-step Illuminate wizard flow
 */
export const useIlluminateFlow = (): UseIlluminateFlowReturn => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<IlluminateFlowData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track when the user started the flow
  const startTimeRef = useRef<number>(Date.now());

  /**
   * Update flow data
   */
  const updateData = useCallback((updates: Partial<IlluminateFlowData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Check if current step can proceed
   */
  const canProceed = (() => {
    switch (step) {
      case 1:
        // Need situation (at least 10 chars)
        return data.situation.trim().length >= 10;
      case 2:
        // Need automatic thoughts (at least 10 chars)
        return data.automaticThoughts.trim().length >= 10;
      case 3:
        // Feelings are optional - can always proceed
        return true;
      case 4:
        // Intensity is always valid (has default)
        return true;
      case 5:
        // Can proceed once AI has processed (even with no distortions)
        return data.aiDetectedDistortions.length >= 0 && !isLoading;
      case 6:
        // Need a selected reframe
        return data.selectedReframe.trim().length > 0;
      default:
        return false;
    }
  })();

  /**
   * Move to next step
   */
  const nextStep = useCallback(() => {
    if (!canProceed) return;

    setDirection(1);
    setStep((prev) => {
      const next = Math.min(prev + 1, TOTAL_STEPS);
      logAnalyticsEvent(AnalyticsEvent.ILLUMINATE_STEP_COMPLETED, {
        step: prev,
        step_name: STEP_NAMES[prev - 1],
      });
      return next;
    });
  }, [canProceed]);

  /**
   * Move to previous step
   */
  const prevStep = useCallback(() => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  /**
   * Confirm a detected distortion
   */
  const confirmDistortion = useCallback((type: CognitiveDistortion) => {
    setData((prev) => {
      // Remove from dismissed if it was there
      const newDismissed = prev.userDismissedDistortions.filter((d) => d !== type);
      // Add to confirmed if not already there
      const newConfirmed = prev.userConfirmedDistortions.includes(type)
        ? prev.userConfirmedDistortions
        : [...prev.userConfirmedDistortions, type];

      logAnalyticsEvent(AnalyticsEvent.DISTORTION_CONFIRMED, { distortion_type: type });

      return {
        ...prev,
        userConfirmedDistortions: newConfirmed,
        userDismissedDistortions: newDismissed,
      };
    });
  }, []);

  /**
   * Dismiss a detected distortion
   */
  const dismissDistortion = useCallback((type: CognitiveDistortion) => {
    setData((prev) => {
      // Remove from confirmed if it was there
      const newConfirmed = prev.userConfirmedDistortions.filter((d) => d !== type);
      // Add to dismissed if not already there
      const newDismissed = prev.userDismissedDistortions.includes(type)
        ? prev.userDismissedDistortions
        : [...prev.userDismissedDistortions, type];

      logAnalyticsEvent(AnalyticsEvent.DISTORTION_DISMISSED, { distortion_type: type });

      return {
        ...prev,
        userConfirmedDistortions: newConfirmed,
        userDismissedDistortions: newDismissed,
      };
    });
  }, []);

  /**
   * Select a reframe (AI-suggested or custom)
   */
  const selectReframe = useCallback(
    (reframe: string, isCustom: boolean) => {
      setData((prev) => ({
        ...prev,
        selectedReframe: reframe,
        customReframe: isCustom,
      }));

      if (isCustom) {
        logAnalyticsEvent(AnalyticsEvent.CUSTOM_REFRAME_WRITTEN);
      } else {
        const index = data.aiSuggestedReframes.indexOf(reframe);
        logAnalyticsEvent(AnalyticsEvent.AI_REFRAME_SELECTED, { reframe_index: index });
      }
    },
    [data.aiSuggestedReframes]
  );

  /**
   * Process user input with AI to detect distortions and generate reframes
   */
  const processWithAI = useCallback(
    async (language: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await analyzeAndReframe(data.situation, data.automaticThoughts, language);

        setData((prev) => ({
          ...prev,
          aiDetectedDistortions: result.distortions,
          aiSuggestedReframes: result.reframes,
          // Auto-confirm all detected distortions initially
          userConfirmedDistortions: result.distortions.map((d) => d.type),
          userDismissedDistortions: [],
        }));
      } catch (err) {
        console.error('AI processing error:', err);
        setError('Failed to analyze thoughts. Please try again.');
        // Still allow proceeding with empty results
        setData((prev) => ({
          ...prev,
          aiDetectedDistortions: [],
          aiSuggestedReframes: [],
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [data.situation, data.automaticThoughts]
  );

  /**
   * Get duration since flow started (in seconds)
   */
  const getEntryDuration = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  /**
   * Reset flow to initial state
   */
  const reset = useCallback(() => {
    setStep(1);
    setDirection(1);
    setData(INITIAL_DATA);
    setIsLoading(false);
    setError(null);
    startTimeRef.current = Date.now();
  }, []);

  return {
    step,
    direction,
    data,
    isLoading,
    error,
    nextStep,
    prevStep,
    canProceed,
    updateData,
    confirmDistortion,
    dismissDistortion,
    selectReframe,
    processWithAI,
    getEntryDuration,
    reset,
  };
};
