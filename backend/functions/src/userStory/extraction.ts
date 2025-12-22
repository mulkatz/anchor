/**
 * UserStory Extraction
 * Extracts personal information from user messages using AI
 */

import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';
import * as logger from 'firebase-functions/logger';
import { UserStory, StoryExtraction, ExtractionResult, createEmptyUserStory } from './types';
import {
  getExtractionPrompt,
  formatStoryForExtractionPrompt,
  formatRecentContext,
} from './prompts';
import { getUserStory } from './context';

/**
 * Extract story information from a user message
 * This runs asynchronously (fire-and-forget) to not block chat responses
 */
export async function extractStoryFromMessage(
  userId: string,
  messageText: string,
  recentMessages: Array<{ role: string; text: string }>,
  languageCode: string = 'en-US'
): Promise<void> {
  try {
    // Get existing story
    const existingStory = await getUserStory(userId);
    const deletedFields = existingStory?.extractionMeta?.fieldsDeletedByUser || [];

    // Build extraction prompt
    const basePrompt = getExtractionPrompt(languageCode);
    const prompt = basePrompt
      .replace(
        '{EXISTING_STORY}',
        formatStoryForExtractionPrompt(existingStory as unknown as Record<string, unknown>)
      )
      .replace('{MESSAGE_TEXT}', messageText)
      .replace('{RECENT_CONTEXT}', formatRecentContext(recentMessages))
      .replace('{DELETED_FIELDS}', deletedFields.length > 0 ? deletedFields.join(', ') : 'None');

    // Call Vertex AI for extraction
    const vertexAI = new VertexAI({
      project: process.env.GCLOUD_PROJECT,
      location: 'us-central1',
    });

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1, // Low temperature for accurate extraction
      },
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      logger.warn('Empty extraction response', { userId });
      return;
    }

    // Parse JSON response
    const extractionResult = parseExtractionResult(responseText);

    if (!extractionResult) {
      logger.warn('Failed to parse extraction result', { userId, responseText });
      return;
    }

    // Handle forget request if detected
    if (extractionResult.detectedForgetRequest) {
      await handleForgetRequest(
        userId,
        extractionResult.detectedForgetRequest.topic,
        existingStory
      );
    }

    // Apply extractions
    if (extractionResult.extractions.length > 0) {
      await applyExtractions(userId, extractionResult.extractions, existingStory);
    }

    // Update suggested follow-ups
    if (extractionResult.suggestedFollowUps.length > 0) {
      await updateSuggestedFollowUps(userId, extractionResult.suggestedFollowUps);
    }

    logger.info('Story extraction completed', {
      userId,
      extractionsCount: extractionResult.extractions.length,
      hasForgetRequest: !!extractionResult.detectedForgetRequest,
    });
  } catch (error) {
    logger.error('Story extraction failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - this is fire-and-forget
  }
}

/**
 * Parse the AI extraction result from JSON
 */
function parseExtractionResult(responseText: string): ExtractionResult | null {
  try {
    // Try to extract JSON from response (might have markdown code blocks)
    let jsonStr = responseText;

    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    // Try to find JSON object
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (!Array.isArray(parsed.extractions)) {
      parsed.extractions = [];
    }

    if (!Array.isArray(parsed.suggestedFollowUps)) {
      parsed.suggestedFollowUps = [];
    }

    return parsed as ExtractionResult;
  } catch (error) {
    logger.warn('JSON parse error in extraction', {
      error: error instanceof Error ? error.message : String(error),
      responseText: responseText.substring(0, 500),
    });
    return null;
  }
}

/**
 * Apply extracted fields to user story document
 */
