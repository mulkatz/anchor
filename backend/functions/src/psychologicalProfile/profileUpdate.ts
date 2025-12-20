/**
 * Psychological Profile Update Logic
 *
 * Orchestrates the creation and updating of psychological profiles.
 */

import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { VertexAI } from '@google-cloud/vertexai';
import * as logger from 'firebase-functions/logger';
import { v4 as uuidv4 } from 'uuid';

import {
  PsychologicalProfile,
  WeeklyNote,
  ProfileUpdateResponse,
  InitialProfileResponse,
  SupportedLanguage,
  CoreIdentity,
  DynamicState,
  HistoricalChronicle,
  ComputedMetrics,
  WeeklyData,
  CognitiveDistortion,
  TrendDirection,
} from './types';

import { gatherAllUserData, formatWeeklyDataForAI, countDataPoints } from './dataGathering';
import {
  getProfileUpdatePrompt,
  getInitialProfilePrompt,
  buildProfileUpdateMessage,
  buildInitialProfileMessage,
} from './profilePrompt';

/**
 * Main function to create or update a psychological profile
 */
export async function createOrUpdateProfile(
  userId: string,
  language: SupportedLanguage = 'en-US'
): Promise<PsychologicalProfile> {
  const db = admin.firestore();
  const profileRef = db.doc(`users/${userId}/profile/psychologicalProfile`);

  logger.info('Starting psychological profile generation', { userId, language });

  // Check for existing profile
  const existingProfileSnap = await profileRef.get();
  const existingProfile = existingProfileSnap.exists
    ? (existingProfileSnap.data() as PsychologicalProfile)
    : null;

  // Gather user data
  const isInitialProfile = !existingProfile;
  const weeklyData = await gatherAllUserData(userId, isInitialProfile);

  logger.info('Gathered user data', {
    userId,
    isInitialProfile,
    dataPoints: countDataPoints(weeklyData),
    conversations: weeklyData.conversations.length,
    illuminateEntries: weeklyData.illuminateEntries.length,
    dailyLogs: weeklyData.dailyLogs.length,
  });

  // Check if we have enough data
  const dataPoints = countDataPoints(weeklyData);
  if (dataPoints < 3 && isInitialProfile) {
    logger.warn('Insufficient data for profile creation', { userId, dataPoints });
    throw new Error(
      `Insufficient data for profile creation. Found ${dataPoints} data points, need at least 3.`
    );
  }

  // Generate profile via AI
  let updatedProfile: PsychologicalProfile;

  if (isInitialProfile) {
    updatedProfile = await createInitialProfile(userId, weeklyData, language);
  } else {
    updatedProfile = await updateExistingProfile(userId, existingProfile!, weeklyData, language);
  }

  // Save to Firestore
  await profileRef.set(updatedProfile);

  logger.info('Psychological profile saved', {
    userId,
    version: updatedProfile.version,
    weeklyNotesCount: updatedProfile.historicalChronicle.weeklyNotes.length,
  });

  return updatedProfile;
}

/**
 * Create initial profile for new user
 */
