/**
 * UserStory Extraction
 * Extracts personal information from user messages using AI
 */

import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';
import * as logger from 'firebase-functions/logger';
import {
  UserStory,
  StoryExtraction,
  ExtractionResult,
  TopicExtraction,
  RecentTopic,
  createEmptyUserStory,
} from './types';
import {
  getExtractionPrompt,
  formatStoryForExtractionPrompt,
  formatRecentContext,
} from './prompts';
import { getUserStory } from './context';
import { trackUsage, flushUsage, extractTokenUsage } from '../usage';

/**
 * Generate a unique topic ID
 */
function generateTopicId(): string {
  return `topic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely convert various timestamp formats to Date
 * Handles Firestore Timestamp, Date, string, and objects with toDate()
 */
function toDate(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof admin.firestore.Timestamp) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  if (typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  return new Date();
}

/**
 * Valid values for topic extraction enums
 */
const VALID_CATEGORIES = ['work', 'relationships', 'health', 'anxiety', 'life-event', 'other'];
const VALID_STATUSES = ['active', 'resolved', 'fading'];
const VALID_VALENCES = ['positive', 'negative', 'neutral'];

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
        formatStoryForExtractionPrompt(
          existingStory as unknown as Record<string, unknown>,
          languageCode
        )
      )
      .replace('{MESSAGE_TEXT}', messageText)
      .replace('{RECENT_CONTEXT}', formatRecentContext(recentMessages, languageCode))
      .replace(
        '{DELETED_FIELDS}',
        deletedFields.length > 0
          ? deletedFields.join(', ')
          : languageCode.startsWith('de')
            ? 'Keine'
            : 'None'
      );

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

    // Extract token usage for cost tracking
    const tokenUsage = extractTokenUsage(result);

    // Track AI usage (async - don't wait for it)
    trackUsage({
      userId,
      timestamp: new Date(),
      service: 'ai_gemini_20_flash',
      feature: 'user_story',
      model: 'gemini-2.0-flash',
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
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

    // Apply story extractions
    if (extractionResult.extractions.length > 0) {
      await applyExtractions(userId, extractionResult.extractions, existingStory);
    }

    // Apply topic extractions to mid-term memory
    if (extractionResult.topicExtractions && extractionResult.topicExtractions.length > 0) {
      await applyTopicExtractions(userId, extractionResult.topicExtractions);
    }

    // Update suggested follow-ups
    if (extractionResult.suggestedFollowUps.length > 0) {
      await updateSuggestedFollowUps(userId, extractionResult.suggestedFollowUps);
    }

    logger.info('Story extraction completed', {
      userId,
      extractionsCount: extractionResult.extractions.length,
      topicExtractionsCount: extractionResult.topicExtractions?.length || 0,
      hasForgetRequest: !!extractionResult.detectedForgetRequest,
    });

    // Flush usage tracking before function ends
    await flushUsage(userId);
  } catch (error) {
    logger.error('Story extraction failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Still flush any tracked usage on error
    await flushUsage(userId).catch(() => {});
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

    if (!Array.isArray(parsed.topicExtractions)) {
      parsed.topicExtractions = [];
    }

    if (!Array.isArray(parsed.suggestedFollowUps)) {
      parsed.suggestedFollowUps = [];
    }

    // Validate and sanitize topic extractions
    parsed.topicExtractions = parsed.topicExtractions.filter((t: Record<string, unknown>) => {
      // Reject empty or too-short topics/contexts
      if (!t.topic || typeof t.topic !== 'string' || t.topic.trim().length < 2) return false;
      if (!t.context || typeof t.context !== 'string' || t.context.trim().length < 2) return false;

      // Sanitize category - default to 'other' if invalid
      if (!VALID_CATEGORIES.includes(t.category as string)) {
        t.category = 'other';
      }

      // Sanitize status - default to 'active' if invalid
      if (!VALID_STATUSES.includes(t.status as string)) {
        t.status = 'active';
      }

      // Sanitize valence - set to undefined if invalid
      if (t.valence && !VALID_VALENCES.includes(t.valence as string)) {
        t.valence = undefined;
      }

      return true;
    });

    // Validate suggested follow-ups (should be strings)
    parsed.suggestedFollowUps = parsed.suggestedFollowUps.filter(
      (s: unknown) => typeof s === 'string' && s.trim().length > 0
    );

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

  // Apply all updates using update() - NOT set() with merge!
  // update() interprets dots as nested paths: 'coreIdentity.name' → { coreIdentity: { name: ... } }
  // set() with merge treats dots as literal field names: creates field called "coreIdentity.name"
  await storyRef.update(updates);
}

/**
 * Handle user request to forget information
 * Handles both User Story fields AND mid-term memory topics
 */
async function handleForgetRequest(
  userId: string,
  topic: string,
  existingStory: UserStory | null
): Promise<void> {
  const storyRef = admin.firestore().doc(`users/${userId}/profile/userStory`);
  const topicLower = topic.toLowerCase();

  // Bilingual mapping of common topic names to field paths
  // Supports both English and German forget requests
  const topicToField: Record<string, string> = {
    // === English ===
    name: 'coreIdentity.name',
    'my name': 'coreIdentity.name',
    age: 'coreIdentity.age',
    'my age': 'coreIdentity.age',
    location: 'coreIdentity.location',
    'where i live': 'coreIdentity.location',
    'my location': 'coreIdentity.location',
    job: 'lifeSituation.occupation',
    work: 'lifeSituation.occupation',
    occupation: 'lifeSituation.occupation',
    'my job': 'lifeSituation.occupation',
    'my work': 'lifeSituation.occupation',
    relationship: 'relationships.romanticStatus',
    'relationship status': 'relationships.romanticStatus',
    'my relationship': 'relationships.romanticStatus',
    partner: 'relationships.partnerName',
    'my partner': 'relationships.partnerName',
    boyfriend: 'relationships.partnerName',
    girlfriend: 'relationships.partnerName',
    pets: 'relationships.hasPets',
    'my pets': 'relationships.hasPets',
    interests: 'personal.interests',
    'my interests': 'personal.interests',
    hobbies: 'personal.hobbies',
    'my hobbies': 'personal.hobbies',
    triggers: 'therapeuticContext.knownTriggers',
    'my triggers': 'therapeuticContext.knownTriggers',

    // === German (Deutsch) ===
    'mein name': 'coreIdentity.name',
    alter: 'coreIdentity.age',
    'mein alter': 'coreIdentity.age',
    wohnort: 'coreIdentity.location',
    ort: 'coreIdentity.location',
    'wo ich wohne': 'coreIdentity.location',
    'wo ich lebe': 'coreIdentity.location',
    'mein wohnort': 'coreIdentity.location',
    arbeit: 'lifeSituation.occupation',
    beruf: 'lifeSituation.occupation',
    'meine arbeit': 'lifeSituation.occupation',
    'mein beruf': 'lifeSituation.occupation',
    'mein job': 'lifeSituation.occupation',
    beziehung: 'relationships.romanticStatus',
    beziehungsstatus: 'relationships.romanticStatus',
    'meine beziehung': 'relationships.romanticStatus',
    freund: 'relationships.partnerName',
    freundin: 'relationships.partnerName',
    'mein freund': 'relationships.partnerName',
    'meine freundin': 'relationships.partnerName',
    'mein partner': 'relationships.partnerName',
    'meine partnerin': 'relationships.partnerName',
    haustier: 'relationships.hasPets',
    haustiere: 'relationships.hasPets',
    'mein haustier': 'relationships.hasPets',
    'meine haustiere': 'relationships.hasPets',
    interessen: 'personal.interests',
    'meine interessen': 'personal.interests',
    hobbys: 'personal.hobbies',
    'meine hobbys': 'personal.hobbies',
    auslöser: 'therapeuticContext.knownTriggers',
    trigger: 'therapeuticContext.knownTriggers',
    'meine trigger': 'therapeuticContext.knownTriggers',
    'meine auslöser': 'therapeuticContext.knownTriggers',
  };

  const fieldPath = topicToField[topicLower];

  // If it's a known User Story field, delete from User Story
  if (fieldPath) {
    const deletedFields = existingStory?.extractionMeta?.fieldsDeletedByUser || [];
    if (!deletedFields.includes(fieldPath)) {
      deletedFields.push(fieldPath);
    }

    const updates: Record<string, unknown> = {
      [fieldPath]: admin.firestore.FieldValue.delete(),
      'extractionMeta.fieldsDeletedByUser': deletedFields,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    // Use update() to interpret dots as paths (same reason as applyExtractions)
    await storyRef.update(updates);
    logger.info('Processed forget request for User Story field', { userId, topic, fieldPath });
  }

  // Also try to delete from mid-term memory topics
  // This handles cases like "forget about that interview thing"
  await deleteMatchingTopics(userId, topicLower);
}

/**
 * Delete topics from mid-term memory that match the forget request
 * Uses fuzzy matching to find relevant topics
 */
async function deleteMatchingTopics(userId: string, forgetTopic: string): Promise<void> {
  const memoryRef = admin.firestore().doc(`users/${userId}/profile/midTermMemory`);

  try {
    const memoryDoc = await memoryRef.get();
    if (!memoryDoc.exists) return;

    const existingData = memoryDoc.data();
    const existingTopics: RecentTopic[] = existingData?.recentTopics || [];

    if (existingTopics.length === 0) return;

    // Find topics that match the forget request
    const topicsToKeep: RecentTopic[] = [];
    const topicsDeleted: string[] = [];

    for (const topic of existingTopics) {
      // Check if the topic matches the forget request
      const similarity = calculateTopicSimilarity(forgetTopic, topic.topic);
      const contextSimilarity = calculateTopicSimilarity(forgetTopic, topic.context);

      // If either topic name or context has good match, delete it
      if (similarity >= 0.3 || contextSimilarity >= 0.3) {
        topicsDeleted.push(topic.topic);
      } else {
        topicsToKeep.push(topic);
      }
    }

    // Only update if we actually deleted something
    if (topicsDeleted.length > 0) {
      await memoryRef.set(
        {
          recentTopics: topicsToKeep,
          updatedAt: admin.firestore.Timestamp.now(),
        },
        { merge: true }
      );

      logger.info('Deleted topics from mid-term memory', {
        userId,
        forgetTopic,
        deletedTopics: topicsDeleted,
        remainingCount: topicsToKeep.length,
      });
    }
  } catch (error) {
    logger.error('Failed to delete topics from mid-term memory', {
      userId,
      forgetTopic,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - this is non-critical
  }
}

/**
 * Update suggested follow-up topics
 */
async function updateSuggestedFollowUps(userId: string, suggestions: string[]): Promise<void> {
  const storyRef = admin.firestore().doc(`users/${userId}/profile/userStory`);

  // Use update() to interpret dots as nested paths
  await storyRef.update({
    'extractionMeta.topicsToExplore': admin.firestore.FieldValue.arrayUnion(
      ...suggestions.slice(0, 5)
    ),
  });
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
 * These fields should MERGE new items instead of replacing
 */
function isArrayField(fieldPath: string): boolean {
  const arrayFields = [
    // Personal
    'personal.interests',
    'personal.hobbies',
    'personal.copingActivities',
    'personal.avoidances',
    // Background
    'background.significantLifeEvents',
    // Therapeutic Context
    'therapeuticContext.knownTriggers',
    'therapeuticContext.anxietyManifestations',
    'therapeuticContext.whatDoesntWork',
    // Strengths & Resources (all array fields!)
    'strengths.whatGivesHope',
    'strengths.proudMoments',
    'strengths.pastWins',
    'strengths.motivators',
    'strengths.positiveRelationships',
    'strengths.coreValues',
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

  // Use properly nested object (not dot notation) with set/merge
  // This works even if document doesn't exist yet
  await storyRef.set(
    {
      extractionMeta: {
        questionsAskedCount: admin.firestore.FieldValue.increment(1),
        lastQuestionTopic: topic,
        lastQuestionAt: admin.firestore.Timestamp.now(),
      },
    },
    { merge: true }
  );
}

// ============================================
// Mid-Term Memory: Topic Extraction
// ============================================

/**
 * Bilingual stop words for topic matching
 * These common words are filtered out to focus on meaningful content words
 */
const STOP_WORDS_EN = new Set([
  // Articles & determiners
  'the',
  'a',
  'an',
  'this',
  'that',
  'these',
  'those',
  // Conjunctions
  'and',
  'or',
  'but',
  'so',
  'yet',
  'nor',
  'for',
  // Prepositions
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'about',
  'from',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  // Pronouns
  'i',
  'me',
  'my',
  'mine',
  'myself',
  'you',
  'your',
  'yours',
  'yourself',
  'he',
  'him',
  'his',
  'himself',
  'she',
  'her',
  'hers',
  'herself',
  'it',
  'its',
  'itself',
  'we',
  'us',
  'our',
  'ours',
  'ourselves',
  'they',
  'them',
  'their',
  'theirs',
  'themselves',
  // Common verbs
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'can',
  'get',
  'got',
  'getting',
  'go',
  'going',
  'went',
  'gone',
  // Question words
  'what',
  'which',
  'who',
  'whom',
  'whose',
  'when',
  'where',
  'why',
  'how',
  // Other common words
  'just',
  'also',
  'very',
  'really',
  'actually',
  'basically',
  'there',
  'here',
  'now',
  'then',
  'still',
  'already',
  'always',
  'never',
  'some',
  'any',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'another',
  'such',
  'only',
  'same',
  'than',
  'too',
  'not',
  'no',
  'yes',
  'okay',
  'well',
  'like',
  'know',
  'think',
  'feel',
]);

const STOP_WORDS_DE = new Set([
  // Artikel
  'der',
  'die',
  'das',
  'den',
  'dem',
  'des',
  'ein',
  'eine',
  'einer',
  'einem',
  'einen',
  'eines',
  // Konjunktionen
  'und',
  'oder',
  'aber',
  'sondern',
  'denn',
  'doch',
  'jedoch',
  'also',
  'deshalb',
  'daher',
  // Präpositionen
  'in',
  'im',
  'auf',
  'an',
  'am',
  'zu',
  'zum',
  'zur',
  'für',
  'von',
  'vom',
  'mit',
  'bei',
  'beim',
  'nach',
  'über',
  'unter',
  'vor',
  'hinter',
  'neben',
  'zwischen',
  'durch',
  'gegen',
  'ohne',
  'um',
  'aus',
  // Pronomen
  'ich',
  'du',
  'er',
  'sie',
  'es',
  'wir',
  'ihr',
  'mich',
  'dich',
  'sich',
  'uns',
  'euch',
  'mir',
  'dir',
  'ihm',
  'ihr',
  'ihnen',
  'mein',
  'meine',
  'meiner',
  'meinem',
  'meinen',
  'meines',
  'dein',
  'deine',
  'deiner',
  'deinem',
  'deinen',
  'deines',
  'sein',
  'seine',
  'seiner',
  'seinem',
  'seinen',
  'seines',
  'ihr',
  'ihre',
  'ihrer',
  'ihrem',
  'ihren',
  'ihres',
  'unser',
  'unsere',
  'unserer',
  'unserem',
  'unseren',
  'unseres',
  'euer',
  'eure',
  'eurer',
  'eurem',
  'euren',
  'eures',
  // Verben (häufige)
  'ist',
  'sind',
  'war',
  'waren',
  'bin',
  'bist',
  'seid',
  'gewesen',
  'hat',
  'haben',
  'hatte',
  'hatten',
  'habe',
  'hast',
  'habt',
  'gehabt',
  'wird',
  'werden',
  'wurde',
  'wurden',
  'werde',
  'wirst',
  'werdet',
  'geworden',
  'kann',
  'können',
  'konnte',
  'konnten',
  'kannst',
  'könnt',
  'gekonnt',
  'muss',
  'müssen',
  'musste',
  'mussten',
  'musst',
  'müsst',
  'gemusst',
  'soll',
  'sollen',
  'sollte',
  'sollten',
  'sollst',
  'sollt',
  'will',
  'wollen',
  'wollte',
  'wollten',
  'willst',
  'wollt',
  'gewollt',
  'darf',
  'dürfen',
  'durfte',
  'durften',
  'darfst',
  'dürft',
  'gedurft',
  'mag',
  'mögen',
  'mochte',
  'mochten',
  'magst',
  'mögt',
  // Fragewörter
  'was',
  'wer',
  'wen',
  'wem',
  'wessen',
  'welcher',
  'welche',
  'welches',
  'wie',
  'wo',
  'wann',
  'warum',
  'woher',
  'wohin',
  'womit',
  'wofür',
  'weshalb',
  // Andere häufige Wörter
  'dass',
  'ob',
  'wenn',
  'weil',
  'als',
  'damit',
  'obwohl',
  'während',
  'obgleich',
  'da',
  'dort',
  'hier',
  'jetzt',
  'dann',
  'schon',
  'noch',
  'immer',
  'wieder',
  'nie',
  'niemals',
  'nicht',
  'kein',
  'keine',
  'keiner',
  'keinem',
  'keinen',
  'keines',
  'auch',
  'nur',
  'sehr',
  'ganz',
  'mehr',
  'weniger',
  'viel',
  'wenig',
  'etwas',
  'alle',
  'alles',
  'allem',
  'aller',
  'allen',
  'andere',
  'anderer',
  'anderem',
  'anderen',
  'anderes',
  'dieser',
  'diese',
  'dieses',
  'diesem',
  'diesen',
  'jener',
  'jene',
  'jenes',
  'jenem',
  'jenen',
  'jeder',
  'jede',
  'jedes',
  'jedem',
  'jeden',
  'mancher',
  'manche',
  'manches',
  'manchem',
  'manchen',
  'einige',
  'einiger',
  'einigem',
  'einigen',
  'einiges',
  'nichts',
  'man',
  'selbst',
  'eigentlich',
  'wirklich',
  'eben',
  'halt',
  'mal',
  'ja',
  'nein',
  'okay',
  'gut',
  'schlecht',
]);

// Combined stop words for cross-language topic matching
// (users might discuss topics in mixed languages or switch between conversations)
const ALL_STOP_WORDS = new Set([...STOP_WORDS_EN, ...STOP_WORDS_DE]);

/**
 * Calculate similarity between two topic strings using word overlap
 * Returns a score from 0 to 1
 *
 * Uses combined EN+DE stop words since:
 * - Topics might be in different languages across conversations
 * - Users might mix languages (common in bilingual contexts)
 * - We want "job interview" to match "Vorstellungsgespräch" context-wise
 */
function calculateTopicSimilarity(topic1: string, topic2: string): number {
  const tokenize = (s: string): Set<string> => {
    const words = s
      .toLowerCase()
      // Include all Latin characters with diacritics (German ä, ö, ü, ß and more)
      .replace(/[^\p{L}\p{N}\s]/gu, '') // Unicode-aware: keep letters, numbers, whitespace
      .split(/\s+/)
      .filter((w) => w.length > 2 && !ALL_STOP_WORDS.has(w));
    return new Set(words);
  };

  const words1 = tokenize(topic1);
  const words2 = tokenize(topic2);

  if (words1.size === 0 || words2.size === 0) return 0;

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Find the best matching existing topic for a new extraction
 * Returns the index of the best match, or -1 if no good match
 */
function findMatchingTopic(newTopic: TopicExtraction, existingTopics: RecentTopic[]): number {
  const SIMILARITY_THRESHOLD = 0.4; // 40% word overlap required
  const HIGH_SIMILARITY_THRESHOLD = 0.6; // For when contexts differ
  const CATEGORY_BOOST = 0.15; // Bonus for same category
  const CONTEXT_MISMATCH_THRESHOLD = 0.2; // Below this = very different contexts

  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < existingTopics.length; i++) {
    const existing = existingTopics[i];

    // Calculate topic name similarity
    const topicScore = calculateTopicSimilarity(newTopic.topic, existing.topic);

    // Calculate context similarity (prevents merging different job interviews, etc.)
    const contextScore = calculateTopicSimilarity(newTopic.context, existing.context);

    let score = topicScore;

    // Boost score if categories match
    if (newTopic.category === existing.category) {
      score += CATEGORY_BOOST;
    }

    // If contexts are very different, require higher topic similarity
    // This prevents "job interview at Google" merging with "job interview at Amazon"
    if (contextScore < CONTEXT_MISMATCH_THRESHOLD && topicScore < HIGH_SIMILARITY_THRESHOLD) {
      continue; // Skip - likely different situations with similar topic names
    }

    // Boost if contexts also match well
    if (contextScore > 0.3) {
      score += 0.1;
    }

    // Check if this is the best match so far
    if (score > bestScore && score >= SIMILARITY_THRESHOLD) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

/**
 * Apply topic extractions to mid-term memory
 * Stores recent topics/problems for cross-conversation continuity
 */
export async function applyTopicExtractions(
  userId: string,
  topics: TopicExtraction[]
): Promise<void> {
  if (!topics || topics.length === 0) return;

  const memoryRef = admin.firestore().doc(`users/${userId}/profile/midTermMemory`);
  const now = admin.firestore.Timestamp.now();

  try {
    const memoryDoc = await memoryRef.get();
    const existingData = memoryDoc.exists ? memoryDoc.data() : null;
    const existingTopics: RecentTopic[] = existingData?.recentTopics || [];

    for (const topicExtraction of topics) {
      // Find best matching existing topic using smart similarity
      const existingIndex = findMatchingTopic(topicExtraction, existingTopics);

      if (existingIndex >= 0) {
        const existing = existingTopics[existingIndex];

        // Update existing topic
        existing.lastMentionedAt = now;
        existing.mentionCount += 1;
        existing.context = topicExtraction.context;
        existing.category = topicExtraction.category;

        // Update valence if provided
        if (topicExtraction.valence) {
          existing.valence = topicExtraction.valence;
        }

        // Handle status change to resolved
        if (topicExtraction.status === 'resolved' && existing.status !== 'resolved') {
          existing.status = 'resolved';
          existing.resolvedAt = now;
          existing.resolutionOutcome = topicExtraction.resolutionOutcome;

          logger.info('Topic resolved', {
            userId,
            topic: existing.topic,
            outcome: existing.resolutionOutcome,
          });
        } else {
          existing.status = topicExtraction.status;
        }

        // Pattern detection: mark as recurring if mentioned 3+ times
        if (existing.mentionCount >= 3 && !existing.isRecurring) {
          existing.isRecurring = true;
          logger.info('Topic marked as recurring pattern', {
            userId,
            topic: existing.topic,
            mentionCount: existing.mentionCount,
          });
        }

        logger.info('Updated existing topic', {
          userId,
          topic: existing.topic,
          mentionCount: existing.mentionCount,
          isRecurring: existing.isRecurring,
        });
      } else {
        // Add new topic
        const newTopic: RecentTopic = {
          id: generateTopicId(),
          topic: topicExtraction.topic,
          context: topicExtraction.context,
          category: topicExtraction.category,
          status: topicExtraction.status,
          valence: topicExtraction.valence,
          firstMentionedAt: now,
          lastMentionedAt: now,
          mentionCount: 1,
          isRecurring: false,
        };

        // If it's already resolved on first mention, track it
        if (topicExtraction.status === 'resolved') {
          newTopic.resolvedAt = now;
          newTopic.resolutionOutcome = topicExtraction.resolutionOutcome;
        }

        existingTopics.push(newTopic);

        logger.info('Added new topic', {
          userId,
          topic: newTopic.topic,
          category: newTopic.category,
          valence: newTopic.valence,
        });
      }
    }

    // Prune old topics (>60 days with no mentions)
    const cutoffMs = 60 * 24 * 60 * 60 * 1000; // 60 days
    const cutoffDate = new Date(Date.now() - cutoffMs);

    const filtered = existingTopics.filter((t) => {
      const lastMentioned = toDate(t.lastMentionedAt);
      return lastMentioned > cutoffDate || t.status === 'active';
    });

    // Sort by recency and keep max 20 topics
    const sorted = filtered
      .sort((a, b) => {
        const aTime = toDate(a.lastMentionedAt).getTime();
        const bTime = toDate(b.lastMentionedAt).getTime();
        return bTime - aTime;
      })
      .slice(0, 20);

    // Save to Firestore
    await memoryRef.set(
      {
        userId,
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
        recentTopics: sorted,
      },
      { merge: true }
    );

    logger.info('Mid-term memory updated', {
      userId,
      topicsCount: sorted.length,
      newTopicsAdded: topics.length,
    });
  } catch (error) {
    logger.error('Failed to apply topic extractions', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - this is non-critical
  }
}
