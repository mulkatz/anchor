import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { generateConversationTitleAndSummary } from './conversationTitle';
import { flushUsage } from './usage';

/**
 * Auto-generate conversation title from first user message
 * Also triggers AI title generation after 3+ messages
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

    // Step 1: If title is default/empty, use truncation as fallback
    if (!conversationData.title || conversationData.title === 'New Conversation') {
      const title = afterData.text.substring(0, 50).trim();
      const preview = afterData.text.substring(0, 100).trim();

      await conversationRef.update({
        title: title || 'Untitled Conversation',
        preview: preview || '',
        'metadata.firstUserMessage': afterData.text,
      });

      logger.info('Updated conversation title (truncated)', { conversationId, title });
    }

    // Step 2: After 3+ user messages, generate AI title (draft) if not already done
    const messageCount = conversationData.messageCount || 0;
    const existingAiTitle = conversationData.metadata?.aiTitle;

    if (messageCount >= 3 && !existingAiTitle) {
      // Get user's language from message metadata or default
      const languageCode = afterData.metadata?.language || 'en-US';

      // Fetch recent messages for context (fire-and-forget)
      generateAiTitleAsync(userId, conversationId, languageCode, messageCount, conversationRef);
    }
  }
);

/**
 * Async helper for AI title generation (fire-and-forget)
 */
async function generateAiTitleAsync(
  userId: string,
  conversationId: string,
  languageCode: string,
  messageCount: number,
  conversationRef: admin.firestore.DocumentReference
): Promise<void> {
  try {
    const messagesSnapshot = await admin
      .firestore()
      .collection(`users/${userId}/conversations/${conversationId}/messages`)
      .where('role', 'in', ['user', 'assistant'])
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const messages = messagesSnapshot.docs
      .map((doc) => ({ role: doc.data().role, text: doc.data().text || '' }))
      .filter((m) => m.text.trim().length > 0) // Filter out empty messages (pending transcription)
      .reverse();

    if (messages.length < 2) {
      // Need at least 2 messages with content for meaningful title
      logger.info('Not enough messages with content for AI title', { conversationId });
      return;
    }

    const result = await generateConversationTitleAndSummary(
      userId,
      conversationId,
      messages,
      languageCode,
      'draft'
    );

    if (result) {
      await conversationRef.update({
        title: result.title,
        preview: result.summary,
        'metadata.aiTitle': result.title,
        'metadata.aiSummary': result.summary,
        'metadata.aiTopics': result.topics,
        'metadata.titleGeneration': {
          version: 'draft',
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          messageCountAtGeneration: messageCount,
        },
      });
      await flushUsage(userId);
      logger.info('AI title generated (draft)', { conversationId, title: result.title });
    }
  } catch (error) {
    logger.error('Failed to generate AI title', {
      conversationId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

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

/**
 * Regenerate final AI title when conversation is archived
 * Creates a refined title with full conversation context
 */
export const regenerateTitleOnArchive = onDocumentWritten(
  'users/{userId}/conversations/{conversationId}',
  async (event): Promise<void> => {
    const afterData = event.data?.after.data();
    const beforeData = event.data?.before.data();
    const conversationId = event.params.conversationId;
    const userId = event.params.userId;

    // Only trigger when status changes to 'archived'
    if (afterData?.status !== 'archived' || beforeData?.status === 'archived') {
      return;
    }

    const titleVersion = afterData.metadata?.titleGeneration?.version;

    // Skip if already has final title
    if (titleVersion === 'final') {
      return;
    }

    logger.info('Regenerating title on archive', { conversationId, userId });

    try {
      // Fetch all messages (use desc order since index exists, then reverse)
      const messagesSnapshot = await admin
        .firestore()
        .collection(`users/${userId}/conversations/${conversationId}/messages`)
        .where('role', 'in', ['user', 'assistant'])
        .orderBy('createdAt', 'desc')
        .get();

      if (messagesSnapshot.empty) {
        return;
      }

      const messages = messagesSnapshot.docs
        .map((doc) => ({
          role: doc.data().role,
          text: doc.data().text || '',
        }))
        .filter((m) => m.text.trim().length > 0) // Filter out empty messages
        .reverse(); // Reverse to chronological order (query was desc)

      if (messages.length < 2) {
        logger.info('Not enough messages with content for final AI title', { conversationId });
        return;
      }

      // Get language from first user message or default
      const firstUserMessage = messagesSnapshot.docs.find(
        (d) => d.data().role === 'user' && d.data().text?.trim()
      );
      const languageCode = firstUserMessage?.data().metadata?.language || 'en-US';

      const result = await generateConversationTitleAndSummary(
        userId,
        conversationId,
        messages,
        languageCode,
        'final'
      );

      if (result) {
        await admin
          .firestore()
          .doc(`users/${userId}/conversations/${conversationId}`)
          .update({
            title: result.title,
            preview: result.summary,
            'metadata.aiTitle': result.title,
            'metadata.aiSummary': result.summary,
            'metadata.aiTopics': result.topics,
            'metadata.titleGeneration': {
              version: 'final',
              generatedAt: admin.firestore.FieldValue.serverTimestamp(),
              messageCountAtGeneration: messages.length,
            },
          });
        await flushUsage(userId);
        logger.info('Final AI title generated on archive', { conversationId, title: result.title });
      }
    } catch (error) {
      logger.error('Failed to regenerate title on archive', {
        conversationId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);