async function createInitialProfile(
  userId: string,
  weeklyData: WeeklyData,
  language: SupportedLanguage
): Promise<PsychologicalProfile> {
  logger.info('Creating initial psychological profile', { userId });

  // Format data for AI
  const formattedData = formatWeeklyDataForAI(weeklyData);

  // Call Gemini for initial profile generation
  const aiResponse = await callGeminiForInitialProfile(formattedData, language);

  const now = Timestamp.now();

  // Build the initial profile structure
  const profile: PsychologicalProfile = {
    userId,
    version: 1,
    schemaVersion: '1.0',
    createdAt: now,
    lastUpdated: now,
    lastWeeklyUpdate: now,

    coreIdentity: {
      createdAt: now,
      lastMajorRevision: now,
      presentingConcerns: {
        primary: aiResponse.presentingConcerns.primary,
        secondary: aiResponse.presentingConcerns.secondary,
        firstDocumented: now,
        evolutionNotes: aiResponse.presentingConcerns.evolutionNotes,
      },
      formulation: aiResponse.formulation,
      strengths: aiResponse.strengths,
      riskFactors: {
        historicalFactors: aiResponse.riskFactors.historicalFactors,
        currentVulnerabilities: aiResponse.riskFactors.currentVulnerabilities,
        protectiveFactors: aiResponse.riskFactors.protectiveFactors,
        crisisHistoryCount: weeklyData.conversations.filter((c) => c.hasCrisisMessages).length,
      },
    },

    dynamicState: {
      lastUpdated: now,
      currentFocus: {
        activeThemes: aiResponse.initialHypotheses,
        recentTriggers: [],
        workingHypotheses: [aiResponse.recommendedApproach],
      },
      distortionProfile: buildInitialDistortionProfile(weeklyData, now),
      emotionalProfile: buildInitialEmotionalProfile(weeklyData),
      engagement: buildEngagementMetrics(weeklyData),
      treatmentConsiderations: {
        currentApproach: aiResponse.recommendedApproach,
        effectiveInterventions: [],
        ineffectiveInterventions: [],
        suggestedAdaptations: [],
      },
    },

    historicalChronicle: {
      weeklyNotes: [],
      milestones: [
        {
          id: uuidv4(),
          date: now,
          type: 'insight',
          title: 'Profile Created',
          description: 'Initial psychological profile established based on available data.',
          significance: 'minor',
          relatedThemes: aiResponse.initialHypotheses,
          evidenceReferences: [],
        },
      ],
      assessmentHistory: weeklyData.assessments.map((a) => ({
        assessmentId: a.id,
        date: a.createdAt,
        totalScore: a.totalScore,
        severity: a.severity,
        changeFromPrevious: null,
      })),
      revisionLog: [],
    },

    computedMetrics: calculateComputedMetrics(weeklyData, null, now),
  };

  return profile;
}

/**
 * Update existing profile with new weekly data
 */
