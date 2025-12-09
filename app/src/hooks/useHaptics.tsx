import { useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Custom hook for haptic feedback
 * Wraps Capacitor Haptics API with therapeutic patterns
 */
export const useHaptics = () => {
  // Heavy impact - Crisis moments (SOS trigger)
  const heavy = useCallback(async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }, []);

  // Medium impact - Completion, success
  const medium = useCallback(async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }, []);

  // Light impact - UI interactions (taps, swipes)
  const light = useCallback(async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
  }, []);

  // Selection feedback - Continuous (start, change, end)
  const selectionStart = useCallback(async () => {
    await Haptics.selectionStart();
  }, []);

  const selectionChanged = useCallback(async () => {
    await Haptics.selectionChanged();
  }, []);

  const selectionEnd = useCallback(async () => {
    await Haptics.selectionEnd();
  }, []);

  // Heartbeat pattern (60 BPM - 1000ms interval)
  const heartbeat = useCallback(async (duration: number = 5000) => {
    const interval = 1000; // 60 BPM
    const pulses = Math.floor(duration / interval);

    for (let i = 0; i < pulses; i++) {
      await Haptics.impact({ style: ImpactStyle.Light });
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }, []);

  // Breathing pattern (4s in, 6s out - swell and fade)
  const breathingCycle = useCallback(async () => {
    // Inhale - gentle swell
    await Haptics.impact({ style: ImpactStyle.Light });
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Exhale - fade (no haptic, just pause)
    await new Promise((resolve) => setTimeout(resolve, 6000));
  }, []);

  return {
    heavy,
    medium,
    light,
    selectionStart,
    selectionChanged,
    selectionEnd,
    heartbeat,
    breathingCycle,
  };
};
