import { VertexAI } from '@google-cloud/vertexai';
import * as functions from 'firebase-functions';

/**
 * Vertex AI Integration Example
 *
 * This module demonstrates how to use Google Cloud Vertex AI
 * for multimodal AI operations (text, image analysis, etc.)
 */

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT || 'your-project-id',
  location: 'us-central1', // or your preferred region
});

// Get the Gemini Pro model
const model = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
});

/**
 * Example: Analyze text with Vertex AI
 */
export const analyzeText = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    functions.logger.error('Error analyzing text:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze text');
  }
};

/**
 * Example: Analyze image with Vertex AI
 */
export const analyzeImage = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg',
      },
    };

    const textPart = {
      text: prompt,
    };

    const result = await model.generateContent([textPart, imagePart]);
    const response = result.response;
    return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    functions.logger.error('Error analyzing image:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze image');
  }
};

/**
 * Example: Streaming response
 */
export async function* streamAnalysis(prompt: string) {
  try {
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    functions.logger.error('Error streaming analysis:', error);
    throw new functions.https.HttpsError('internal', 'Failed to stream analysis');
  }
}
