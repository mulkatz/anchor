import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { analyzeText, analyzeImage } from './vertexai';

// Initialize Firebase Admin
admin.initializeApp();

// Export Deep Talk chat function
export { onMessageCreate } from './chat';

/**
 * Example HTTP Cloud Function
 */
export const helloWorld = onRequest((request, response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.json({ message: 'Hello from Firebase!' });
});

/**
 * Example Callable Function with Vertex AI
 * Can be called directly from the client SDK
 */
export const analyzeWithAI = onCall(async (request) => {
  // Check authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { prompt, type } = request.data;

  if (!prompt) {
    throw new HttpsError('invalid-argument', 'The function must be called with a prompt.');
  }

  try {
    logger.info('Analyzing with AI', {
      uid: request.auth.uid,
      type,
    });

    const result = await analyzeText(prompt);

    return {
      success: true,
      data: {
        result,
        message: `Analysis completed for user ${request.auth.uid}`,
      },
    };
  } catch (error) {
    logger.error('AI analysis failed', error);
    throw new HttpsError('internal', 'AI analysis failed. Please try again.');
  }
});

/**
 * Example: Image Analysis with Vertex AI
 */
export const analyzeImageWithAI = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const { imageBase64, prompt } = request.data;

  if (!imageBase64 || !prompt) {
    throw new HttpsError('invalid-argument', 'Image and prompt are required');
  }

  try {
    const result = await analyzeImage(imageBase64, prompt);

    return {
      success: true,
      data: { result },
    };
  } catch (error) {
    logger.error('Image analysis failed', error);
    throw new HttpsError('internal', 'Image analysis failed');
  }
});

/**
 * Example Firestore Trigger
 * Runs when a document is created in the 'users' collection
 */
export const onUserCreate = onDocumentCreated('users/{userId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    logger.error('No data in snapshot');
    return;
  }

  const userId = event.params.userId;
  const userData = snap.data();

  logger.info('New user created', { userId, userData });

  // Your logic here (e.g., send welcome email, create related documents)
});

/**
 * Example Scheduled Function
 * Runs every day at midnight UTC
 */
export const dailyCleanup = onSchedule('0 0 * * *', async () => {
  logger.info('Running daily cleanup');

  // Your cleanup logic here
  // Example: Delete old temporary data
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago

  const oldDocs = await admin
    .firestore()
    .collection('temp')
    .where('createdAt', '<', cutoffDate)
    .get();

  const batch = admin.firestore().batch();
  oldDocs.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  logger.info(`Deleted ${oldDocs.size} old documents`);
});

/**
 * Example: Batch Processing with AI
 * Process multiple items with Vertex AI
 */
export const batchAnalyze = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in');
  }

  const { items } = request.data; // Array of items to analyze

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpsError('invalid-argument', 'Items array required');
  }

  if (items.length > 10) {
    throw new HttpsError('invalid-argument', 'Maximum 10 items per batch');
  }

  try {
    const results = await Promise.all(
      items.map(async (item: { id: string; prompt: string }) => {
        try {
          const result = await analyzeText(item.prompt);
          return { success: true, data: result, id: item.id };
        } catch (error) {
          return { success: false, error: 'Analysis failed', id: item.id };
        }
      })
    );

    return {
      success: true,
      data: { results },
    };
  } catch (error) {
    logger.error('Batch analysis failed', error);
    throw new HttpsError('internal', 'Batch analysis failed');
  }
});
