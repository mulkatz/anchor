import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../services/firebase.service';
import type { Conversation } from '../models';

export const useArchive = () => {
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = auth.currentUser?.uid;

  // Listen to archived conversations
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const conversationsRef = collection(firestore, `users/${userId}/conversations`);
    const q = query(
      conversationsRef,
      where('status', '==', 'archived'),
      orderBy('archivedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const conversations: Conversation[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          conversations.push({
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
        });

        setArchivedConversations(conversations);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error listening to archived conversations:', err);
        setError('Failed to load archived conversations');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Delete conversation permanently
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        const conversationRef = doc(firestore, `users/${userId}/conversations/${conversationId}`);
        await deleteDoc(conversationRef);
        // Note: Messages subcollection will need manual deletion or Cloud Function cleanup
      } catch (err) {
        console.error('Error deleting conversation:', err);
        throw new Error('Failed to delete conversation');
      }
    },
    [userId]
  );

  return {
    archivedConversations,
    isLoading,
    error,
    deleteConversation,
  };
};
