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
const SYNC_ANALYSIS_THRESHOLD = 3; // First N messages: wait for analysis before responding

/**
 * Analysis prompt for Gemini to evaluate user communication style
 * Outputs natural language profile with mirroring guidelines
 */
const ANALYSIS_PROMPT = `You are analyzing a user's communication style for a therapeutic chatbot called Anchor.

IMPORTANT CONTEXT: Anchor's BASE style is already friendly and casual - like a supportive friend. The AI already:
- Uses warm, conversational language
- Can use expressions like "that sucks", "ngl", casual phrases
- Mirrors energy and validates feelings
- Keeps responses concise

Your job is to provide SUBTLE REFINEMENTS to this base style, NOT a complete overhaul. The profile should gently adjust the existing friendly tone, not replace it with something completely different.

SAMPLE MESSAGES (from oldest to most recent):
---
{MESSAGES}
---

Analyze these messages and output in this EXACT format:

[1-2 paragraphs describing:
- Notable patterns in their texting style (only mention what's distinctive)
- Any specific slang or linguistic patterns worth mirroring
- How they express emotions
- Keep it brief - only note what actually differs from a typical casual style]

REFINEMENT GUIDELINES (subtle adjustments to the base friendly style):
- [specific small adjustment 1]
- [specific small adjustment 2]
- [specific small adjustment 3]
- [specific small adjustment 4]

ADAPTATION LEVEL: [1-5]/5 ([one sentence rationale])

---

ADAPTATION SCALE (how much to adjust from the base friendly style):
1 = Almost no change needed - user's style matches the base friendly tone well
2 = Minor tweaks - small adjustments like emoji frequency or message length
3 = Moderate refinement - adjust some vocabulary or formality level
4 = Notable adjustment - user has a distinctly different style that needs more adaptation
5 = Significant shift - user clearly prefers a very different communication style (e.g., very formal)

IMPORTANT PRINCIPLES:
- Default to LOWER adaptation levels (1-3) unless there's clear evidence for more
- The base style is already good for most users - don't over-correct
- Only suggest changes that are clearly supported by the user's messages
- If the user writes casually, that MATCHES the base style - no major changes needed
- Only push toward formal/professional if the user CONSISTENTLY writes that way
- Never completely abandon the warm, supportive friend vibe

The goal is gentle personalization, not a personality transplant.`;

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
 * Check if analysis should be synchronous (wait for it before responding)
 * First 3 messages: wait for analysis to complete
 * After 3 messages: fire-and-forget (async)
 */
export function shouldWaitForAnalysis(totalCount: number): boolean {
  return totalCount <= SYNC_ANALYSIS_THRESHOLD;
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
 * Extract adaptation level from analysis response
 * Falls back to 2 (minor tweaks) if parsing fails - conservative default
 */
function extractAdaptationLevel(analysisText: string): number {
  // Try new format first, then old format for backwards compatibility
  const match =
    analysisText.match(/ADAPTATION LEVEL:\s*(\d)\/5/i) ||
    analysisText.match(/MIRRORING INTENSITY:\s*(\d)\/5/i);
  if (match) {
    const level = parseInt(match[1], 10);
    if (level >= 1 && level <= 5) {
      return level;
    }
  }
  return 2; // Default to minor tweaks (conservative)
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze user's communication style and generate personalized profile
 * Runs on every message for rapid adaptation
 */
export async function analyzeUserStyle(
  userId: string,
  sampleMessages: SampleMessage[]
): Promise<void> {
  // Need at least 1 message to analyze
  if (sampleMessages.length < 1) {
    logger.info('No messages to analyze', { userId });
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
        maxOutputTokens: 4096,
        temperature: 0.3, // Lower temperature for consistent analysis
        topP: 0.8,
      },
    });

    const analysisText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      logger.error('Empty analysis response from Gemini', { userId });
      return;
    }

    // Extract adaptation level
    const mirroringIntensity = extractAdaptationLevel(analysisText);

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
