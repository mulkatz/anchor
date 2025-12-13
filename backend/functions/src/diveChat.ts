import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import { buildDiveSystemPrompt, buildLessonOpeningPrompt } from './divePrompt';
import { detectCrisisKeywords, getCrisisResponse } from './languageConfig';
import {
  getRelativeTimeForAI,
  detectSessionBreak,
  getSessionBreakDescription,
  getCurrentContextTimestamp,
  getTimeOfDay,
} from './temporal';
import { getLocalizedLesson, type SupportedLanguage, type DiveLessonFull } from './diveLessonData';

/**
 * Cloud Function: onDiveMessageCreate
 * Triggered when a message is created in a dive session
 * Responds with Somatic Guide AI messages and tracks lesson completion
 */
export const onDiveMessageCreate = onDocumentWritten(
  'users/{userId}/dive_sessions/{sessionId}/messages/{messageId}',
  async (event): Promise<void> => {
    const snap = event.data?.after;
    if (!snap) {
      logger.error('No data in snapshot');
      return;
    }

    const message = snap.data();
    const userId = event.params.userId;
    const sessionId = event.params.sessionId;

    // 1. Validate message exists
    if (!message) {
      logger.error('Message data is undefined');
      return;
    }

    // 2. Only process user messages
    if (message.role !== 'user') {
      logger.info('Skipping non-user message', { userId, sessionId, role: message.role });
      return;
    }

    // 3. Skip audio messages still being transcribed
    if (message.hasAudio && message.transcriptionStatus === 'pending') {
      logger.info('Skipping message with pending transcription', {
        userId,
        sessionId,
        messageId: snap.id,
      });
      return;
    }

    logger.info('Processing dive message', { userId, sessionId, messageId: snap.id });

    try {
      // 4. Get session data to find lessonId
      const sessionDoc = await admin
        .firestore()
        .doc(`users/${userId}/dive_sessions/${sessionId}`)
        .get();

      const sessionData = sessionDoc.data();
      if (!sessionData) {
        logger.error('Session not found', { userId, sessionId });
        return;
      }

      const lessonId = sessionData.lessonId;

      // 5. Get language from message metadata
      const languageCode = (message.metadata?.language || 'en-US') as SupportedLanguage;

      // Get localized lesson content
      const lesson = getLocalizedLesson(lessonId, languageCode);

      if (!lesson) {
        logger.error('Lesson not found', { lessonId, languageCode });
        return;
      }

      logger.info('Processing dive session', { lessonId, languageCode, zone: lesson.zone });

      // 6. Crisis Detection (still applies in The Dive)
      const hasCrisisKeyword = detectCrisisKeywords(message.text, languageCode);

      if (hasCrisisKeyword) {
        logger.warn('Crisis keyword detected in dive session', {
          userId,
          sessionId,
          lessonId,
          languageCode,
        });

        const crisisResponse = getCrisisResponse(languageCode);

        await admin
          .firestore()
          .collection(`users/${userId}/dive_sessions/${sessionId}/messages`)
          .add({
            ...crisisResponse,
            userId,
            sessionId,
            lessonId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

        return;
      }

      // 7. Fetch conversation history (last 30 messages for dive sessions)
      const messagesSnapshot = await admin
        .firestore()
        .collection(`users/${userId}/dive_sessions/${sessionId}/messages`)
        .where('role', 'in', ['user', 'guide'])
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();

      // Use user's local time
      let now = new Date();
      const userTimezone = message.metadata?.userTimezone;

      if (message.metadata?.userLocalTime) {
        now = new Date(message.metadata.userLocalTime);
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
        .reverse();

      // 8. Build temporal context
      const currentTime = getCurrentContextTimestamp(now, userTimezone);
      const timeOfDay = getTimeOfDay(now, userTimezone);

      let sessionBreakNote = '';
      if (conversationHistory.length > 0) {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        if (detectSessionBreak(lastMessage.timestamp, now)) {
          const breakDescription = getSessionBreakDescription(lastMessage.timestamp, now);
          sessionBreakNote = `\n\nNote: The user is returning to this lesson ${breakDescription}. Acknowledge this gently, perhaps asking if they're ready to continue where they left off.`;
        }
      }

      const temporalContext = `${currentTime} (${timeOfDay})${sessionBreakNote}`;

      // 9. Build Gemini conversation format
      const contents = conversationHistory.map((msg) => {
        const relativeTime = getRelativeTimeForAI(msg.timestamp, now, userTimezone);
        const textWithTimestamp = `[${relativeTime}] ${msg.text}`;

        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: textWithTimestamp }],
        };
      });

      // 10. Build Somatic Guide system prompt with lesson context
      const systemPrompt = buildDiveSystemPrompt(lesson, languageCode, temporalContext);
      logger.info('Built dive system prompt', { lessonId, zone: lesson.zone });

      // 11. Call Vertex AI
      const vertexAI = new VertexAI({
        project: process.env.GCLOUD_PROJECT,
        location: 'us-central1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
      });

      const startTime = Date.now();
      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: 4096, // Shorter than regular chat - atmospheric, not verbose
          temperature: 0.8, // Slightly more creative for poetic responses
          topP: 0.9,
          topK: 40,
        },
      });

      const responseTime = Date.now() - startTime;

      let responseText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
        'I am here with you in the water. Take your time.';

      // 12. Check for lesson completion marker
      const isLessonComplete = responseText.includes('[LESSON_COMPLETE]');

      // Remove the marker from the visible response
      if (isLessonComplete) {
        responseText = responseText.replace('[LESSON_COMPLETE]', '').trim();
        logger.info('Lesson marked as complete', { userId, sessionId, lessonId });
      }

      logger.info('Dive AI response generated', {
        userId,
        sessionId,
        lessonId,
        responseTime,
        messageLength: responseText.length,
        isLessonComplete,
      });

      // 13. Write Guide Response to Firestore
      await admin
        .firestore()
        .collection(`users/${userId}/dive_sessions/${sessionId}/messages`)
        .add({
          userId,
          sessionId,
          lessonId,
          role: 'guide',
          text: responseText,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            model: 'gemini-2.5-flash',
            responseTime,
            isLessonComplete,
          },
        });

      // 14. Update session metadata
      await admin
        .firestore()
        .doc(`users/${userId}/dive_sessions/${sessionId}`)
        .update({
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          messageCount: admin.firestore.FieldValue.increment(1),
        });

      // 15. If lesson complete, update progress
      if (isLessonComplete) {
        await updateLessonProgress(userId, lessonId);
      }
    } catch (error) {
      logger.error('Error processing dive message', { userId, sessionId, error });

      // Write fallback error message
      await admin
        .firestore()
        .collection(`users/${userId}/dive_sessions/${sessionId}/messages`)
        .add({
          userId,
          sessionId,
          role: 'guide',
          text: 'The waters have grown still for a moment. Let me surface and try again...',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      throw error;
    }
  }
);