async function updateExistingProfile(
  userId: string,
  existingProfile: PsychologicalProfile,
  weeklyData: WeeklyData,
  language: SupportedLanguage
): Promise<PsychologicalProfile> {
  logger.info('Updating existing psychological profile', {
    userId,
    currentVersion: existingProfile.version,
  });

  // Format data for AI
  const formattedData = formatWeeklyDataForAI(weeklyData);

  // Format existing profile for context
  const existingProfileContext = formatExistingProfileForAI(existingProfile);

  // Get previous week's note if available
  const previousNote = existingProfile.historicalChronicle.weeklyNotes.slice(-1)[0] || null;
  const previousNoteContext = previousNote
    ? `Week of ${previousNote.weekStartDate}:\n${previousNote.observations.weekInReview}`
    : null;

  // Call Gemini for profile update
  const aiResponse = await callGeminiForProfileUpdate(
    existingProfileContext,
    formattedData,
    previousNoteContext,
    language
  );

  const now = Timestamp.now();
  const weekStartDate = getWeekStartDate();

  // Build new weekly note
  const newWeeklyNote: WeeklyNote = {
    id: uuidv4(),
    weekStartDate,
    createdAt: now,
    dataSummary: aiResponse.dataSummary,
    observations: aiResponse.observations,
    changeFromLastWeek: aiResponse.changeFromLastWeek,
    forwardLooking: aiResponse.forwardLooking,
  };

  // Update dynamic state based on AI response
  const updatedDynamicState: DynamicState = {
    lastUpdated: now,
    currentFocus: {
      activeThemes: aiResponse.dynamicStateUpdates.activeThemes,
      recentTriggers: existingProfile.dynamicState.currentFocus.recentTriggers, // Keep existing
      workingHypotheses: aiResponse.dynamicStateUpdates.workingHypotheses,
    },
    distortionProfile: updateDistortionProfile(
      existingProfile.dynamicState.distortionProfile,
      aiResponse.dynamicStateUpdates,
      weeklyData,
      now
    ),
    emotionalProfile: updateEmotionalProfile(
      existingProfile.dynamicState.emotionalProfile,
      aiResponse.dynamicStateUpdates,
      weeklyData
    ),
    engagement: buildEngagementMetrics(weeklyData),
    treatmentConsiderations: {
      currentApproach: existingProfile.dynamicState.treatmentConsiderations.currentApproach,
      effectiveInterventions: mergeInterventions(
        existingProfile.dynamicState.treatmentConsiderations.effectiveInterventions,
        aiResponse.dynamicStateUpdates.effectiveInterventions
      ),
      ineffectiveInterventions:
        existingProfile.dynamicState.treatmentConsiderations.ineffectiveInterventions,
      suggestedAdaptations: aiResponse.dynamicStateUpdates.suggestedAdaptations,
    },
  };

  // Update historical chronicle (append-only)
  const updatedChronicle: HistoricalChronicle = {
    weeklyNotes: [...existingProfile.historicalChronicle.weeklyNotes, newWeeklyNote].slice(-52), // Keep last year
    milestones: aiResponse.milestoneDetected
      ? [
          ...existingProfile.historicalChronicle.milestones,
          {
            id: uuidv4(),
            date: now,
            type: aiResponse.milestoneDetected.type,
            title: aiResponse.milestoneDetected.title,
            description: aiResponse.milestoneDetected.description,
            significance: aiResponse.milestoneDetected.significance,
            relatedThemes: aiResponse.dynamicStateUpdates.activeThemes,
            evidenceReferences: [],
          },
        ]
      : existingProfile.historicalChronicle.milestones,
    assessmentHistory: [
      ...existingProfile.historicalChronicle.assessmentHistory,
      ...weeklyData.assessments
        .filter(
          (a) =>
            !existingProfile.historicalChronicle.assessmentHistory.some(
              (h) => h.assessmentId === a.id
            )
        )
        .map((a) => ({
          assessmentId: a.id,
          date: a.createdAt,
          totalScore: a.totalScore,
          severity: a.severity,
          changeFromPrevious: calculateAssessmentChange(
            a.totalScore,
            existingProfile.historicalChronicle.assessmentHistory
          ),
        })),
    ],
    revisionLog: aiResponse.coreIdentityUpdate
      ? [
          ...existingProfile.historicalChronicle.revisionLog,
          {
            date: now,
            section: aiResponse.coreIdentityUpdate.section,
            previousValue: getExistingValue(
              existingProfile.coreIdentity,
              aiResponse.coreIdentityUpdate.section
            ),
            newValue: aiResponse.coreIdentityUpdate.proposedChange,
            rationale: aiResponse.coreIdentityUpdate.rationale,
          },
        ]
      : existingProfile.historicalChronicle.revisionLog,
  };

  // Conditionally update core identity
  let updatedCoreIdentity = existingProfile.coreIdentity;
  if (aiResponse.coreIdentityUpdate) {
    updatedCoreIdentity = applyCoreIdentityUpdate(
      existingProfile.coreIdentity,
      aiResponse.coreIdentityUpdate,
      now
    );
  }

  // Build updated profile
  const updatedProfile: PsychologicalProfile = {
    ...existingProfile,
    version: existingProfile.version + 1,
    lastUpdated: now,
    lastWeeklyUpdate: now,
    coreIdentity: updatedCoreIdentity,
    dynamicState: updatedDynamicState,
    historicalChronicle: updatedChronicle,
    computedMetrics: calculateComputedMetrics(weeklyData, existingProfile, now),
  };

  return updatedProfile;
}

// ============================================================================
// AI Call Functions
// ============================================================================

async function callGeminiForInitialProfile(
  formattedData: string,
  language: SupportedLanguage
): Promise<InitialProfileResponse> {
  const vertexAI = new VertexAI({
    project: process.env.GCLOUD_PROJECT,
    location: 'us-central1',
  });

  const model = vertexAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: getInitialProfilePrompt(language),
  });

  const message = buildInitialProfileMessage(formattedData);

  logger.info('Calling Gemini for initial profile', { messageLength: message.length });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: message }] }],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.4, // Lower for consistent analysis
      topP: 0.9,
    },
  });

  const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('Empty response from Gemini for initial profile');
  }

  return parseAIJsonResponse<InitialProfileResponse>(responseText);
}

