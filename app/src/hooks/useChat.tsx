import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { firestore, auth } from '../services/firebase.service';
import { useHaptics } from './useHaptics';
import type { Message } from '../models';

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

  const userId = auth.currentUser?.uid;

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
            text: data.text,
            role: data.role,
            createdAt: data.createdAt?.toDate() || new Date(),
            isCrisisResponse: data.isCrisisResponse,
            metadata: data.metadata,
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
        setError('Unable to connect to chat. Please check your connection.');
        setIsThinking(false);
      }
    );

    return () => unsubscribe();
  }, [userId, conversationId, medium]);

  // Send message function
  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId) {
        setError('Not authenticated');
        return;
      }

      if (!conversationId) {
        setError('No active conversation');
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
        });

        // Timeout: Show error if no response after 30 seconds
        setTimeout(() => {
          setIsThinking((thinking) => {
            if (thinking) {
              setError(
                'Response taking longer than expected. Please try again or reach out to a crisis line.'
              );
              return false;
            }
            return thinking;
          });
        }, 30000);
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message. Please try again.');
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
  };
};
