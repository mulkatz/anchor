import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { VertexAI } from '@google-cloud/vertexai';
import { detectCrisisKeywords, getCrisisResponse, getSystemPrompt } from './languageConfig';

/**
 * Cloud Function: onMessageCreate
 * Triggered when a message is created or updated in Firestore
 * Responds with AI-generated therapeutic messages or crisis resources
 *
 * Note: Uses onDocumentWritten to handle both:
 * 1. New text messages (created)
 * 2. Voice messages after transcription completes (updated)
 */
export const onMessageCreate = onDocumentWritten(
  'users/{userId}/conversations/{conversationId}/messages/{messageId}',
  async (event): Promise<void> => {
    const snap = event.data?.after;
    if (!snap) {
      logger.error('No data in snapshot');
      return;
    }

    const message = snap.data();
    const userId = event.params.userId;
    const conversationId = event.params.conversationId;

    // 1. Validate: Check message exists
    if (!message) {
      logger.error('Message data is undefined');
      return;
    }

    // 2. Validate: Only process user messages
    if (message.role !== 'user') {
      logger.info('Skipping non-user message', { userId, conversationId, role: message.role });
      return;
    }

    // 3. Skip audio messages that are still being transcribed
    if (message.hasAudio && message.transcriptionStatus === 'pending') {
      logger.info('Skipping message with pending transcription', {
        userId,
        conversationId,
        messageId: snap.id,
      });
      return;
    }

    logger.info('Processing user message', { userId, conversationId, messageId: snap.id });

    try {
      // 4. Get user's language from message metadata (fallback to en-US)
      const languageCode = message.metadata?.language || 'en-US';
      logger.info('Using language for AI response', { languageCode });

      // 5. Crisis Detection: Check for self-harm keywords BEFORE AI call
      const hasCrisisKeyword = detectCrisisKeywords(message.text, languageCode);

      if (hasCrisisKeyword) {
        logger.warn('Crisis keyword detected', {
          userId,
          conversationId,
          languageCode,
          text: message.text,
        });

        // Get language-specific crisis response
        const crisisResponse = getCrisisResponse(languageCode);

        // Write crisis response immediately and exit
        await admin
          .firestore()
          .collection(`users/${userId}/conversations/${conversationId}/messages`)
          .add({
            ...crisisResponse,
            userId,
            conversationId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        // Update conversation metadata
        await admin
          .firestore()
          .doc(`users/${userId}/conversations/${conversationId}`)
          .update({
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            messageCount: admin.firestore.FieldValue.increment(1),
            'metadata.hasCrisisMessages': true,
          });

        return;
      }

      // 6. Fetch Context: Get last 50 messages for conversation history
      const messagesSnapshot = await admin
        .firestore()
        .collection(`users/${userId}/conversations/${conversationId}/messages`)
        .where('role', 'in', ['user', 'assistant']) // Exclude crisis messages
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      const conversationHistory = messagesSnapshot.docs
        .map((doc) => ({
          role: doc.data().role,
          text: doc.data().text,
        }))
        .reverse(); // Oldest first for proper context

      logger.info('Fetched conversation history', {
        userId,
        conversationId,
        historyLength: conversationHistory.length,
      });

      // 7. Build Gemini Conversation Format
      const contents = conversationHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      // 8. Get language-specific system prompt
      const systemPrompt = getSystemPrompt(languageCode);
      logger.info('Using system prompt for language', { languageCode });

      // 9. Call Vertex AI (Gemini 2.5 Flash)
      const vertexAI = new VertexAI({
        project: process.env.GCLOUD_PROJECT,
        location: 'us-central1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt, // Use dynamic language-specific prompt
      });

      const startTime = Date.now();
      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: 8192, // Allow deep, comprehensive responses (~6000 words)
          temperature: 0.7, // Balanced creativity
          topP: 0.9,
          topK: 40,
        },
      });

      const responseTime = Date.now() - startTime;

      // Debug: Log full response structure
      const candidate = result.response.candidates?.[0];
      logger.info('Gemini raw response', {
        userId,
        finishReason: candidate?.finishReason,
        safetyRatings: candidate?.safetyRatings,
        partsCount: candidate?.content?.parts?.length,
        fullResponse: JSON.stringify(candidate),
      });

      const responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm here for you. Can you tell me more about what you're feeling?";

      logger.info('AI response generated', {
        userId,
        conversationId,
        responseTime,
        messageLength: responseText.length,
        actualText: responseText,
      });

      // 10. Write Assistant Response to Firestore
      await admin
        .firestore()
        .collection(`users/${userId}/conversations/${conversationId}/messages`)
        .add({
          userId,
          conversationId,
          role: 'assistant',
          text: responseText,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            model: 'gemini-2.5-flash',
            responseTime,
          },
        });

      // 11. Update Conversation Metadata
      await admin
        .firestore()
        .doc(`users/${userId}/conversations/${conversationId}`)
        .update({
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          messageCount: admin.firestore.FieldValue.increment(1),
        });
    } catch (error) {
      logger.error('Error processing message', { userId, conversationId, error });

      // Write fallback error message
      await admin
        .firestore()
        .collection(`users/${userId}/conversations/${conversationId}/messages`)
        .add({
          userId,
          conversationId,
          role: 'assistant',
          text: "I'm having trouble connecting right now. Please try again in a moment, or reach out to a crisis line if you need immediate support.",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      throw error; // Trigger Function retry
    }
  }
);