async function callGeminiForProfileUpdate(
  existingProfileContext: string,
  formattedData: string,
  previousNoteContext: string | null,
  language: SupportedLanguage
): Promise<ProfileUpdateResponse> {
  const vertexAI = new VertexAI({
    project: process.env.GCLOUD_PROJECT,
    location: 'us-central1',
  });

  const model = vertexAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: getProfileUpdatePrompt(language),
  });

  const message = buildProfileUpdateMessage(
    existingProfileContext,
    formattedData,
    previousNoteContext
  );

  logger.info('Calling Gemini for profile update', { messageLength: message.length });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: message }] }],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.4,
      topP: 0.9,
    },
  });

  const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('Empty response from Gemini for profile update');
  }

  return parseAIJsonResponse<ProfileUpdateResponse>(responseText);
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseAIJsonResponse<T>(responseText: string): T {
  let cleanedText = responseText.trim();

  // Remove markdown code blocks if present
  if (cleanedText.startsWith('```')) {
    const lines = cleanedText.split('\n');
    lines.shift(); // Remove opening ```json
    if (lines[lines.length - 1]?.trim() === '```') {
      lines.pop(); // Remove closing ```
    }
    cleanedText = lines.join('\n');
  }

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    logger.error('Failed to parse AI response', { responseText: cleanedText.slice(0, 500) });
    throw new Error(`Failed to parse AI response: ${error}`);
  }
}

function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

function formatExistingProfileForAI(profile: PsychologicalProfile): string {
  return `
PRESENTING CONCERNS:
Primary: ${profile.coreIdentity.presentingConcerns.primary}
Secondary: ${profile.coreIdentity.presentingConcerns.secondary.join(', ') || 'None'}
Evolution: ${profile.coreIdentity.presentingConcerns.evolutionNotes}

CBT FORMULATION:
Cognitive Patterns: ${profile.coreIdentity.formulation.cognitivePatterns}
Emotional Profile: ${profile.coreIdentity.formulation.emotionalProfile}
Physiological Responses: ${profile.coreIdentity.formulation.physiologicalResponses}
Behavioral Patterns: ${profile.coreIdentity.formulation.behavioralPatterns}
Environmental Factors: ${profile.coreIdentity.formulation.environmentalFactors}

STRENGTHS:
Personal: ${profile.coreIdentity.strengths.personal.join(', ')}
Relational: ${profile.coreIdentity.strengths.relational.join(', ')}
Coping: ${profile.coreIdentity.strengths.coping.join(', ')}
Insights: ${profile.coreIdentity.strengths.insights.join(', ')}

CURRENT DYNAMIC STATE:
Active Themes: ${profile.dynamicState.currentFocus.activeThemes.join(', ')}
Working Hypotheses: ${profile.dynamicState.currentFocus.workingHypotheses.join('; ')}
Dominant Distortions: ${profile.dynamicState.distortionProfile.dominantDistortions.join(', ')}
Intensity Trend: ${profile.dynamicState.emotionalProfile.intensityTrend}
30-Day Avg Intensity: ${profile.dynamicState.emotionalProfile.averageIntensity30Day}

TREATMENT CONSIDERATIONS:
Current Approach: ${profile.dynamicState.treatmentConsiderations.currentApproach}
Effective Interventions: ${profile.dynamicState.treatmentConsiderations.effectiveInterventions.map((i) => i.name).join(', ') || 'None identified yet'}
Ineffective Interventions: ${profile.dynamicState.treatmentConsiderations.ineffectiveInterventions.map((i) => i.name).join(', ') || 'None identified'}

LONGITUDINAL CONTEXT:
Days on Platform: ${profile.computedMetrics.daysOnPlatform}
Total Interactions: ${profile.computedMetrics.totalInteractions}
Progress Score: ${profile.computedMetrics.progressScore}/100
Progress Trend: ${profile.computedMetrics.progressTrend}
`.trim();
}

function buildInitialDistortionProfile(
  weeklyData: WeeklyData,
  now: Timestamp
): DynamicState['distortionProfile'] {
  const distortionCounts: Record<string, number> = {};

  weeklyData.illuminateEntries.forEach((e) => {
    e.userConfirmedDistortions.forEach((d) => {
      distortionCounts[d] = (distortionCounts[d] || 0) + 1;
    });
  });

  const patterns = Object.entries(distortionCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type: type as CognitiveDistortion,
      count30Day: count,
      countAllTime: count,
      trend: 'stable' as TrendDirection,
      typicalContexts: [],
      averageConfidence: 0.8,
    }));

  return {
    patterns,
    dominantDistortions: patterns.slice(0, 3).map((p) => p.type),
    emergingDistortions: [],
    decliningDistortions: [],
    lastCalculated: now,
  };
}

