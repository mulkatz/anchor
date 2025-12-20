/**
 * Psychological Profile Type Definitions
 *
 * A "Living Clinical Document" structure for maintaining comprehensive
 * psychological profiles of users. Designed for CBT-focused therapeutic
 * personalization with append-only historical tracking.
 */

import { Timestamp } from 'firebase-admin/firestore';

// ============================================================================
// Existing Type Re-exports (for reference)
// ============================================================================

export type CognitiveDistortion =
  | 'catastrophizing'
  | 'mind_reading'
  | 'fortune_telling'
  | 'all_or_nothing'
  | 'emotional_reasoning'
  | 'should_statements'
  | 'labeling'
  | 'personalization'
  | 'filtering'
  | 'overgeneralization';

export type EmotionType =
  | 'anxious'
  | 'worried'
  | 'panicked'
  | 'nervous'
  | 'restless'
  | 'sad'
  | 'hopeless'
  | 'lonely'
  | 'empty'
  | 'angry'
  | 'frustrated'
  | 'irritated'
  | 'ashamed'
  | 'guilty'
  | 'embarrassed'
  | 'overwhelmed'
  | 'stressed'
  | 'exhausted'
  | 'numb';

export type AnxietySeverity = 'minimal' | 'mild' | 'moderate' | 'severe';
export type SupportedLanguage = 'en-US' | 'de-DE';
export type WeatherType = 'stormy' | 'foggy' | 'turbulent' | 'clear' | 'sunny' | 'calm';

// ============================================================================
// Core Enums and Literal Types
// ============================================================================

export type TrendDirection = 'improving' | 'stable' | 'worsening';
export type UsagePattern = 'consistent' | 'sporadic' | 'crisis-driven' | 'declining';
export type AppFeature = 'chat' | 'illuminate' | 'dive' | 'journal' | 'tidelog';
export type TimeOfDayPattern = 'morning' | 'afternoon' | 'evening' | 'night' | 'varied';
export type InterventionType = 'cognitive' | 'behavioral' | 'somatic' | 'interpersonal';
export type FrequencyLevel = 'rare' | 'occasional' | 'frequent' | 'constant';
export type TriggerDomain =
  | 'work'
  | 'social'
  | 'health'
  | 'relationship'
  | 'financial'
  | 'existential'
  | 'other';
export type MilestoneType =
  | 'breakthrough'
  | 'setback'
  | 'insight'
  | 'behavioral_change'
  | 'crisis_averted'
  | 'goal_achieved';
export type SignificanceLevel = 'minor' | 'moderate' | 'major';
export type EngagementChange = 'increased' | 'stable' | 'decreased';
export type RevisionSection =
  | 'formulation'
  | 'strengths'
  | 'riskFactors'
  | 'treatmentConsiderations';
export type CrisisLevel = 'none' | 'low' | 'moderate' | 'elevated';

// ============================================================================
// Main Profile Document
// ============================================================================

export interface PsychologicalProfile {
  // Document Metadata
  userId: string;
  version: number; // Incremented on each update
  schemaVersion: '1.0';
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  lastWeeklyUpdate: Timestamp | null;

  // Main Sections
  coreIdentity: CoreIdentity;
  dynamicState: DynamicState;
  historicalChronicle: HistoricalChronicle;

  // Computed Fields
  computedMetrics: ComputedMetrics;
}

// ============================================================================
// Core Identity (Stable - rarely changes)
// ============================================================================

export interface CoreIdentity {
  createdAt: Timestamp;
  lastMajorRevision: Timestamp;

  presentingConcerns: PresentingConcerns;
  formulation: CBTFormulation;
  strengths: StrengthsProfile;
  riskFactors: RiskProfile;
}

export interface PresentingConcerns {
  primary: string; // e.g., "Generalized anxiety with social components"
  secondary: string[]; // e.g., ["Sleep disturbances", "Work stress"]
  firstDocumented: Timestamp;
  evolutionNotes: string; // How concerns have shifted over time
}

export interface CBTFormulation {
  cognitivePatterns: string; // Core beliefs, thinking styles
  emotionalProfile: string; // How they experience/express emotions
  physiologicalResponses: string; // Body-based anxiety manifestations
  behavioralPatterns: string; // Avoidance, safety behaviors, coping
  environmentalFactors: string; // Work, relationships, stressors
}

export interface StrengthsProfile {
  personal: string[]; // e.g., ["Self-aware", "Seeks help proactively"]
  relational: string[]; // e.g., ["Strong support system", "Good communicator"]
  coping: string[]; // e.g., ["Uses exercise", "Journaling helps"]
  insights: string[]; // e.g., ["Recognizes catastrophizing", "Knows triggers"]
}

