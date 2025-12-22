import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import i18next from 'i18next';
import { firestore, storage } from '../services/firebase.service';
import { useHaptics } from './useHaptics';
import { useApp } from '../contexts/AppContext';
import type { Message, SupportedLanguage } from '../models';
import type { RecordingData } from './useVoiceRecorder';

interface UseChatProps {
  conversationId: string | null;
}

/**
 * Custom hook for Deep Talk chat functionality
 * Manages real-time Firestore sync and message sending
 */
export const useChat = ({ conversationId }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingVoiceMessage, setPendingVoiceMessage] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { medium } = useHaptics();

  // Get userId from context (reactive to auth state changes)
  const { userId } = useApp();

  // Get user's language from localStorage
  const getUserLanguage = (): SupportedLanguage => {
    const stored = localStorage.getItem('language') as SupportedLanguage | null;
    return stored || 'en-US';
  };

  // Track previous transcription statuses to detect completion
  const prevTranscriptionStatuses = useRef<Map<string, string>>(new Map());
  // Ref to track pending voice message for use in listener callback
  const pendingVoiceRef = useRef<Message | null>(null);
  pendingVoiceRef.current = pendingVoiceMessage;
  // Ref to track timeout for "taking longer" message
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset loading state and clear timeout when conversation changes
  useEffect(() => {
    setIsLoading(true);
    // Clear any pending timeout when conversation changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [conversationId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Real-time Firestore listener for messages in specific conversation
  useEffect(() => {
    // If no userId or conversationId, clear messages
    if (!userId || !conversationId) {
      setMessages([]);
      setIsLoading(false);
      prevTranscriptionStatuses.current.clear();
      return;
    }

    const messagesRef = collection(
      firestore,
      `users/${userId}/conversations/${conversationId}/messages`
    );
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    let previousMessageCount = 0;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newMessages: Message[] = [];
        let hasNewAssistantMessage = false;
        let transcriptionJustCompleted = false;
        let realAudioMessageArrived = false;

        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          const docId = change.doc.id;

          if (change.type === 'added') {
            // Detect new assistant response (including crisis messages)
            if (data.role === 'assistant' || data.role === 'crisis') {
              hasNewAssistantMessage = true;
            }

            // Detect when real audio message arrives from Firestore
            if (data.hasAudio && data.role === 'user') {
              realAudioMessageArrived = true;
            }

            // Track initial transcription status for new voice messages
            if (data.hasAudio && data.transcriptionStatus) {
              prevTranscriptionStatuses.current.set(docId, data.transcriptionStatus);
            }
          }

          if (change.type === 'modified') {
            // Detect transcription completion: pending → completed
            if (data.hasAudio && data.role === 'user') {
              const prevStatus = prevTranscriptionStatuses.current.get(docId);
              if (prevStatus === 'pending' && data.transcriptionStatus === 'completed') {
                transcriptionJustCompleted = true;
              }
              prevTranscriptionStatuses.current.set(docId, data.transcriptionStatus);
            }
          }
        });

        // Build complete messages array
        snapshot.forEach((doc) => {
          const data = doc.data();
          newMessages.push({
            id: doc.id,
            userId: data.userId,
            conversationId: data.conversationId,
            text: data.text || '',
            role: data.role,
            createdAt: data.createdAt?.toDate() || new Date(),
            isCrisisResponse: data.isCrisisResponse,
            metadata: data.metadata,
            // Voice message fields
            hasAudio: data.hasAudio,
            audioPath: data.audioPath,
            audioDuration: data.audioDuration,
            transcriptionStatus: data.transcriptionStatus,
          } as Message);
        });

        setMessages(newMessages);
        setIsLoading(false);

        // Clear pending voice message after real one arrives (with delay to allow animation)
        if (realAudioMessageArrived && pendingVoiceRef.current) {
          // Small delay so the real message renders with skipAnimation before we clear pending
          setTimeout(() => setPendingVoiceMessage(null), 100);
        }

        if (hasNewAssistantMessage) {
          setIsThinking(false);
          // Clear the timeout when response arrives
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
        if (transcriptionJustCompleted) {
          setIsThinking(true);
        }

        // Haptic feedback when AI responds (but not on initial load)
        if (hasNewAssistantMessage && previousMessageCount > 0) {
          medium();
        }

        previousMessageCount = newMessages.length;
        setError(null);
      },
      (err) => {
        console.error('Error listening to messages:', err);
        setError(i18next.t('errors.chat.connection'));
        setIsThinking(false);
      }
    );

    return () => unsubscribe();
  }, [userId, conversationId, medium]);

  // Send message function
  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId) {
        setError(i18next.t('errors.chat.voiceNotAuthenticated'));
        return;
      }

      if (!conversationId) {
        setError(i18next.t('errors.chat.noConversation'));
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      try {
        setIsThinking(true);
        setError(null);

        const messagesRef = collection(
          firestore,
          `users/${userId}/conversations/${conversationId}/messages`
        );

        await addDoc(messagesRef, {
          userId,
          conversationId,
          text: trimmedText,
          role: 'user',
          createdAt: Timestamp.now(),
          metadata: {
            language: getUserLanguage(), // Pass user language to backend
            userLocalTime: Date.now(), // Epoch timestamp (ms) - timezone agnostic!
            userTimezoneOffset: new Date().getTimezoneOffset(), // Timezone offset in minutes (for reference)
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // e.g., "Europe/Berlin"
          },
        });

        // Clear any existing timeout before setting a new one
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Timeout: Show error if no response after 12 seconds
        timeoutRef.current = setTimeout(() => {
          setIsThinking((thinking) => {
            if (thinking) {
              setError(i18next.t('errors.chat.timeout'));
              return false;
            }
            return thinking;
          });
          timeoutRef.current = null;
        }, 12000);
      } catch (err) {
        console.error('Error sending message:', err);
        setError(i18next.t('errors.chat.sendFailed'));
        setIsThinking(false);
      }
    },
    [userId, conversationId]
  );

  // Send voice message function
  const sendVoiceMessage = useCallback(
    async (recordingData: RecordingData) => {
      if (!userId) {
        setError(i18next.t('errors.chat.voiceNotAuthenticated'));
        return;
      }

      if (!conversationId) {
        setError(i18next.t('errors.chat.voiceNoConversation'));
        return;
      }

      try {
        // Don't set isThinking here - wait for transcription to complete first
        // The listener will set isThinking when transcriptionStatus changes to 'completed'
        setError(null);

        // Show "Transcribing..." message immediately when recording stops
        const pendingMessage: Message = {
          id: 'pending-voice-' + Date.now(),
          userId,
          conversationId,
          text: '',
          role: 'user',
          createdAt: new Date(),
          hasAudio: true,
          audioDuration: recordingData.duration,
          transcriptionStatus: 'pending',
        };
        setPendingVoiceMessage(pendingMessage);

        // Generate unique message ID
        const messageId = crypto.randomUUID();

        // Upload audio to Cloud Storage
        const audioPath = `audio-messages/${userId}/${conversationId}/${messageId}.m4a`;
        const storageRef = ref(storage, audioPath);

        await uploadBytes(storageRef, recordingData.blob, {
          contentType: recordingData.mimeType,
        });

        // Write Firestore message with audio metadata
        const messagesRef = collection(
          firestore,
          `users/${userId}/conversations/${conversationId}/messages`
        );

        await addDoc(messagesRef, {
          userId,
          conversationId,
          text: '', // Empty until transcribed
          role: 'user',
          hasAudio: true,
          audioPath,
          audioDuration: recordingData.duration,
          transcriptionStatus: 'pending',
          createdAt: Timestamp.now(),
          metadata: {
            audioFormat: recordingData.mimeType, // Store full mimeType for backend
            language: getUserLanguage(), // Pass user language for transcription
            userLocalTime: Date.now(), // Epoch timestamp (ms) - timezone agnostic!
            userTimezoneOffset: new Date().getTimezoneOffset(), // Timezone offset in minutes (for reference)
            userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // e.g., "Europe/Berlin"
          },
        });

        // Note: Backend Cloud Function will handle transcription
        // uploadingVoice is cleared by the Firestore listener when the message arrives
        // isThinking will be set to false when transcription completes
      } catch (err) {
        console.error('Error sending voice message:', err);
        setError(i18next.t('errors.chat.voiceSendFailed'));
        setPendingVoiceMessage(null);
        setIsThinking(false);
      }
    },
    [userId, conversationId]
  );

  // Combine real messages with pending voice message (shows "Transcribing..." immediately)
  // Once real audio message arrives from Firestore, don't include the pending one
  const allMessages = (() => {
    if (!pendingVoiceMessage) return messages;

    // Check if real audio message has arrived (last message is audio from user)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.hasAudio && lastMessage?.role === 'user') {
      // Real message exists, don't show pending
      return messages;
    }

    // Still waiting for real message, show pending
    return [...messages, pendingVoiceMessage];
  })();

  return {
    messages: allMessages,
    isLoading,
    isThinking,
    hasPendingVoice: !!pendingVoiceMessage,
    error,
    sendMessage,
    sendVoiceMessage,
  };
};