function buildInitialEmotionalProfile(weeklyData: WeeklyData): DynamicState['emotionalProfile'] {
  const emotionCounts: Record<string, { count: number; totalIntensity: number }> = {};

  weeklyData.illuminateEntries.forEach((e) => {
    e.primaryEmotions.forEach((em) => {
      if (!emotionCounts[em]) {
        emotionCounts[em] = { count: 0, totalIntensity: 0 };
      }
      emotionCounts[em].count++;
      emotionCounts[em].totalIntensity += e.emotionalIntensity;
    });
  });

  const frequentEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([type, data]) => ({
      type: type as any,
      count30Day: data.count,
      averageIntensity: data.count > 0 ? Math.round(data.totalIntensity / data.count) : 50,
      trend: 'stable' as TrendDirection,
    }));

  const avgIntensity =
    weeklyData.illuminateEntries.length > 0
      ? Math.round(
          weeklyData.illuminateEntries.reduce((sum, e) => sum + e.emotionalIntensity, 0) /
            weeklyData.illuminateEntries.length
        )
      : 50;

  return {
    frequentEmotions,
    intensityTrend: 'stable',
    averageIntensity30Day: avgIntensity,
    peakIntensityMoments: [],
    regulationStrategies: {
      used: [],
      effective: [],
      ineffective: [],
    },
  };
}

function buildEngagementMetrics(weeklyData: WeeklyData): DynamicState['engagement'] {
  const features: DynamicState['engagement']['preferredFeatures'] = [];

  if (weeklyData.conversations.length > 0) features.push('chat');
  if (weeklyData.illuminateEntries.length > 0) features.push('illuminate');
  if (weeklyData.diveSessions.length > 0) features.push('dive');
  if (weeklyData.journalSessions.length > 0) features.push('journal');
  if (weeklyData.dailyLogs.length > 0) features.push('tidelog');

  return {
    appUsagePattern: 'consistent',
    preferredFeatures: features,
    averageSessionLength: 10, // Default estimate
    timeOfDayPattern: 'varied',
    daysActiveThisMonth: 7, // Estimate based on weekly data
  };
}

function updateDistortionProfile(
  existing: DynamicState['distortionProfile'],
  updates: ProfileUpdateResponse['dynamicStateUpdates'],
  weeklyData: WeeklyData,
  now: Timestamp
): DynamicState['distortionProfile'] {
  // Count new distortions from this week
  const newCounts: Record<string, number> = {};
  weeklyData.illuminateEntries.forEach((e) => {
    e.userConfirmedDistortions.forEach((d) => {
      newCounts[d] = (newCounts[d] || 0) + 1;
    });
  });

  // Merge with existing patterns
  const updatedPatterns = existing.patterns.map((p) => ({
    ...p,
    count30Day: newCounts[p.type] || 0,
    countAllTime: p.countAllTime + (newCounts[p.type] || 0),
    trend: determineTrend(p.count30Day, newCounts[p.type] || 0),
  }));

  // Add any new distortions not in existing patterns
  Object.entries(newCounts).forEach(([type, count]) => {
    if (!updatedPatterns.find((p) => p.type === type)) {
      updatedPatterns.push({
        type: type as CognitiveDistortion,
        count30Day: count,
        countAllTime: count,
        trend: 'stable',
        typicalContexts: [],
        averageConfidence: 0.8,
      });
    }
  });

  return {
    patterns: updatedPatterns.sort((a, b) => b.countAllTime - a.countAllTime),
    dominantDistortions: updates.dominantDistortions,
    emergingDistortions: updates.emergingDistortions,
    decliningDistortions: updates.decliningDistortions,
    lastCalculated: now,
  };
}

