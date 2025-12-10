import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import i18next from 'i18next';
import { useHaptics } from './useHaptics';

export type RecordingPermission = 'granted' | 'denied' | 'prompt';

export type StartRecordingResult = 'started' | 'permission_denied' | 'error';

export interface RecordingData {
  blob: Blob;
  duration: number; // milliseconds
  mimeType: string;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // seconds
  permission: RecordingPermission;
  error: string | null;
  startRecording: () => Promise<StartRecordingResult>;
  stopRecording: () => Promise<RecordingData | null>;
  cancelRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

const MAX_DURATION = 60; // 60 seconds max recording

/**
 * Custom hook for voice recording with haptic feedback
 * Uses capacitor-voice-recorder plugin
 */
export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0); // in seconds
  const [permission, setPermission] = useState<RecordingPermission>('prompt');
  const [error, setError] = useState<string | null>(null);

  const haptics = useHaptics();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { value } = await VoiceRecorder.hasAudioRecordingPermission();
        setPermission(value ? 'granted' : 'prompt');
      } catch (err) {
        console.error('Failed to check recording permission:', err);
        setPermission('prompt');
      }
    };

    checkPermission();
  }, []);

  // Clean up timer on unmount or when recording stops
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { value } = await VoiceRecorder.requestAudioRecordingPermission();
      setPermission(value ? 'granted' : 'denied');
      return value;
    } catch (err) {
      console.error('Failed to request recording permission:', err);
      setError(i18next.t('errors.voice.permissionFailed'));
      setPermission('denied');
      return false;
    }
  }, []);

  /**
   * Start recording audio
   * Returns the result status so caller can handle permission denied UI
   */
  const startRecording = useCallback(async (): Promise<StartRecordingResult> => {
    try {
      setError(null);

      // Check permission first
      const { value: hasPermission } = await VoiceRecorder.hasAudioRecordingPermission();
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          setError(i18next.t('errors.voice.permissionRequired'));
          return 'permission_denied';
        }
      }

      // Start recording
      await VoiceRecorder.startRecording();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      startTimeRef.current = Date.now();

      // Haptic feedback: Selection start (continuous vibration begins)
      await haptics.selectionStart();

      // Start duration timer (update every 100ms for smooth UI)
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= MAX_DURATION) {
          stopRecording();
        }
      }, 100);

      return 'started';
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(i18next.t('errors.voice.startFailed'));
      setIsRecording(false);
      return 'error';
    }
  }, [haptics, requestPermission]);

  /**
   * Stop recording and return audio data
   */
  const stopRecording = useCallback(async (): Promise<RecordingData | null> => {
    try {
      if (!isRecording) {
        return null;
      }

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop recording
      const result = await VoiceRecorder.stopRecording();

      // Haptic feedback: Selection end (continuous vibration stops)
      await haptics.selectionEnd();

      // Medium impact for successful completion
      await haptics.medium();

      setIsRecording(false);
      setIsPaused(false);

      const recordingDuration = Date.now() - startTimeRef.current;

      // Check if we got valid recording data
      if (!result.value || !result.value.recordDataBase64) {
        setError(i18next.t('errors.voice.noData'));
        return null;
      }

      // Convert base64 to Blob
      const mimeType = result.value.mimeType || 'audio/aac';
      const blob = base64ToBlob(result.value.recordDataBase64, mimeType);

      return {
        blob,
        duration: recordingDuration,
        mimeType,
      };
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError(i18next.t('errors.voice.saveFailed'));
      setIsRecording(false);
      return null;
    }
  }, [isRecording, haptics]);

  /**
   * Cancel recording without saving
   */
  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      if (!isRecording) {
        return;
      }

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop recording (but don't save the result)
      await VoiceRecorder.stopRecording();

      // Haptic feedback: Selection end + light impact for cancel
      await haptics.selectionEnd();
      await haptics.light();

      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
    } catch (err) {
      console.error('Failed to cancel recording:', err);
      setError(i18next.t('errors.voice.cancelFailed'));
      setIsRecording(false);
    }
  }, [isRecording, haptics]);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(async (): Promise<void> => {
    try {
      if (!isRecording || isPaused) {
        return;
      }

      await VoiceRecorder.pauseRecording();
      setIsPaused(true);

      // Stop timer while paused
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Haptic feedback: Selection changed (pause)
      await haptics.selectionChanged();
    } catch (err) {
      console.error('Failed to pause recording:', err);
      setError(i18next.t('errors.voice.pauseFailed'));
    }
  }, [isRecording, isPaused, haptics]);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(async (): Promise<void> => {
    try {
      if (!isRecording || !isPaused) {
        return;
      }

      await VoiceRecorder.resumeRecording();
      setIsPaused(false);

      // Restart timer
      const pausedDuration = duration;
      startTimeRef.current = Date.now() - pausedDuration * 1000;

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= MAX_DURATION) {
          stopRecording();
        }
      }, 100);

      // Haptic feedback: Selection changed (resume)
      await haptics.selectionChanged();
    } catch (err) {
      console.error('Failed to resume recording:', err);
      setError(i18next.t('errors.voice.resumeFailed'));
    }
  }, [isRecording, isPaused, duration, haptics, stopRecording]);

  return {
    isRecording,
    isPaused,
    duration,
    permission,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    pauseRecording,
    resumeRecording,
    requestPermission,
  };
};

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  // Remove data URL prefix if present
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  // Decode base64 to binary string
  const binaryString = atob(base64Data);

  // Convert binary string to byte array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create Blob
  return new Blob([bytes], { type: mimeType });
}
