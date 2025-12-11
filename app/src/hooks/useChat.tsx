import { useState, useEffect, useCallback } from 'react';
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
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { medium } = useHaptics();

  // Get userId from context (reactive to auth state changes)
  const { userId } = useApp();

  // Get user's language from localStorage
  const getUserLanguage = (): SupportedLanguage => {
    const stored = localStorage.getItem('language') as SupportedLanguage | null;
    return stored || 'en-US';
  };

  // Real-time Firestore listener for messages in specific conversation
  useEffect(() => {
    // If no userId or conversationId, clear messages
    if (!userId || !conversationId) {
      setMessages([]);
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

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();

            // Detect new assistant response (including crisis messages)
            if (data.role === 'assistant' || data.role === 'crisis') {
              hasNewAssistantMessage = true;
              setIsThinking(false);
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

        // Timeout: Show error if no response after 30 seconds
        setTimeout(() => {
          setIsThinking((thinking) => {
            if (thinking) {
              setError(i18next.t('errors.chat.timeout'));
              return false;
            }
            return thinking;
          });
        }, 30000);
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
        setIsThinking(true);
        setError(null);

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
        // isThinking will be set to false when transcription completes
      } catch (err) {
        console.error('Error sending voice message:', err);
        setError(i18next.t('errors.chat.voiceSendFailed'));
        setIsThinking(false);
      }
    },
    [userId, conversationId]
  );

  return {
    messages,
    isThinking,
    error,
    sendMessage,
    sendVoiceMessage,
  };
};
