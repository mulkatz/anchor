/**
 * Adaptive Language Analysis
 * Analyzes user communication patterns to personalize AI responses
 *
 * This feature is completely invisible to users - no UI controls.
 * It automatically detects communication style and mirroring preferences.
 */

import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SampleMessage {
  text: string;
  timestamp: Date;
  conversationId: string;
}

export interface ConversationProfile {
  styleDescription: string;
  mirroringIntensity: number; // 1-5
  sampleMessages: SampleMessage[];
  totalUserMessageCount: number;
  lastAnalyzedAtMessageCount: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  lastAnalyzedAt: admin.firestore.Timestamp;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_SAMPLE_MESSAGES = 15;
const FIRST_ANALYSIS_THRESHOLD = 10;
const SUBSEQUENT_ANALYSIS_INTERVAL = 5;

/**
 * Analysis prompt for Gemini to evaluate user communication style
 * Outputs natural language profile with mirroring guidelines
 */
const ANALYSIS_PROMPT = `You are analyzing a user's communication style for a therapeutic chatbot called Anchor. Based on these sample messages from the user, create a natural language profile describing how the AI should adapt its communication to match this specific person.

SAMPLE MESSAGES (from oldest to most recent):
---
{MESSAGES}
---

Analyze these messages and output in this EXACT format:

[2-3 paragraphs describing:
- Their texting style (capitalization, punctuation, message length patterns)
- Any slang, abbreviations, or linguistic patterns they use (tbh, idk, ngl, etc.)
- Their emotional expression style (direct, hedged, metaphorical, understated)
- How they seem to prefer being responded to based on their communication]

MIRRORING GUIDELINES:
- [specific actionable guideline 1]
- [specific actionable guideline 2]
- [specific actionable guideline 3]
- [specific actionable guideline 4]
- [specific actionable guideline 5]

MIRRORING INTENSITY: [1-5]/5 ([one sentence rationale])

---

INTENSITY SCALE DEFINITIONS:
1 = Minimal mirroring - User seems to prefer professional, composed responses regardless of their own style. Keep therapeutic presence strong.
2 = Light mirroring - Match general energy and tone but maintain structure and proper punctuation.
3 = Moderate mirroring - Blend casual elements with therapeutic presence. Some abbreviations okay.
4 = Strong mirroring - Closely match their communication patterns including case and abbreviations.
5 = Full mirroring - Mirror their exact style including all casual elements, slang, and texting patterns.

SIGNALS TO LOOK FOR:
- Consistent use of lowercase = they're comfortable with casual
- Abbreviations like tbh, ngl, idk = Gen Z style, higher mirroring welcome
- Proper punctuation and capitalization = may prefer more polished responses
- Very short messages = keep responses concise too
- Longer, detailed messages = they appreciate depth
- Emoji usage = mirror emoji style appropriately

Remember: The goal is to make the AI feel like a friend who "gets" them, not a corporate chatbot. But some users genuinely prefer a more grounded, professional presence - detect that too.`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if style analysis should be triggered
 * - First 10 messages: analyze on EVERY message (for rapid adaptation)
 * - After 10 messages: analyze every 5th message
 */
export function shouldTriggerAnalysis(totalCount: number, lastAnalyzedAt: number): boolean {
  // For the first 10 messages, analyze on every message for rapid adaptation
  if (totalCount <= FIRST_ANALYSIS_THRESHOLD) {
    return true;
  }

  // After first 10, analyze every 5 messages
  if (totalCount - lastAnalyzedAt >= SUBSEQUENT_ANALYSIS_INTERVAL) {
    return true;
  }

  return false;
}

/**
 * Add message to rolling sample window
 * Maintains max size by removing oldest messages
 */
export function addToSampleWindow(
  samples: SampleMessage[],
  newMessage: SampleMessage,
  maxSize: number = MAX_SAMPLE_MESSAGES
): SampleMessage[] {
  const updated = [...samples, newMessage];

  // Remove oldest if over limit
  if (updated.length > maxSize) {
    return updated.slice(-maxSize);
  }

  return updated;
}

/**
 * Format sample messages for the analysis prompt
 */
function formatMessagesForAnalysis(messages: SampleMessage[]): string {
  return messages.map((msg, i) => `[${i + 1}] ${msg.text}`).join('\n\n');
}

/**
 * Extract mirroring intensity from analysis response
 * Falls back to 3 (moderate) if parsing fails
 */
function extractMirroringIntensity(analysisText: string): number {
  const match = analysisText.match(/MIRRORING INTENSITY:\s*(\d)\/5/i);
  if (match) {
    const intensity = parseInt(match[1], 10);
    if (intensity >= 1 && intensity <= 5) {
      return intensity;
    }
  }
  return 3; // Default to moderate
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze user's communication style and generate personalized profile
 * Called after threshold messages, runs asynchronously (fire-and-forget)
 */
export async function analyzeUserStyle(
  userId: string,
  sampleMessages: SampleMessage[]
): Promise<void> {
  if (sampleMessages.length < FIRST_ANALYSIS_THRESHOLD) {
    logger.info('Not enough messages for style analysis', {
      userId,
      messageCount: sampleMessages.length,
      required: FIRST_ANALYSIS_THRESHOLD,
    });
    return;
  }

  const startTime = Date.now();

  try {
    // Format messages for analysis
    const formattedMessages = formatMessagesForAnalysis(sampleMessages);
    const prompt = ANALYSIS_PROMPT.replace('{MESSAGES}', formattedMessages);

    // Call Gemini for analysis
    const vertexAI = new VertexAI({
      project: process.env.GCLOUD_PROJECT,
      location: 'us-central1',
    });

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.3, // Lower temperature for consistent analysis
        topP: 0.8,
      },
    });