export interface RiskProfile {
  historicalFactors: string[]; // e.g., ["Previous panic attacks"]
  currentVulnerabilities: string[]; // e.g., ["High work stress period"]
  protectiveFactors: string[]; // e.g., ["No suicidal ideation", "Strong support"]
  crisisHistoryCount: number; // Times crisis resources shown
}

// ============================================================================
// Dynamic State (Changes weekly/monthly)
// ============================================================================

export interface DynamicState {
  lastUpdated: Timestamp;

  currentFocus: CurrentFocus;
  distortionProfile: DistortionProfile;
  emotionalProfile: EmotionalProfileState;
  engagement: EngagementMetrics;
  treatmentConsiderations: TreatmentConsiderations;
}

export interface CurrentFocus {
  activeThemes: string[]; // e.g., ["Work presentation anxiety", "Imposter syndrome"]
  recentTriggers: IdentifiedTrigger[];
  workingHypotheses: string[]; // Current therapeutic hunches
}

export interface DistortionProfile {
  patterns: DistortionPattern[];
  dominantDistortions: CognitiveDistortion[]; // Top 3
  emergingDistortions: CognitiveDistortion[]; // Recently increasing
  decliningDistortions: CognitiveDistortion[]; // Getting better
  lastCalculated: Timestamp;
}

export interface DistortionPattern {
  type: CognitiveDistortion;
  count30Day: number;
  countAllTime: number;
  trend: TrendDirection;
  typicalContexts: string[]; // e.g., ["Work meetings", "Social events"]
  averageConfidence: number; // AI detection confidence
}

export interface EmotionalProfileState {
  frequentEmotions: EmotionFrequency[];
  intensityTrend: TrendDirection;
  averageIntensity30Day: number; // 0-100
  peakIntensityMoments: string[]; // What triggers highest intensity
  regulationStrategies: RegulationStrategies;
}

export interface RegulationStrategies {
  used: string[]; // What they try
  effective: string[]; // What works
  ineffective: string[]; // What doesn't work
}

export interface EmotionFrequency {
  type: EmotionType;
  count30Day: number;
  averageIntensity: number;
  trend: TrendDirection;
}

export interface EngagementMetrics {
  appUsagePattern: UsagePattern;
  preferredFeatures: AppFeature[];
  averageSessionLength: number; // minutes
  timeOfDayPattern: TimeOfDayPattern;
  daysActiveThisMonth: number;
}

export interface TreatmentConsiderations {
  currentApproach: string; // e.g., "CBT with exposure elements"
  effectiveInterventions: Intervention[];
  ineffectiveInterventions: Intervention[];
  suggestedAdaptations: string[]; // e.g., "Consider more somatic focus"
}

export interface Intervention {
  name: string;
  type: InterventionType;
  examples: string[]; // Specific instances
  effectivenessRating: number; // 1-5 based on outcomes
}

export interface IdentifiedTrigger {
  description: string;
  frequency: FrequencyLevel;
  domain: TriggerDomain;
  firstIdentified: Timestamp;
  recentOccurrences: number; // Last 30 days
}

// ============================================================================
// Historical Chronicle (Append-only, never deleted)
// ============================================================================

export interface HistoricalChronicle {
  weeklyNotes: WeeklyNote[];
  milestones: ClinicalMilestone[];
  assessmentHistory: AssessmentSnapshot[];
  revisionLog: ProfileRevision[];
}

export interface WeeklyNote {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  createdAt: Timestamp;

  dataSummary: WeeklyDataSummary;
  observations: WeeklyObservations;
  changeFromLastWeek: WeeklyDifferential;
  forwardLooking: ForwardGuidance;
}

export interface WeeklyDataSummary {
  conversationCount: number;
  messageCount: number;
  illuminateEntryCount: number;
  diveSessionsCompleted: string[];
  dailyLogCount: number;
  journalSessionCount: number;
  averageEmotionalIntensity: number | null;
  crisisResourcesShown: number;
}

export interface WeeklyObservations {
  weekInReview: string; // 2-3 paragraph summary
  notablePatterns: string[];
  progressIndicators: string[];
  concernIndicators: string[];
  quotableInsights: string[]; // User's own words that reveal insight
}

export interface WeeklyDifferential {
  intensityChange: number; // -100 to +100
  engagementChange: EngagementChange;
  newThemesEmerged: string[];
  resolvedThemes: string[];
  newDistortionsObserved: CognitiveDistortion[];
  distortionImprovements: CognitiveDistortion[];
}