/**
 * Update user's lesson progress when a lesson is completed
 */
async function updateLessonProgress(userId: string, completedLessonId: string): Promise<void> {
  const progressRef = admin.firestore().doc(`users/${userId}/dive_progress/summary`);

  try {
    const progressDoc = await progressRef.get();

    // Determine next lesson ID
    const currentNum = parseInt(completedLessonId.replace('L', ''), 10);
    const nextLessonId = `L${String(currentNum + 1).padStart(2, '0')}`;

    if (progressDoc.exists) {
      const data = progressDoc.data()!;
      const completedLessons = data.completedLessons || [];
      const unlockedLessons = data.unlockedLessons || [];

      // Add to completed if not already
      if (!completedLessons.includes(completedLessonId)) {
        completedLessons.push(completedLessonId);
      }

      // Unlock next lesson if it exists and not already unlocked
      if (!unlockedLessons.includes(nextLessonId) && currentNum < 25) {
        unlockedLessons.push(nextLessonId);
      }

      await progressRef.update({
        completedLessons,
        unlockedLessons,
        currentLessonId: nextLessonId,
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // First time completing a lesson - create progress document
      await progressRef.set({
        userId,
        currentLessonId: nextLessonId,
        unlockedLessons: ['L01', completedLessonId, nextLessonId],
        completedLessons: [completedLessonId],
        totalReflections: 0,
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    logger.info('Updated lesson progress', {
      userId,
      completedLessonId,
      nextLessonId,
    });
  } catch (error) {
    logger.error('Failed to update lesson progress', { userId, completedLessonId, error });
  }
}

/**
 * Cloud Function: onDiveSessionCreate
 * Triggered when a new dive session is created
 * Sends the initial Somatic Guide message to start the lesson
 */
export const onDiveSessionCreate = onDocumentWritten(
  'users/{userId}/dive_sessions/{sessionId}',
  async (event): Promise<void> => {
    // Only process creates, not updates
    if (event.data?.before?.exists) {
      return;
    }

    const snap = event.data?.after;
    if (!snap?.exists) {
      return;
    }

    const sessionData = snap.data();
    const userId = event.params.userId;
    const sessionId = event.params.sessionId;

    if (!sessionData) {
      logger.error('Session data is undefined');
      return;
    }

    const lessonId = sessionData.lessonId;
    const languageCode = (sessionData.language || 'en-US') as SupportedLanguage;

    // Get localized lesson content
    const lesson = getLocalizedLesson(lessonId, languageCode);

    if (!lesson) {
      logger.error('Lesson not found for new session', { lessonId, languageCode });
      return;
    }

    logger.info('Starting new dive session', { userId, sessionId, lessonId, languageCode });

    try {
      // Store localized lesson content in session for frontend to use
      await admin.firestore().doc(`users/${userId}/dive_sessions/${sessionId}`).update({
        lessonContent: lesson.content,
      });

      // Build system prompt for opening message
      const systemPrompt = buildDiveSystemPrompt(lesson, languageCode);
      const openingPrompt = buildLessonOpeningPrompt(lesson, languageCode);

      // Call Vertex AI for opening message
      const vertexAI = new VertexAI({
        project: process.env.GCLOUD_PROJECT,
        location: 'us-central1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: openingPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.8,
          topP: 0.9,
          topK: 40,
        },
      });

      const openingText =
        result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
        `welcome to ${lesson.content.zone}. the water is calm here. let's begin.`;

      // Write opening message
      await admin
        .firestore()
        .collection(`users/${userId}/dive_sessions/${sessionId}/messages`)
        .add({
          userId,
          sessionId,
          lessonId,
          role: 'guide',
          text: openingText,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          metadata: {
            model: 'gemini-2.5-flash',
            isOpening: true,
          },
        });

      // Update session with message count
      await admin.firestore().doc(`users/${userId}/dive_sessions/${sessionId}`).update({
        messageCount: 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      logger.info('Sent dive session opening message', { userId, sessionId, lessonId });
    } catch (error) {
      logger.error('Error sending opening message', { userId, sessionId, lessonId, error });
    }
  }
);

/**
 * Callable Cloud Function: getDiveLesson
 * Returns localized lesson content for the intro card
 */
export const getDiveLesson = onCall(
  { region: 'us-central1' },
  async (request): Promise<{ lesson: DiveLessonFull['content'] & { id: string } }> => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { lessonId, language } = request.data as {
      lessonId: string;
      language: SupportedLanguage;
    };

    if (!lessonId) {
      throw new HttpsError('invalid-argument', 'lessonId is required');
    }

    const languageCode = language || 'en-US';
    const lesson = getLocalizedLesson(lessonId, languageCode);

    if (!lesson) {
      throw new HttpsError('not-found', `Lesson ${lessonId} not found`);
    }

    logger.info('Returning localized lesson', { lessonId, languageCode });

    // Return id + all localized content (zone in content is already translated)
    return {
      lesson: {
        id: lesson.id,
        ...lesson.content,
      },
    };
  }
);
