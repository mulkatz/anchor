import * as logger from 'firebase-functions/logger';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import {
  getDistortionDetectionPrompt,
  getReframeGenerationPrompt,
  buildDistortionDetectionMessage,
  buildReframeMessage,
} from './illuminatePrompt';
import { trackUsage, flushUsage, extractTokenUsage } from './usage';

/**
 * Type definitions for Illuminate AI responses
 */
interface DetectedDistortion {
  type: string;
  confidence: number;
  highlightedText: string;
  explanation: string;
}

interface DistortionDetectionResponse {
  distortions: DetectedDistortion[];
}

interface ReframeGenerationResponse {
  reframes: string[];
}

/**
 * Parse JSON from AI response, handling markdown code blocks
 */
function parseAIJsonResponse<T>(responseText: string): T {
  // Remove markdown code block if present
  let cleanedText = responseText.trim();

  // Handle ```json ... ``` format
  if (cleanedText.startsWith('```')) {
    const lines = cleanedText.split('\n');
    // Remove first line (```json) and last line (```)
    lines.shift();
    if (lines[lines.length - 1]?.trim() === '```') {
      lines.pop();
    }
    cleanedText = lines.join('\n');
  }

  return JSON.parse(cleanedText);
}

/**
 * Cloud Function: analyzeDistortions
 * Callable function to detect cognitive distortions in user's anxious thoughts
 *
 * @param data - { situation: string, automaticThoughts: string, language?: string }
 * @returns { distortions: DetectedDistortion[] }
 */
export const analyzeDistortions = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request): Promise<DistortionDetectionResponse> => {
    // Validate authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { situation, automaticThoughts, language = 'en-US' } = request.data;

    // Validate input
    if (!situation || typeof situation !== 'string') {
      throw new HttpsError('invalid-argument', 'Situation is required');
    }
    if (!automaticThoughts || typeof automaticThoughts !== 'string') {
      throw new HttpsError('invalid-argument', 'Automatic thoughts are required');
    }

    const userId = request.auth.uid;
    logger.info('Analyzing distortions', { userId, situationLength: situation.length });

    try {
      // Initialize Vertex AI
      const vertexAI = new VertexAI({
        project: process.env.GCLOUD_PROJECT,
        location: 'us-central1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: getDistortionDetectionPrompt(language),
      });

      // Generate distortion analysis
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildDistortionDetectionMessage(situation, automaticThoughts) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048, // Increased for longer German responses
          temperature: 0.3, // Lower temperature for more consistent analysis
          topP: 0.8,
        },
      });

      // Extract token usage for cost tracking
      const tokenUsage = extractTokenUsage(result);

      // Track AI usage
      trackUsage({
        userId,
        timestamp: new Date(),
        service: 'ai_gemini_25_flash',
        feature: 'illuminate_distortions',
        model: 'gemini-2.5-flash',
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
      });

      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        logger.error('No response from AI for distortion detection', { userId });
        await flushUsage(userId);
        return { distortions: [] };
      }

      logger.info('AI distortion response', { userId, responseText, tokenUsage });

      // Parse JSON response
      const parsed = parseAIJsonResponse<DistortionDetectionResponse>(responseText);

      // Validate and sanitize distortions
      const validDistortions = (parsed.distortions || [])
        .filter(
          (d) =>
            d.type && typeof d.confidence === 'number' && d.confidence >= 0 && d.confidence <= 1
        )
        .slice(0, 3); // Max 3 distortions

      logger.info('Distortions detected', {
        userId,
        count: validDistortions.length,
        types: validDistortions.map((d) => d.type),
      });

      await flushUsage(userId);
      return { distortions: validDistortions };
    } catch (error) {
      logger.error('Error analyzing distortions', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return empty array on error - don't fail the user flow
      return { distortions: [] };
    }
  }
);

/**
 * Cloud Function: generateReframes
 * Callable function to generate balanced reframe suggestions
 *
 * @param data - { situation, automaticThoughts, distortions, language? }
 * @returns { reframes: string[] }
 */
export const generateReframes = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request): Promise<ReframeGenerationResponse> => {
    // Validate authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { situation, automaticThoughts, distortions, language = 'en-US' } = request.data;

    // Validate input
    if (!situation || typeof situation !== 'string') {
      throw new HttpsError('invalid-argument', 'Situation is required');
    }
    if (!automaticThoughts || typeof automaticThoughts !== 'string') {
      throw new HttpsError('invalid-argument', 'Automatic thoughts are required');
    }
    if (!Array.isArray(distortions)) {
      throw new HttpsError('invalid-argument', 'Distortions array is required');
    }

    const userId = request.auth.uid;
    logger.info('Generating reframes', { userId, distortionCount: distortions.length });

    try {
      // Initialize Vertex AI
      const vertexAI = new VertexAI({
        project: process.env.GCLOUD_PROJECT,
        location: 'us-central1',
      });

      const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: getReframeGenerationPrompt(language),
      });

      // Generate reframes
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildReframeMessage(situation, automaticThoughts, distortions) }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048, // Increased for longer German responses
          temperature: 0.7, // Higher temperature for more varied suggestions
          topP: 0.9,
        },
      });

      // Extract token usage for cost tracking
      const reframeTokenUsage = extractTokenUsage(result);

      // Track AI usage
      trackUsage({
        userId,
        timestamp: new Date(),
        service: 'ai_gemini_25_flash',
        feature: 'illuminate_reframes',
        model: 'gemini-2.5-flash',
        inputTokens: reframeTokenUsage.inputTokens,
        outputTokens: reframeTokenUsage.outputTokens,
      });

      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        logger.error('No response from AI for reframe generation', { userId });
        await flushUsage(userId);
        return { reframes: getDefaultReframes(language) };
      }

      logger.info('AI reframe response', { userId, responseText, reframeTokenUsage });

      // Parse JSON response
      const parsed = parseAIJsonResponse<ReframeGenerationResponse>(responseText);

      // Validate reframes
      const validReframes = (parsed.reframes || [])
        .filter((r) => typeof r === 'string' && r.length > 0)
        .slice(0, 3); // Max 3 reframes

      if (validReframes.length === 0) {
        await flushUsage(userId);
        return { reframes: getDefaultReframes(language) };
      }

      logger.info('Reframes generated', { userId, count: validReframes.length });

      await flushUsage(userId);
      return { reframes: validReframes };
    } catch (error) {
      logger.error('Error generating reframes', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return default reframes on error
      return { reframes: getDefaultReframes(language) };
    }
  }
);

/**
 * Fallback reframes if AI fails
 */
function getDefaultReframes(language: string): string[] {
  const lang = language.startsWith('de') ? 'de' : 'en';

  const defaults = {
    en: [
      "I'm feeling anxious right now, and that's okay. This feeling will pass.",
      "I don't have all the information yet. Let me focus on what I can control.",
      "I've gotten through difficult moments before. I can handle this too.",
    ],
    de: [
      'Ich fühle mich gerade ängstlich, und das ist in Ordnung. Dieses Gefühl wird vorbeigehen.',
      'Ich habe noch nicht alle Informationen. Ich konzentriere mich auf das, was ich kontrollieren kann.',
      'Ich habe schwierige Momente schon früher überstanden. Das schaffe ich auch.',
    ],
  };

  return defaults[lang] || defaults.en;
}
