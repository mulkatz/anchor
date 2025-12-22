import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { VertexAI } from '@google-cloud/vertexai';
import { detectCrisisKeywords, getCrisisResponse, getSystemPrompt } from './languageConfig';
import {
  getRelativeTimeForAI,
  detectSessionBreak,
  getSessionBreakDescription,
  getCurrentContextTimestamp,
  getTimeOfDay,
} from './temporal';
import {
  getConversationProfile,
  updateConversationProfile,
  analyzeUserStyle,
  shouldWaitForAnalysis,
} from './adaptiveLanguage';
import {
  extractStoryFromMessage,
  getLocalizedStoryContext,
  getLocalizedRecentTopicsContext,
} from './userStory';

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

      // 6. Fetch Context: Get last 75 messages for conversation history
      const messagesSnapshot = await admin
        .firestore()
        .collection(`users/${userId}/conversations/${conversationId}/messages`)
        .where('role', 'in', ['user', 'assistant']) // Exclude crisis messages
        .orderBy('createdAt', 'desc')
        .limit(75)
        .get();

      // Use user's local time (sent from frontend as epoch timestamp) instead of server time
      // This ensures temporal context is accurate to the user's timezone (including DST)
      let now = new Date();
      const userTimezone = message.metadata?.userTimezone;

      if (message.metadata?.userLocalTime) {
        // userLocalTime is epoch timestamp (milliseconds since 1970)
        now = new Date(message.metadata.userLocalTime);
        logger.info('Using user local time for temporal context', {
          userId,
          userLocalTimeEpoch: message.metadata.userLocalTime,
          userLocalTimeFormatted: now.toISOString(),
          userTimezone,
          userTimezoneOffset: message.metadata.userTimezoneOffset,
          serverTime: new Date().toISOString(),
        });
      } else {
        logger.warn('No user local time provided, falling back to server time', { userId });
      }
      const conversationHistory = messagesSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const timestamp = data.createdAt?.toDate() || now;

          return {
            role: data.role,
            text: data.text,
            timestamp,
          };
        })
        .reverse(); // Oldest first for proper context

      logger.info('Fetched conversation history', {
        userId,
        conversationId,
        historyLength: conversationHistory.length,
      });

      // 7. Build temporal context for system prompt (with timezone awareness)
      const currentTime = getCurrentContextTimestamp(now, userTimezone);
      const timeOfDay = getTimeOfDay(now, userTimezone);

      // Detect session breaks (>4 hours since last message)
      let sessionBreakNote = '';
      if (conversationHistory.length > 0) {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        if (detectSessionBreak(lastMessage.timestamp, now)) {
          const breakDescription = getSessionBreakDescription(lastMessage.timestamp, now);
          sessionBreakNote = `\n\nNote: The user is returning to this conversation ${breakDescription}. Acknowledge the time gap naturally if relevant (e.g., "hey, good to hear from you again" or "how've you been since we last talked?").`;
        }
      }

      const temporalContext = `${currentTime} (${timeOfDay})${sessionBreakNote}

IMPORTANT: You can now reference when things happened in your conversation. Each message has a timestamp showing when it was sent relative to now. Use this to make your responses more natural and contextually aware (e.g., "you mentioned yesterday that...", "earlier today you said...", "I remember you talked about this last week...").`;

      logger.info('Built temporal context', {
        userId,
        currentTime,
        timeOfDay,
        hasSessionBreak: sessionBreakNote !== '',
      });

      // 7.5 Adaptive Language: Update profile and analyze BEFORE generating response
      // This ensures the AI has the freshest style profile available
      let conversationProfile: string | undefined;

      try {
        // Update profile with this message
        const { shouldAnalyze, sampleMessages, totalCount } = await updateConversationProfile(
          userId,
          { text: message.text, conversationId }
        );

        if (shouldAnalyze && sampleMessages.length > 0) {
          const waitForIt = shouldWaitForAnalysis(totalCount);

          if (waitForIt) {
            // First 3 messages: WAIT for analysis to complete before responding
            logger.info('Running synchronous style analysis', { userId, totalCount });
            await analyzeUserStyle(userId, sampleMessages);
          } else {
            // After 3 messages: fire-and-forget (don't block response)
            logger.info('Triggering async style analysis', { userId, totalCount });
            analyzeUserStyle(userId, sampleMessages).catch((err) => {
              logger.error('Background style analysis failed', {
                userId,
                error: err instanceof Error ? err.message : String(err),
              });
            });
          }
        }

        // Now fetch the (potentially freshly updated) profile
        conversationProfile = await getConversationProfile(userId);
      } catch (profileError) {
        // Don't fail the main message flow if profile operations fail
        logger.error('Failed in adaptive language processing', {
          userId,
          error: profileError instanceof Error ? profileError.message : String(profileError),
        });
      }

      // 7.6 User Story + Mid-Term Memory: Extract personal info and get context for prompt
      let userStoryContext: string | undefined;
      let recentTopicsContext: string | undefined;

      try {
        // Build recent messages context for extraction
        const recentMessages = conversationHistory.slice(-3).map((msg) => ({
          role: msg.role,
          text: msg.text,
        }));

        // Async extraction (fire-and-forget) - don't block response
        // This now also extracts topics to mid-term memory
        extractStoryFromMessage(userId, message.text, recentMessages, languageCode).catch((err) => {
          logger.error('Background story extraction failed', {
            userId,
            error: err instanceof Error ? err.message : String(err),
          });
        });

        // Get both contexts IN PARALLEL - don't add unnecessary latency!
        const [storyContext, topicsContext] = await Promise.all([
          getLocalizedStoryContext(userId, languageCode),
          getLocalizedRecentTopicsContext(userId, languageCode),
        ]);
        userStoryContext = storyContext;
        recentTopicsContext = topicsContext;
      } catch (storyError) {
        // Don't fail the main message flow if story operations fail
        logger.error('Failed in user story processing', {
          userId,
          error: storyError instanceof Error ? storyError.message : String(storyError),
        });
      }

      // 8. Build Gemini Conversation Format with temporal awareness (timezone-aware)
      const contents = conversationHistory.map((msg) => {
        const relativeTime = getRelativeTimeForAI(msg.timestamp, now, userTimezone);
        const textWithTimestamp = `[${relativeTime}] ${msg.text}`;

        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: textWithTimestamp }],
        };
      });

      // 9. Get language-specific system prompt with temporal context, adaptive language, user story, and recent topics
      const systemPrompt = getSystemPrompt(
        languageCode,
        temporalContext,
        conversationProfile,
        userStoryContext,
        recentTopicsContext
      );
      logger.info('Using system prompt', {
        languageCode,
        hasTemporalContext: !!temporalContext,
        hasConversationProfile: !!conversationProfile,
        hasUserStoryContext: !!userStoryContext,
        hasRecentTopicsContext: !!recentTopicsContext,
      });

      // 10. Call Vertex AI (Gemini 2.5 Flash)
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

      // 11. Write Assistant Response to Firestore
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

      // 12. Update Conversation Metadata
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