function updateEmotionalProfile(
  existing: DynamicState['emotionalProfile'],
  updates: ProfileUpdateResponse['dynamicStateUpdates'],
  weeklyData: WeeklyData
): DynamicState['emotionalProfile'] {
  const avgIntensity =
    weeklyData.illuminateEntries.length > 0
      ? Math.round(
          weeklyData.illuminateEntries.reduce((sum, e) => sum + e.emotionalIntensity, 0) /
            weeklyData.illuminateEntries.length
        )
      : existing.averageIntensity30Day;

  return {
    ...existing,
    intensityTrend: updates.intensityTrend,
    averageIntensity30Day: avgIntensity,
  };
}

function mergeInterventions(
  existing: DynamicState['treatmentConsiderations']['effectiveInterventions'],
  newInterventions: ProfileUpdateResponse['dynamicStateUpdates']['effectiveInterventions']
): DynamicState['treatmentConsiderations']['effectiveInterventions'] {
  const merged = [...existing];

  newInterventions.forEach((newInt) => {
    const existingIndex = merged.findIndex((e) => e.name === newInt.name);
    if (existingIndex === -1) {
      merged.push({
        name: newInt.name,
        type: newInt.type,
        examples: [],
        effectivenessRating: 3, // Default
      });
    }
  });

  return merged;
}

function determineTrend(oldCount: number, newCount: number): TrendDirection {
  if (newCount > oldCount * 1.2) return 'worsening';
  if (newCount < oldCount * 0.8) return 'improving';
  return 'stable';
}

function calculateAssessmentChange(
  newScore: number,
  history: PsychologicalProfile['historicalChronicle']['assessmentHistory']
): number | null {
  if (history.length === 0) return null;
  const lastAssessment = history[history.length - 1];
  return newScore - lastAssessment.totalScore;
}

function getExistingValue(coreIdentity: CoreIdentity, section: string): string {
  switch (section) {
    case 'formulation':
      return JSON.stringify(coreIdentity.formulation);
    case 'strengths':
      return JSON.stringify(coreIdentity.strengths);
    case 'riskFactors':
      return JSON.stringify(coreIdentity.riskFactors);
    case 'treatmentConsiderations':
      return 'See dynamic state';
    default:
      return '';
  }
}

function applyCoreIdentityUpdate(
  existing: CoreIdentity,
  update: NonNullable<ProfileUpdateResponse['coreIdentityUpdate']>,
  now: Timestamp
): CoreIdentity {
  // For now, just update the lastMajorRevision
  // In a full implementation, you would parse and apply the specific changes
  return {
    ...existing,
    lastMajorRevision: now,
  };
}

function calculateComputedMetrics(
  weeklyData: WeeklyData,
  existingProfile: PsychologicalProfile | null,
  now: Timestamp
): ComputedMetrics {
  const totalInteractions =
    weeklyData.conversations.reduce((sum, c) => sum + c.userMessages.length, 0) +
    weeklyData.illuminateEntries.length +
    weeklyData.dailyLogs.length +
    weeklyData.journalSessions.length +
    weeklyData.diveSessions.length;

  // Calculate days on platform
  let daysOnPlatform = 1;
  if (existingProfile) {
    const created = existingProfile.createdAt.toDate();
    daysOnPlatform = Math.max(
      1,
      Math.ceil((now.toDate().getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  // Determine primary distortion
  const distortionCounts: Record<string, number> = {};
  weeklyData.illuminateEntries.forEach((e) => {
    e.userConfirmedDistortions.forEach((d) => {
      distortionCounts[d] = (distortionCounts[d] || 0) + 1;
    });
  });
  const primaryDistortion = Object.entries(distortionCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] as CognitiveDistortion | undefined;

  return {
    calculatedAt: now,
    progressScore: 50, // Default, would be calculated based on trends
    progressTrend: 'stable',
    daysOnPlatform,
    totalInteractions: existingProfile
      ? existingProfile.computedMetrics.totalInteractions + totalInteractions
      : totalInteractions,
    weeklyAverage: {
      conversations: weeklyData.conversations.length,
      illuminateEntries: weeklyData.illuminateEntries.length,
      dailyLogs: weeklyData.dailyLogs.length,
    },
    mostCommonTriggerDomain: null,
    mostEffectiveIntervention: null,
    primaryDistortion: primaryDistortion || null,
  };
}
