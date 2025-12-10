import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import i18next from 'i18next';
import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import type { Conversation } from '../models';

export const useConversation = () => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get userId from context (reactive to auth state changes)
  const { userId, isAuthLoading } = useApp();

  // Listen to active conversation
  useEffect(() => {
    // Wait for auth to complete before trying to access conversations
    if (isAuthLoading) {
      return;
    }

    if (!userId) {
      setIsLoading(false);
      return;
    }

    const conversationsRef = collection(firestore, `users/${userId}/conversations`);
    const q = query(
      conversationsRef,
      where('status', '==', 'active'),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setActiveConversation({
            id: doc.id,
            userId: data.userId,
            status: data.status,
            title: data.title,
            preview: data.preview,
            messageCount: data.messageCount,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            archivedAt: data.archivedAt?.toDate() || null,
            metadata: data.metadata,
          });
        } else {
          setActiveConversation(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to conversations:', err);
        setError(i18next.t('errors.conversation.loadFailed'));
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, isAuthLoading]);

  // Create new conversation (and auto-archive current via Cloud Function)
  const createNewConversation = useCallback(async (): Promise<string> => {
    if (!userId) {
      throw new Error(i18next.t('errors.conversation.notAuthenticated'));
    }

    try {
      // Check if current conversation is empty - reuse it instead of archiving
      if (activeConversation && activeConversation.messageCount === 0) {
        console.log('Reusing empty conversation:', activeConversation.id);
        return activeConversation.id;
      }

      console.log('Creating new conversation for user:', userId);
      const conversationsRef = collection(firestore, `users/${userId}/conversations`);

      const newConversation = await addDoc(conversationsRef, {
        userId,
        status: 'active',
        title: 'New Conversation',
        preview: '',
        messageCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        archivedAt: null,
        metadata: {},
      });

      console.log('New conversation created:', newConversation.id);
      return newConversation.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw new Error(i18next.t('errors.conversation.createFailed'));
    }
  }, [userId, activeConversation]);

  // Archive current conversation
  const archiveConversation = useCallback(
    async (conversationId: string) => {
      if (!userId) {
        throw new Error(i18next.t('errors.conversation.notAuthenticated'));
      }

      try {
        const conversationRef = doc(firestore, `users/${userId}/conversations/${conversationId}`);

        await updateDoc(conversationRef, {
          status: 'archived',
          archivedAt: Timestamp.now(),
        });
      } catch (err) {
        console.error('Error archiving conversation:', err);
        throw new Error(i18next.t('errors.conversation.archiveFailed'));
      }
    },
    [userId]
  );

  // Unarchive conversation (makes it active, Cloud Function archives others)
  const unarchiveConversation = useCallback(
    async (conversationId: string) => {
      if (!userId) {
        throw new Error(i18next.t('errors.conversation.notAuthenticated'));
      }

      try {
        const conversationRef = doc(firestore, `users/${userId}/conversations/${conversationId}`);

        await updateDoc(conversationRef, {
          status: 'active',
          archivedAt: null,
          updatedAt: Timestamp.now(),
        });
        // Cloud function will auto-archive other active conversations
      } catch (err) {
        console.error('Error unarchiving conversation:', err);
        throw new Error(i18next.t('errors.conversation.unarchiveFailed'));
      }
    },
    [userId]
  );

  return {
    activeConversation,
    isLoading,
    error,
    createNewConversation,
    archiveConversation,
    unarchiveConversation,
  };
};