    const analysisText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      logger.error('Empty analysis response from Gemini', { userId });
      return;
    }

    // Extract mirroring intensity
    const mirroringIntensity = extractMirroringIntensity(analysisText);

    // Update profile in Firestore
    const profileRef = admin.firestore().doc(`users/${userId}/profile/conversationProfile`);

    await profileRef.set(
      {
        styleDescription: analysisText,
        mirroringIntensity,
        sampleMessages,
        lastAnalyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const analysisTime = Date.now() - startTime;

    logger.info('User style analysis complete', {
      userId,
      mirroringIntensity,
      sampleCount: sampleMessages.length,
      analysisTimeMs: analysisTime,
      profileLength: analysisText.length,
    });
  } catch (error) {
    logger.error('Style analysis failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
      sampleCount: sampleMessages.length,
    });
    // Don't throw - graceful degradation, chat continues without profile
  }
}

/**
 * Initialize or update conversation profile with new message
 * Called on every user message to maintain rolling sample window
 */
export async function updateConversationProfile(
  userId: string,
  message: { text: string; conversationId: string }
): Promise<{
  shouldAnalyze: boolean;
  sampleMessages: SampleMessage[];
  totalCount: number;
}> {
  const profileRef = admin.firestore().doc(`users/${userId}/profile/conversationProfile`);

  try {
    const profileDoc = await profileRef.get();
    const currentProfile = profileDoc.data() as ConversationProfile | undefined;

    // Create new sample message
    const newSample: SampleMessage = {
      text: message.text,
      timestamp: new Date(),
      conversationId: message.conversationId,
    };

    // Update rolling window
    const currentSamples = currentProfile?.sampleMessages || [];
    const updatedSamples = addToSampleWindow(currentSamples, newSample);

    // Increment message count
    const newTotalCount = (currentProfile?.totalUserMessageCount || 0) + 1;
    const lastAnalyzedAt = currentProfile?.lastAnalyzedAtMessageCount || 0;

    // Check if analysis should be triggered
    const shouldAnalyze = shouldTriggerAnalysis(newTotalCount, lastAnalyzedAt);

    // Prepare update data
    const updateData: Record<string, unknown> = {
      sampleMessages: updatedSamples,
      totalUserMessageCount: newTotalCount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Initialize createdAt if new profile
    if (!currentProfile) {
      updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      updateData.styleDescription = '';
      updateData.mirroringIntensity = 3;
      updateData.lastAnalyzedAtMessageCount = 0;
    }

    // If analysis will be triggered, update lastAnalyzedAtMessageCount
    if (shouldAnalyze) {
      updateData.lastAnalyzedAtMessageCount = newTotalCount;
    }

    // Write to Firestore
    await profileRef.set(updateData, { merge: true });

    logger.info('Conversation profile updated', {
      userId,
      totalCount: newTotalCount,
      sampleCount: updatedSamples.length,
      shouldAnalyze,
    });

    return {
      shouldAnalyze,
      sampleMessages: updatedSamples,
      totalCount: newTotalCount,
    };
  } catch (error) {
    logger.error('Failed to update conversation profile', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return safe defaults - don't break the main flow
    return {
      shouldAnalyze: false,
      sampleMessages: [],
      totalCount: 0,
    };
  }
}

/**
 * Fetch existing conversation profile style description
 * Returns undefined if no profile exists or profile is incomplete
 */
export async function getConversationProfile(userId: string): Promise<string | undefined> {
  try {
    const profileDoc = await admin
      .firestore()
      .doc(`users/${userId}/profile/conversationProfile`)
      .get();

    if (!profileDoc.exists) {
      return undefined;
    }

    const profileData = profileDoc.data() as ConversationProfile;

    // Only return if we have a meaningful style description
    // (at least 100 chars indicates actual analysis was done)
    if (profileData?.styleDescription && profileData.styleDescription.length > 100) {
      logger.info('Using conversation profile', {
        userId,
        mirroringIntensity: profileData.mirroringIntensity,
        profileLength: profileData.styleDescription.length,
      });
      return profileData.styleDescription;
    }

    return undefined;
  } catch (error) {
    logger.warn('Failed to fetch conversation profile', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}
