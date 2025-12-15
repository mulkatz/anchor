import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import { getInsightGenerationPrompt, buildInsightMessage } from './insightPrompt';

/**
 * Parse JSON from AI response, handling markdown code blocks
 */
function parseAIJsonResponse<T>(responseText: string): T {
  let cleanedText = responseText.trim();

  if (cleanedText.startsWith('```')) {
    const lines = cleanedText.split('\n');
    lines.shift();
    if (lines[lines.length - 1]?.trim() === '```') {
      lines.pop();
    }
    cleanedText = lines.join('\n');
  }

  return JSON.parse(cleanedText);
}

/**
 * Get the Monday of the current week
 */
function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

/**
 * Get the Monday of the previous week
 */
function getPreviousWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

interface InsightResponse {
  insightText: string;
  recommendations: string[];
  identifiedTriggers: string[];
}

interface WeeklyInsightData {
  id: string;
  weekStartDate: string;
  entryCount: number;
  averageEmotionalIntensity: number;
  mostCommonDistortions: { type: string; count: number; percentage: number }[];
  mostCommonEmotions: { type: string; count: number }[];
  identifiedTriggers: string[];
  insightText: string;
  recommendations: string[];
  viewed: boolean;
  createdAt: admin.firestore.Timestamp;
}

/**
 * Cloud Function: generateWeeklyInsight
 * Generates a weekly insight based on the user's Illuminate entries
 * Called when user views the Lighthouse page and hasn't seen this week's insight
 */
