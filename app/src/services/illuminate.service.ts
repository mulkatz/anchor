/**
 * Illuminate Service
 * Frontend service for calling Lighthouse AI functions (distortion detection & reframes)
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase.service';
import type { DetectedDistortion, CognitiveDistortion } from '../models';
import { logAnalyticsEvent, AnalyticsEvent } from './analytics.service';

/**
 * Response from distortion detection AI
 */
interface DistortionDetectionResponse {
  distortions: {
    type: string;
    confidence: number;
    highlightedText: string;
    explanation: string;
  }[];
}

/**
 * Response from reframe generation AI
 */
interface ReframeGenerationResponse {
  reframes: string[];
}

/**
 * Analyze user's thoughts for cognitive distortions
 *
 * @param situation - What happened (the triggering event)
 * @param automaticThoughts - The user's anxious thoughts
 * @param language - User's language preference
 * @returns Array of detected distortions with confidence and explanations
 */
export async function analyzeDistortions(
  situation: string,
  automaticThoughts: string,
  language: string = 'en-US'
): Promise<DetectedDistortion[]> {
  try {
    const analyzeDistortionsFn = httpsCallable<
      { situation: string; automaticThoughts: string; language: string },
      DistortionDetectionResponse
    >(functions, 'analyzeDistortions');

    const result = await analyzeDistortionsFn({
      situation,
      automaticThoughts,
      language,
    });

    const distortions = result.data.distortions.map((d) => ({
      type: d.type as CognitiveDistortion,
      confidence: d.confidence,
      explanation: d.explanation,
      highlightedText: d.highlightedText,
    }));

    // Log analytics for each detected distortion
    distortions.forEach((d) => {
      logAnalyticsEvent(AnalyticsEvent.DISTORTION_DETECTED, {
        distortion_type: d.type,
        confidence: d.confidence,
      });
    });

    return distortions;
  } catch (error) {
    console.error('Error analyzing distortions:', error);
    // Return empty array on error - don't break the user flow
    return [];
  }
}

/**
 * Generate balanced reframe suggestions based on user's thoughts and distortions
 *
 * @param situation - What happened
 * @param automaticThoughts - The user's anxious thoughts
 * @param distortions - Detected cognitive distortions
 * @param language - User's language preference
 * @returns Array of reframe suggestions
 */
export async function generateReframes(
  situation: string,
  automaticThoughts: string,
  distortions: { type: string; explanation: string }[],
  language: string = 'en-US'
): Promise<string[]> {
  try {
    const generateReframesFn = httpsCallable<
      {
        situation: string;
        automaticThoughts: string;
        distortions: { type: string; explanation: string }[];
        language: string;
      },
      ReframeGenerationResponse
    >(functions, 'generateReframes');

    const result = await generateReframesFn({
      situation,
      automaticThoughts,
      distortions,
      language,
    });

    const reframes = result.data.reframes;

    logAnalyticsEvent(AnalyticsEvent.AI_REFRAME_GENERATED, {
      suggestion_count: reframes.length,
    });

    return reframes;
  } catch (error) {
    console.error('Error generating reframes:', error);
    // Return default reframes on error
    return getDefaultReframes(language);
  }
}

/**
 * Get both distortions and reframes in a single call sequence
 * Optimized for the Illuminate flow where we need both
 *
 * @param situation - What happened
 * @param automaticThoughts - The user's anxious thoughts
 * @param language - User's language preference
 * @returns Object with distortions and reframes
 */
export async function analyzeAndReframe(
  situation: string,
  automaticThoughts: string,
  language: string = 'en-US'
): Promise<{
  distortions: DetectedDistortion[];
  reframes: string[];
}> {
  // First, detect distortions
  const distortions = await analyzeDistortions(situation, automaticThoughts, language);

  // Then generate reframes based on detected distortions
  const distortionSummary = distortions.map((d) => ({
    type: d.type,
    explanation: d.explanation,
  }));

  const reframes = await generateReframes(
    situation,
    automaticThoughts,
    distortionSummary,
    language
  );

  return { distortions, reframes };
}

/**
 * Fallback reframes if AI fails
 */
function getDefaultReframes(language: string): string[] {
  const lang = language.startsWith('de') ? 'de' : 'en';

  const defaults: Record<string, string[]> = {
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

/**
 * Cognitive distortion descriptions for UI display
 * Matches the types in models/index.ts
 */
export const DISTORTION_INFO: Record<
  CognitiveDistortion,
  { name: string; description: string; emoji: string }
> = {
  catastrophizing: {
    name: 'Catastrophizing',
    description: 'Imagining the worst possible outcome',
    emoji: '🌋',
  },
  mind_reading: {
    name: 'Mind Reading',
    description: 'Assuming you know what others think',
    emoji: '🔮',
  },
  fortune_telling: {
    name: 'Fortune Telling',
    description: 'Predicting negative outcomes without evidence',
    emoji: '🎱',
  },
  all_or_nothing: {
    name: 'All-or-Nothing',
    description: 'Black-and-white thinking',
    emoji: '⚫',
  },
  emotional_reasoning: {
    name: 'Emotional Reasoning',
    description: 'Believing feelings equal facts',
    emoji: '💭',
  },
  should_statements: {
    name: 'Should Statements',
    description: "Rigid rules about how things 'should' be",
    emoji: '📋',
  },
  labeling: {
    name: 'Labeling',
    description: 'Attaching negative labels to self/others',
    emoji: '🏷️',
  },
  personalization: {
    name: 'Personalization',
    description: 'Taking excessive responsibility',
    emoji: '👤',
  },
  filtering: {
    name: 'Mental Filtering',
    description: 'Focusing only on negatives',
    emoji: '🔍',
  },
  overgeneralization: {
    name: 'Overgeneralization',
    description: 'Drawing broad conclusions from one event',
    emoji: '🔄',
  },
};

/**
 * Get localized distortion name
 * TODO: Add i18n keys when implementing translations
 */
export function getDistortionName(type: CognitiveDistortion, language: string): string {
  // For now, return English name
  // When i18n is added: return i18next.t(`illuminate.distortions.${type}.name`);
  return DISTORTION_INFO[type]?.name || type;
}

/**
 * Get localized distortion description
 */
export function getDistortionDescription(type: CognitiveDistortion, language: string): string {
  return DISTORTION_INFO[type]?.description || '';
}