export interface ForwardGuidance {
  suggestedFocus: string[];
  adaptationsToTry: string[];
  monitorFor: string[];
}

export interface ClinicalMilestone {
  id: string;
  date: Timestamp;
  type: MilestoneType;
  title: string;
  description: string;
  significance: SignificanceLevel;
  relatedThemes: string[];
  evidenceReferences: string[]; // Links to specific entries/messages
}

export interface AssessmentSnapshot {
  assessmentId: string;
  date: Timestamp;
  totalScore: number;
  severity: AnxietySeverity;
  changeFromPrevious: number | null;
}

export interface ProfileRevision {
  date: Timestamp;
  section: RevisionSection;
  previousValue: string;
  newValue: string;
  rationale: string; // Why the understanding changed
}

// ============================================================================
// Computed Metrics
// ============================================================================

export interface ComputedMetrics {
  calculatedAt: Timestamp;

  // Overall Progress Score (0-100)
  progressScore: number;
  progressTrend: TrendDirection;

  // Time-based summaries
  daysOnPlatform: number;
  totalInteractions: number;
  weeklyAverage: WeeklyAverages;

  // Pattern summaries
  mostCommonTriggerDomain: TriggerDomain | null;
  mostEffectiveIntervention: string | null;
  primaryDistortion: CognitiveDistortion | null;
}

export interface WeeklyAverages {
  conversations: number;
  illuminateEntries: number;
  dailyLogs: number;
}

// ============================================================================
// Data Gathering Types (Input for profile generation)
// ============================================================================

export interface WeeklyData {
  conversations: ConversationData[];
  illuminateEntries: IlluminateEntryData[];
  dailyLogs: DailyLogData[];
  diveSessions: DiveSessionData[];
  journalSessions: JournalSessionData[];
  weeklyInsight: WeeklyInsightData | null;
  conversationProfile: ConversationProfileData | null;
  assessments: AssessmentData[];
}

export interface ConversationData {
  id: string;
  messageCount: number;
  userMessages: Array<{
    text: string;
    timestamp: Timestamp;
  }>;
  hasCrisisMessages: boolean;
}

export interface IlluminateEntryData {
  id: string;
  situation: string;
  automaticThoughts: string;
  emotionalIntensity: number;
  primaryEmotions: EmotionType[];
  userConfirmedDistortions: CognitiveDistortion[];
  selectedReframe: string;
  createdAt: Timestamp;
}

export interface DailyLogData {
  date: string;
  moodDepth: number;
  weather: WeatherType;
  noteText: string;
}

export interface DiveSessionData {
  lessonId: string;
  completedAt: Timestamp;
  messageCount: number;
}

export interface JournalSessionData {
  date: string;
  text: string;
  wordCount: number;
}

export interface WeeklyInsightData {
  insightText: string;
  recommendations: string[];
  identifiedTriggers: string[];
}

export interface ConversationProfileData {
  styleDescription: string;
  mirroringIntensity: number;
}

export interface AssessmentData {
  id: string;
  totalScore: number;
  severity: AnxietySeverity;
  createdAt: Timestamp;
}

// ============================================================================
// AI Response Types (Output from Gemini)
// ============================================================================

export interface ProfileUpdateResponse {
  dataSummary: WeeklyDataSummary;
  observations: WeeklyObservations;
  changeFromLastWeek: WeeklyDifferential;
  forwardLooking: ForwardGuidance;
  dynamicStateUpdates: DynamicStateUpdates;
  milestoneDetected: MilestoneDetection | null;
  coreIdentityUpdate: CoreIdentityUpdateProposal | null;
}

export interface DynamicStateUpdates {
  activeThemes: string[];
  workingHypotheses: string[];
  dominantDistortions: CognitiveDistortion[];
  emergingDistortions: CognitiveDistortion[];
  decliningDistortions: CognitiveDistortion[];
  intensityTrend: TrendDirection;
  effectiveInterventions: Array<{ name: string; type: InterventionType }>;
  suggestedAdaptations: string[];
}

export interface MilestoneDetection {
  type: MilestoneType;
  title: string;
  description: string;
  significance: SignificanceLevel;
}

export interface CoreIdentityUpdateProposal {
  section: RevisionSection;
  proposedChange: string;
  rationale: string;
}

export interface InitialProfileResponse {
  presentingConcerns: {
    primary: string;
    secondary: string[];
    evolutionNotes: string;
  };
  formulation: CBTFormulation;
  strengths: StrengthsProfile;
  riskFactors: {
    historicalFactors: string[];
    currentVulnerabilities: string[];
    protectiveFactors: string[];
  };
  initialHypotheses: string[];
  recommendedApproach: string;
}
