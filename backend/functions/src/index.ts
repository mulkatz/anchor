import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { analyzeText, analyzeImage } from './vertexai';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Example HTTP Cloud Function
 */
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.json({ message: 'Hello from Firebase!' });
});

/**
 * Example Callable Function with Vertex AI
 * Can be called directly from the client SDK
 */
export const analyzeWithAI = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { prompt, type } = data;

  if (!prompt) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a prompt.'
    );
  }

  try {
    functions.logger.info('Analyzing with AI', {
      uid: context.auth.uid,
      type,
    });

    const result = await analyzeText(prompt);

    return {
      success: true,
      data: {
        result,
        message: `Analysis completed for user ${context.auth.uid}`,
      },
    };
  } catch (error) {
    functions.logger.error('AI analysis failed', error);
    throw new functions.https.HttpsError(
      'internal',
      'AI analysis failed. Please try again.'
    );
  }
});

/**
 * Example: Image Analysis with Vertex AI
 */
export const analyzeImageWithAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { imageBase64, prompt } = data;

  if (!imageBase64 || !prompt) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Image and prompt are required'
    );
  }

  try {
    const result = await analyzeImage(imageBase64, prompt);

    return {
      success: true,
      data: { result },
    };
  } catch (error) {
    functions.logger.error('Image analysis failed', error);
    throw new functions.https.HttpsError('internal', 'Image analysis failed');
  }
});

/**
 * Example Firestore Trigger
 * Runs when a document is created in the 'users' collection
 */
export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();

    functions.logger.info('New user created', { userId, userData });

    // Your logic here (e.g., send welcome email, create related documents)

    return null;
  });

/**
 * Example Scheduled Function
 * Runs every day at midnight UTC
 */
export const dailyCleanup = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    functions.logger.info('Running daily cleanup');

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
    functions.logger.info(`Deleted ${oldDocs.size} old documents`);

    return null;
  });

/**
 * Example: Batch Processing with AI
 * Process multiple items with Vertex AI
 */
export const batchAnalyze = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { items } = data; // Array of items to analyze

  if (!Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Items array required');
  }

  if (items.length > 10) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Maximum 10 items per batch'
    );
  }

  try {
    const results = await Promise.all(
      items.map(async (item) => {
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
    functions.logger.error('Batch analysis failed', error);
    throw new functions.https.HttpsError('internal', 'Batch analysis failed');
  }
});