export const generateWeeklyInsight = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 90,
  },
  async (request): Promise<WeeklyInsightData | null> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    const { language = 'en-US', forceRegenerate = false } = request.data || {};

    const weekStartDate = getWeekStartDate();

    logger.info('Generating weekly insight', { userId, weekStartDate });

    try {
      const db = admin.firestore();

      // Check if we already have an insight for this week
      if (!forceRegenerate) {
        const existingInsight = await db
          .collection(`users/${userId}/weekly_insights`)
          .where('weekStartDate', '==', weekStartDate)
          .limit(1)
          .get();

        if (!existingInsight.empty) {
          const doc = existingInsight.docs[0];
          logger.info('Returning existing insight', { userId, weekStartDate });
          return {
            id: doc.id,
            ...doc.data(),
          } as WeeklyInsightData;
        }
      }

      // Get this week's entries
      const weekStart = new Date(weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const entriesSnapshot = await db
        .collection(`users/${userId}/illuminate_entries`)
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(weekStart))
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(weekEnd))
        .orderBy('createdAt', 'desc')
        .get();

      if (entriesSnapshot.empty) {
        logger.info('No entries this week', { userId });
        return null;
      }

      const entries = entriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          situation: data.situation || '',
          // Backwards compatibility: read emotionalIntensity or legacy anxietyIntensity
          emotionalIntensity: data.emotionalIntensity ?? data.anxietyIntensity ?? 50,
          distortions: data.userConfirmedDistortions || [],
          reframe: data.selectedReframe || '',
          emotions: data.primaryEmotions || [],
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        };
      });

      // Calculate stats
      const entryCount = entries.length;
      const averageIntensity = Math.round(
        entries.reduce((sum, e) => sum + e.emotionalIntensity, 0) / entryCount
      );

      // Get previous week's average for comparison
      const prevWeekStart = new Date(getPreviousWeekStartDate());
      const prevWeekEnd = new Date(prevWeekStart);
      prevWeekEnd.setDate(prevWeekEnd.getDate() + 7);

      const prevEntriesSnapshot = await db
        .collection(`users/${userId}/illuminate_entries`)
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(prevWeekStart))
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(prevWeekEnd))
        .get();

      let previousWeekAverage: number | undefined;
      if (!prevEntriesSnapshot.empty) {
        const prevEntries = prevEntriesSnapshot.docs.map((d) => d.data());
        previousWeekAverage = Math.round(
          // Backwards compatibility: read emotionalIntensity or legacy anxietyIntensity
          prevEntries.reduce(
            (sum, e) => sum + (e.emotionalIntensity ?? e.anxietyIntensity ?? 50),
            0
          ) / prevEntries.length
        );
      }

      // Count distortions
      const distortionCounts: Record<string, number> = {};
      entries.forEach((e) => {
        e.distortions.forEach((d: string) => {
          distortionCounts[d] = (distortionCounts[d] || 0) + 1;
        });
      });
      const totalDistortions = Object.values(distortionCounts).reduce((a, b) => a + b, 0);
      const topDistortions = Object.entries(distortionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({
          type,
          count,
          percentage: Math.round((count / totalDistortions) * 100),
        }));

      // Count emotions
      const emotionCounts: Record<string, number> = {};
      entries.forEach((e) => {
        e.emotions.forEach((em: string) => {
          emotionCounts[em] = (emotionCounts[em] || 0) + 1;
        });
      });
      const topEmotions = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }));

      // Generate AI insight
      const vertexAI = new VertexAI({
        project: process.env.GCLOUD_PROJECT,
        location: 'us-central1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: getInsightGenerationPrompt(language),
      });

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: buildInsightMessage(entries, {
                  entryCount,
                  averageIntensity,
                  previousWeekAverage,
                  topDistortions,
                  topEmotions,
                }),
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

      let insightData: InsightResponse = {
        insightText: "You've been working on understanding your anxiety patterns. Keep it up!",
        recommendations: ['Continue your daily reflections', 'Notice your progress over time'],
        identifiedTriggers: [],
      };

      if (responseText) {
        try {
          insightData = parseAIJsonResponse<InsightResponse>(responseText);
        } catch (parseError) {
          logger.error('Failed to parse AI insight response', {
            userId,
            responseText,
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
        }
      }

      // Save the insight
      const insightDoc = {
        userId,
        weekStartDate,
        entryCount,
        averageEmotionalIntensity: averageIntensity,
        mostCommonDistortions: topDistortions,
        mostCommonEmotions: topEmotions,
        identifiedTriggers: insightData.identifiedTriggers || [],
        insightText: insightData.insightText,
        recommendations: insightData.recommendations || [],
        viewed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection(`users/${userId}/weekly_insights`).add(insightDoc);

      logger.info('Weekly insight generated', { userId, weekStartDate, insightId: docRef.id });

      return {
        id: docRef.id,
        ...insightDoc,
        createdAt: admin.firestore.Timestamp.now(),
      } as WeeklyInsightData;
    } catch (error) {
      logger.error('Error generating weekly insight', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new HttpsError('internal', 'Failed to generate insight');
    }
  }
);

/**
 * Cloud Function: markInsightViewed
 * Marks a weekly insight as viewed
 */
export const markInsightViewed = onCall(
  {
    region: 'us-central1',
  },
  async (request): Promise<{ success: boolean }> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { insightId } = request.data;
    if (!insightId) {
      throw new HttpsError('invalid-argument', 'Insight ID is required');
    }

    const userId = request.auth.uid;

    try {
      await admin.firestore().doc(`users/${userId}/weekly_insights/${insightId}`).update({
        viewed: true,
        viewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      logger.error('Error marking insight as viewed', { userId, insightId, error });
      throw new HttpsError('internal', 'Failed to mark insight as viewed');
    }
  }
);

/**
 * Cloud Function: rateInsight
 * Records user's helpfulness rating for an insight
 */
export const rateInsight = onCall(
  {
    region: 'us-central1',
  },
  async (request): Promise<{ success: boolean }> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { insightId, rating } = request.data;
    if (!insightId) {
      throw new HttpsError('invalid-argument', 'Insight ID is required');
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new HttpsError('invalid-argument', 'Rating must be between 1 and 5');
    }

    const userId = request.auth.uid;

    try {
      await admin.firestore().doc(`users/${userId}/weekly_insights/${insightId}`).update({
        helpfulnessRating: rating,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error rating insight', { userId, insightId, error });
      throw new HttpsError('internal', 'Failed to rate insight');
    }
  }
);