async function applyExtractions(
  userId: string,
  extractions: StoryExtraction[],
  existingStory: UserStory | null
): Promise<void> {
  const storyRef = admin.firestore().doc(`users/${userId}/profile/userStory`);
  const now = admin.firestore.Timestamp.now();

  // Initialize story if it doesn't exist
  if (!existingStory) {
    const newStory = createEmptyUserStory(userId);
    newStory.createdAt = now;
    newStory.updatedAt = now;
    await storyRef.set(newStory);
    existingStory = newStory;
  }

  const updates: Record<string, unknown> = {
    updatedAt: now,
    lastExtractionAt: now,
  };

  const topicsDiscovered = new Set(existingStory.extractionMeta?.topicsDiscovered || []);
  const deletedFields = existingStory.extractionMeta?.fieldsDeletedByUser || [];

  for (const extraction of extractions) {
    // Skip deleted fields
    if (deletedFields.includes(extraction.field)) {
      logger.info('Skipping deleted field', { userId, field: extraction.field });
      continue;
    }

    // Check if this is a state-change field that needs history tracking
    const needsHistory = isHistoryField(extraction.field);
    const existingValue = getNestedValue(
      existingStory as unknown as Record<string, unknown>,
      extraction.field
    );

    if (needsHistory && existingValue?.value !== undefined) {
      // Check if value actually changed
      if (JSON.stringify(existingValue.value) !== JSON.stringify(extraction.value)) {
        // Add to history
        const history = existingValue.history || [];
        history.push({
          value: existingValue.value,
          changedAt: now,
          source: existingValue.source || 'conversation',
        });

        updates[extraction.field] = {
          value: extraction.value,
          confidence: extraction.confidence,
          source: 'conversation',
          learnedAt: now,
          history: history.slice(-5), // Keep last 5 changes
        };

        logger.info('Updated field with history', {
          userId,
          field: extraction.field,
          oldValue: existingValue.value,
          newValue: extraction.value,
        });
      }
    } else if (isArrayField(extraction.field) && existingValue?.value) {
      // Merge arrays instead of replacing
      const existingArray = Array.isArray(existingValue.value) ? existingValue.value : [];
      const newItems = Array.isArray(extraction.value) ? extraction.value : [extraction.value];
      const mergedArray = [...new Set([...existingArray, ...newItems])];

      updates[extraction.field] = {
        value: mergedArray,
        confidence: extraction.confidence,
        source: 'conversation',
        learnedAt: now,
        lastConfirmed: now,
      };
    } else {
      // Simple field update
      updates[extraction.field] = {
        value: extraction.value,
        confidence: extraction.confidence,
        source: 'conversation',
        learnedAt: now,
      };
    }

    topicsDiscovered.add(extraction.field);
  }

  // Update topics discovered
  updates['extractionMeta.topicsDiscovered'] = Array.from(topicsDiscovered);

  // Apply all updates
  await storyRef.set(updates, { merge: true });
}

/**
 * Handle user request to forget information
 */
async function handleForgetRequest(
  userId: string,
  topic: string,
  existingStory: UserStory | null
): Promise<void> {
  const storyRef = admin.firestore().doc(`users/${userId}/profile/userStory`);

  // Map common topic names to field paths
  const topicToField: Record<string, string> = {
    name: 'coreIdentity.name',
    'my name': 'coreIdentity.name',
    age: 'coreIdentity.age',
    'my age': 'coreIdentity.age',
    location: 'coreIdentity.location',
    job: 'lifeSituation.occupation',
    work: 'lifeSituation.occupation',
    occupation: 'lifeSituation.occupation',
    relationship: 'relationships.romanticStatus',
    partner: 'relationships.partnerName',
    pets: 'relationships.hasPets',
  };

  const fieldPath = topicToField[topic.toLowerCase()] || topic;

  // Add to deleted fields list
  const deletedFields = existingStory?.extractionMeta?.fieldsDeletedByUser || [];
  if (!deletedFields.includes(fieldPath)) {
    deletedFields.push(fieldPath);
  }

  // Remove the field value and update deleted list
  const updates: Record<string, unknown> = {
    [fieldPath]: admin.firestore.FieldValue.delete(),
    'extractionMeta.fieldsDeletedByUser': deletedFields,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await storyRef.set(updates, { merge: true });

  logger.info('Processed forget request', { userId, topic, fieldPath });
}

/**
 * Update suggested follow-up topics
 */
async function updateSuggestedFollowUps(userId: string, suggestions: string[]): Promise<void> {
  const storyRef = admin.firestore().doc(`users/${userId}/profile/userStory`);

  await storyRef.set(
    {
      'extractionMeta.topicsToExplore': admin.firestore.FieldValue.arrayUnion(
        ...suggestions.slice(0, 5)
      ),
    },
    { merge: true }
  );
}

/**
 * Check if a field should track history
 */
function isHistoryField(fieldPath: string): boolean {
  const historyFields = [
    'lifeSituation.occupation',
    'relationships.romanticStatus',
    'lifeSituation.currentLifePhase',
  ];
  return historyFields.includes(fieldPath);
}

/**
 * Check if a field is an array type
 */
function isArrayField(fieldPath: string): boolean {
  const arrayFields = [
    'personal.interests',
    'personal.hobbies',
    'personal.copingActivities',
    'personal.avoidances',
    'therapeuticContext.knownTriggers',
    'therapeuticContext.anxietyManifestations',
    'background.significantLifeEvents',
  ];
  return arrayFields.includes(fieldPath);
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(
  obj: Record<string, unknown> | null,
  path: string
): { value?: unknown; history?: unknown[]; source?: string } | undefined {
  if (!obj) return undefined;

  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current as { value?: unknown; history?: unknown[]; source?: string } | undefined;
}

/**
 * Record that a question was asked about a topic
 */
export async function recordQuestionAsked(userId: string, topic: string): Promise<void> {
  const storyRef = admin.firestore().doc(`users/${userId}/profile/userStory`);

  await storyRef.set(
    {
      'extractionMeta.questionsAskedCount': admin.firestore.FieldValue.increment(1),
      'extractionMeta.lastQuestionTopic': topic,
      'extractionMeta.lastQuestionAt': admin.firestore.Timestamp.now(),
    },
    { merge: true }
  );
}
