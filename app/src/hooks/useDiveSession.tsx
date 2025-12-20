import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  setDoc,
  getDocs,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import i18next from 'i18next';
import { firestore, storage } from '../services/firebase.service';
import { useHaptics } from './useHaptics';
import { useSettings } from './useSettings';
import { useApp } from '../contexts/AppContext';
import type { DiveMessage, SupportedLanguage } from '../models';
import type { RecordingData } from './useVoiceRecorder';

interface UseDiveSessionProps {
  lessonId: string;
}

interface UseDiveSessionReturn {
  sessionId: string | null;
  messages: DiveMessage[];
  isThinking: boolean;
  isLessonComplete: boolean;
  isCheckingSession: boolean;
  hasExistingSession: boolean;
  error: string | null;
  startSession: () => Promise<void>;
  sendReflection: (text: string) => Promise<void>;
  sendVoiceReflection: (recordingData: RecordingData) => Promise<void>;
}

/**
 * Custom hook for Dive session functionality
 * Manages real-time Firestore sync for dive lesson sessions
 */
export const useDiveSession = ({ lessonId }: UseDiveSessionProps): UseDiveSessionReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DiveMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { medium } = useHaptics();
  const { userId } = useApp();
  const { settings } = useSettings();

  // Get user's language from settings hook (stored in localStorage)
  const getUserLanguage = (): SupportedLanguage => {
    return settings.language;
  };

  // Check for existing active session on mount
  useEffect(() => {
    if (!userId || !lessonId) {
      setIsCheckingSession(false);
      return;
    }

    const checkExistingSession = async () => {
      try {
        const sessionsRef = collection(firestore, `users/${userId}/dive_sessions`);
        // Simple query - just filter by lessonId (no orderBy to avoid index requirement)
        const q = query(sessionsRef, where('lessonId', '==', lessonId));

        const snapshot = await getDocs(q);

        // Find the most recent active (not completed) session by sorting in code
        let bestSession: { id: string; createdAt: Date } | null = null;

        for (const doc of snapshot.docs) {
          const sessionData = doc.data();
          if (sessionData.status === 'active' && !sessionData.completedAt) {
            const createdAt = sessionData.createdAt?.toDate() || new Date(0);
            if (!bestSession || createdAt > bestSession.createdAt) {
              bestSession = { id: doc.id, createdAt };
            }
          }
        }

        if (bestSession) {
          console.log('Resuming existing dive session:', bestSession.id);
          setSessionId(bestSession.id);
          setHasExistingSession(true);
        }
      } catch (err) {
        console.error('Error checking for existing session:', err);
        // Don't set error - just proceed as if no session exists
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [userId, lessonId]);

  // Find or create active session for this lesson
  const startSession = useCallback(async () => {
    if (!userId || !lessonId) return;

    // If we already have a session (from the check), just ensure messages load
    if (sessionId) {
      return;
    }

    try {
      // Create a new session
      const sessionsRef = collection(firestore, `users/${userId}/dive_sessions`);
      const newSessionRef = doc(sessionsRef);

      await setDoc(newSessionRef, {
        lessonId,
        userId,
        status: 'active',
        language: getUserLanguage(),
        messageCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        completedAt: null,
      });

      setSessionId(newSessionRef.id);
      setIsThinking(true); // AI will send opening message
    } catch (err) {
      console.error('Error starting dive session:', err);
      setError(i18next.t('errors.dive.sessionFailed'));
    }
  }, [userId, lessonId, sessionId, settings.language]);

  // Real-time Firestore listener for messages
  useEffect(() => {
    if (!userId || !sessionId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(
      firestore,
      `users/${userId}/dive_sessions/${sessionId}/messages`
    );
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    let previousMessageCount = 0;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: DiveMessage[] = [];
        let hasNewGuideMessage = false;
        let lessonCompleted = false;

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();

            // Detect new guide response
            if (data.role === 'guide') {
              hasNewGuideMessage = true;
              setIsThinking(false);

              // Check if lesson was marked complete
              if (data.metadata?.isLessonComplete) {
                lessonCompleted = true;
              }
            }
          }
        });

        // Build complete messages array
        snapshot.forEach((doc) => {
          const data = doc.data();
          newMessages.push({
            id: doc.id,
            sessionId: data.sessionId,
            userId: data.userId,
            lessonId: data.lessonId,
            text: data.text || '',
            role: data.role,
            createdAt: data.createdAt?.toDate() || new Date(),
            hasAudio: data.hasAudio,
            audioPath: data.audioPath,
            audioDuration: data.audioDuration,
            transcriptionStatus: data.transcriptionStatus,
            metadata: data.metadata,
          });
        });

        setMessages(newMessages);

        // Update lesson complete status
        if (lessonCompleted) {
          setIsLessonComplete(true);
        }

        // Haptic feedback when guide responds (not on initial load)
        if (hasNewGuideMessage && previousMessageCount > 0) {
          medium();
        }

        previousMessageCount = newMessages.length;
        setError(null);
      },
      (err) => {
        console.error('Error listening to dive messages:', err);
        setError(i18next.t('errors.dive.connection'));
        setIsThinking(false);
      }
    );

    return () => unsubscribe();
  }, [userId, sessionId, medium]);

  // Send text reflection
  const sendReflection = useCallback(
    async (text: string) => {
      if (!userId || !sessionId) {
        setError(i18next.t('errors.dive.noSession'));
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      try {
        setIsThinking(true);
        setError(null);

        const messagesRef = collection(
          firestore,
          `users/${userId}/dive_sessions/${sessionId}/messages`
        );

        await addDoc(messagesRef, {
          userId,
          sessionId,
          lessonId,
          text: trimmedText,
          role: 'user',
          createdAt: Timestamp.now(),
          metadata: {
            language: getUserLanguage(),
            userLocalTime: Date.now(),
            userTimezoneOffset: new Date().getTimezoneOffset(),
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });

        // Timeout: Show error if no response after 45 seconds (longer for thoughtful responses)
        setTimeout(() => {
          setIsThinking((thinking) => {
            if (thinking) {
              setError(i18next.t('errors.dive.timeout'));
              return false;
            }
            return thinking;
          });
        }, 45000);
      } catch (err) {
        console.error('Error sending reflection:', err);
        setError(i18next.t('errors.dive.sendFailed'));
        setIsThinking(false);
      }
    },
    [userId, sessionId, lessonId, settings.language]
  );

  // Send voice reflection
  const sendVoiceReflection = useCallback(
    async (recordingData: RecordingData) => {
      if (!userId || !sessionId) {
        setError(i18next.t('errors.dive.noSession'));
        return;
      }

      try {
        setIsThinking(true);
        setError(null);

        const messageId = crypto.randomUUID();

        // Upload audio to Cloud Storage
        const audioPath = `dive-audio/${userId}/${sessionId}/${messageId}.m4a`;
        const storageRef = ref(storage, audioPath);

        await uploadBytes(storageRef, recordingData.blob, {
          contentType: recordingData.mimeType,
        });

        // Write message with audio metadata
        const messagesRef = collection(
          firestore,
          `users/${userId}/dive_sessions/${sessionId}/messages`
        );

        await addDoc(messagesRef, {
          userId,
          sessionId,
          lessonId,
          text: '', // Empty until transcribed
          role: 'user',
          hasAudio: true,
          audioPath,
          audioDuration: recordingData.duration,
          transcriptionStatus: 'pending',
          createdAt: Timestamp.now(),
          metadata: {
            audioFormat: recordingData.mimeType,
            language: getUserLanguage(),
            userLocalTime: Date.now(),
            userTimezoneOffset: new Date().getTimezoneOffset(),
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });
      } catch (err) {
        console.error('Error sending voice reflection:', err);
        setError(i18next.t('errors.dive.voiceFailed'));
        setIsThinking(false);
      }
    },
    [userId, sessionId, lessonId, settings.language]
  );

  return {
    sessionId,
    messages,
    isThinking,
    isLessonComplete,
    isCheckingSession,
    hasExistingSession,
    error,
    startSession,
    sendReflection,
    sendVoiceReflection,
  };
};
