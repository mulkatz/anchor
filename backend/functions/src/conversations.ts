import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';

/**
 * Auto-generate conversation title from first user message
 * Triggered when a message is created or updated in a conversation
 */
export const generateConversationTitle = onDocumentWritten(
  'users/{userId}/conversations/{conversationId}/messages/{messageId}',
  async (event): Promise<void> => {
    const afterData = event.data?.after.data();
    const conversationId = event.params.conversationId;
    const userId = event.params.userId;

    // Only process user messages
    if (!afterData || afterData.role !== 'user') {
      return;
    }

    const conversationRef = admin
      .firestore()
      .doc(`users/${userId}/conversations/${conversationId}`);

    const conversationSnap = await conversationRef.get();
    const conversationData = conversationSnap.data();

    if (!conversationData) {
      logger.warn('Conversation not found', { userId, conversationId });
      return;
    }

    // Only update if title is default or empty
    if (!conversationData.title || conversationData.title === 'New Conversation') {
      const title = afterData.text.substring(0, 50).trim();
      const preview = afterData.text.substring(0, 100).trim();

      await conversationRef.update({
        title: title || 'Untitled Conversation',
        preview: preview || '',
        'metadata.firstUserMessage': afterData.text,
      });

      logger.info('Updated conversation title', { conversationId, title });
    }
  }
);

/**
 * Enforce single active conversation rule
 * When a new conversation is created with status='active',
 * auto-archive any other active conversations
 */
export const enforceSingleActiveConversation = onDocumentWritten(
  'users/{userId}/conversations/{conversationId}',
  async (event): Promise<void> => {
    const afterData = event.data?.after.data();
    const beforeData = event.data?.before.data();
    const userId = event.params.userId;
    const conversationId = event.params.conversationId;

    // Only trigger if status changed to 'active' or new active conversation created
    if (afterData?.status !== 'active') {
      return;
    }

    // If already active before, skip (no change)
    if (beforeData?.status === 'active') {
      return;
    }

    logger.info('New active conversation detected, archiving others', {
      userId,
      conversationId,
    });

    // Find all other active conversations
    const conversationsRef = admin.firestore().collection(`users/${userId}/conversations`);

    const activeConversations = await conversationsRef
      .where('status', '==', 'active')
      .where(admin.firestore.FieldPath.documentId(), '!=', conversationId)
      .get();

    if (activeConversations.empty) {
      logger.info('No other active conversations to archive', { userId });
      return;
    }

    // Auto-archive them
    const batch = admin.firestore().batch();

    activeConversations.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'archived',
        archivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    logger.info('Auto-archived conversations', {
      userId,
      count: activeConversations.size,
    });
  }
);
