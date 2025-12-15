import { useState, useCallback, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase.service';
import { useVoiceRecorder, type StartRecordingResult } from './useVoiceRecorder';
import { useHaptics } from './useHaptics';
import { useSettings } from './useSettings';

interface TranscriptionResponse {
  text: string;
  confidence: number;
}

export interface UseSpeechToTextReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  duration: number;
  error: string | null;
  startRecording: () => Promise<StartRecordingResult>;
  stopAndTranscribe: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
}

/**
 * Custom hook for speech-to-text functionality
 * Wraps useVoiceRecorder and calls transcribeAudioCallable Cloud Function
 */
export const useSpeechToText = (): UseSpeechToTextReturn => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voiceRecorder = useVoiceRecorder();
  const haptics = useHaptics();
  const { settings } = useSettings();

  // Track if we're in a valid recording session
  const isRecordingRef = useRef(false);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async (): Promise<StartRecordingResult> => {
    setError(null);
    const result = await voiceRecorder.startRecording();

    if (result === 'started') {
      isRecordingRef.current = true;
    }

    return result;
  }, [voiceRecorder]);

  /**
   * Stop recording and transcribe the audio
   * Returns the transcribed text or null if failed
   */
  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    if (!isRecordingRef.current) {
      return null;
    }

    setError(null);
    isRecordingRef.current = false;

    try {
      // Stop recording and get audio data
      const recordingData = await voiceRecorder.stopRecording();

      if (!recordingData) {
        setError('No recording data');
        return null;
      }

      // Start transcription
      setIsTranscribing(true);

      // Convert blob to base64
      const arrayBuffer = await recordingData.blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const audioBase64 = btoa(binary);

      // Call Cloud Function
      const transcribeAudioFn = httpsCallable<
        { audioBase64: string; mimeType: string; language: string },
        TranscriptionResponse
      >(functions, 'transcribeAudioCallable');

      const result = await transcribeAudioFn({
        audioBase64,
        mimeType: recordingData.mimeType,
        language: settings.language || 'en-US',
      });

      setIsTranscribing(false);

      // Success haptic
      await haptics.light();

      return result.data.text;
    } catch (err: any) {
      console.error('Speech-to-text failed:', err);
      setError(err.message || 'Transcription failed');
      setIsTranscribing(false);

      // Error haptic (use medium for notification)
      await haptics.medium();

      return null;
    }
  }, [voiceRecorder, settings.language, haptics]);

  /**
   * Cancel recording without transcribing
   */
  const cancelRecording = useCallback(async (): Promise<void> => {
    isRecordingRef.current = false;
    await voiceRecorder.cancelRecording();
  }, [voiceRecorder]);

  return {
    isRecording: voiceRecorder.isRecording,
    isTranscribing,
    duration: voiceRecorder.duration,
    error: error || voiceRecorder.error,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
  };
};
