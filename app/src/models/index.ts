/**
 * TypeScript type definitions and interfaces
 * Export all your models from this file
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  status: 'active' | 'archived';
  title: string;
  preview: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  metadata?: {
    hasCrisisMessages?: boolean;
    firstUserMessage?: string;
    lastUserMessage?: string;
  };
}

export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  text: string; // Transcribed text or typed text
  role: 'user' | 'assistant' | 'crisis';
  createdAt: Date;
  isCrisisResponse?: boolean;

  // Voice message fields
  hasAudio?: boolean;
  audioPath?: string; // Cloud Storage path
  audioDuration?: number; // milliseconds
  transcriptionStatus?: 'uploading' | 'pending' | 'completed' | 'failed';

  metadata?: {
    // Text message metadata
    model?: string;
    tokensUsed?: number;
    responseTime?: number;

    // Voice message transcription metadata
    transcriptionConfidence?: number; // 0-1
    transcriptionTime?: number; // milliseconds
    audioFormat?: 'aac' | 'webm' | 'm4a' | 'wav';
    lowConfidenceWarning?: boolean;
    language?: string; // Language code for transcription (e.g., 'en-US', 'de-DE')
  };
}

// Profile and Settings models
export type SupportedLanguage = 'en-US' | 'de-DE';

export interface AppSettings {
  hapticsEnabled: boolean;
  analyticsEnabled: boolean;
  soundEffectsEnabled: boolean;
  pinkNoiseVolume: number; // 0-100
  language: SupportedLanguage; // User's preferred language
}

export interface UserProfile {
  displayName: string;
  photoURL: string | null; // Cloud Storage URL
  language: SupportedLanguage; // User's preferred language (for backend)
  createdAt: Date;
  updatedAt: Date;
  settings: AppSettings;
  crisisContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

// Tide Log (Journaling) models
export type WeatherType = 'stormy' | 'foggy' | 'turbulent' | 'clear' | 'sunny' | 'calm';

export interface DailyLog {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  date: string; // YYYY-MM-DD (local timezone)
  mood_depth: number; // 0-100 (0=Deep/Calm, 100=Surface/Anxious)
  weather: WeatherType;
  note_text: string; // Max 1000 chars
  is_released: boolean; // If true, blur in UI
  timezone?: string; // User's timezone (e.g., "America/New_York")
}

// Depths (Free-form Journal) models
export interface JournalSession {
  id: string; // UUID for each session
  text: string;
  startedAt: Date; // When user started typing this session
  fixedAt: Date | null; // When session became uneditable (null = still editable)
  wordCount: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD (for grouping by day)
  sessions: JournalSession[];
  createdAt: Date;
  updatedAt: Date;
}

// The Dive (Somatic Learning) models
export type DiveLessonStatus = 'locked' | 'in-progress' | 'completed';

export interface DiveProgressSummary {
  userId: string;
  currentLessonId: string;
  unlockedLessons: string[];
  completedLessons: string[];
  totalReflections: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiveMessage {
  id: string;
  sessionId: string;
  userId: string;
  lessonId: string;
  text: string;
  role: 'user' | 'guide'; // 'guide' = Somatic Guide AI
  createdAt: Date;

  // Voice message fields (reuse existing patterns)
  hasAudio?: boolean;
  audioPath?: string;
  audioDuration?: number;
  transcriptionStatus?: 'uploading' | 'pending' | 'completed' | 'failed';

  metadata?: {
    model?: string;
    responseTime?: number;
    isLessonComplete?: boolean; // AI marked lesson complete
    transcriptionConfidence?: number;
    language?: string;
  };
}

// ============================================
// Lighthouse (CBT-Based Anxiety Processing)
// ============================================

// Cognitive distortions recognized in CBT
export type CognitiveDistortion =
  | 'catastrophizing' // Imagining the worst possible outcome
  | 'mind_reading' // Assuming you know what others think
  | 'fortune_telling' // Predicting negative futures without evidence
  | 'all_or_nothing' // Black-and-white thinking
  | 'emotional_reasoning' // "I feel it, so it must be true"
  | 'should_statements' // Rigid rules about how things "should" be
  | 'labeling' // Attaching negative labels to self or others
  | 'personalization' // Taking excessive responsibility for external events
  | 'filtering' // Focusing only on negative aspects
  | 'overgeneralization'; // Drawing broad conclusions from single events

// Emotion types for anxiety tracking
export type EmotionType =
  // Anxiety spectrum
  | 'anxious'
  | 'worried'
  | 'panicked'
  | 'nervous'
  | 'restless'
  // Sadness spectrum
  | 'sad'
  | 'hopeless'
  | 'lonely'
  | 'empty'
  // Anger spectrum
  | 'angry'
  | 'frustrated'
  | 'irritated'
  // Shame spectrum
  | 'ashamed'
  | 'guilty'
  | 'embarrassed'
  // Overwhelm spectrum
  | 'overwhelmed'
  | 'stressed'
  | 'exhausted'
  | 'numb';

// Distortion detected by AI with confidence and explanation
export interface DetectedDistortion {
  type: CognitiveDistortion;
  confidence: number; // 0-1 AI confidence
  explanation: string; // Why AI detected this distortion
  highlightedText?: string; // The part of user's text that triggered detection
}

// Core Illuminate entry - structured CBT thought record
export interface IlluminateEntry {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Step 1: The Situation
  situation: string; // What happened - the triggering event

  // Step 2: The Thoughts
  automaticThoughts: string; // Free text of automatic thoughts

  // Step 3: The Feelings
  primaryEmotions: EmotionType[]; // Selected emotion tags

  // Step 4: The Intensity
  emotionalIntensity: number; // 0-100 slider (renamed from anxietyIntensity)

  // Step 5: The Pattern (AI Distortion Detection)
  aiDetectedDistortions: DetectedDistortion[];
  userConfirmedDistortions: CognitiveDistortion[]; // User agreed these apply
  userDismissedDistortions: CognitiveDistortion[]; // User said these don't apply

  // Step 6: The Reframe
  aiSuggestedReframes: string[]; // AI-generated alternative perspectives
  selectedReframe: string; // User's chosen or written reframe
  customReframe: boolean; // True if user wrote their own
  reframeHelpfulness?: number; // 1-5 optional rating

  // Meta
  entryDurationSeconds: number; // How long to complete
  completedAllSteps: boolean; // Did user finish all 6 steps
}

// ============================================
// Horizon (Progress Dashboard)
// ============================================

// Anxiety assessment (simplified GAD-7 inspired)
export type AnxietySeverity = 'minimal' | 'mild' | 'moderate' | 'severe';

export interface AssessmentResponse {
  questionKey: string; // i18n key for the question
  score: number; // 0-3 (Not at all / Several days / More than half / Nearly every day)
}

export interface AnxietyAssessment {
  id: string;
  userId: string;
  createdAt: Date;
  responses: AssessmentResponse[];
  totalScore: number; // Sum of response scores
  severity: AnxietySeverity;
}

// Weekly insight generated by AI
export interface WeeklyInsight {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday of the week)
  createdAt: Date;

  // Aggregated data
  entryCount: number;
  averageAnxietyIntensity: number;
  mostCommonDistortions: {
    type: CognitiveDistortion;
    count: number;
    percentage: number;
  }[];
  mostCommonEmotions: {
    type: EmotionType;
    count: number;
  }[];
  identifiedTriggers: string[]; // AI-extracted common themes/triggers

  // AI-generated insight
  insightText: string; // Personalized insight message
  recommendations: string[]; // Actionable suggestions

  // User interaction
  viewed: boolean;
  viewedAt?: Date;
  helpfulnessRating?: number; // 1-5
}

// ============================================
// Achievement System
// ============================================

export type AchievementCategory =
  | 'chat' // Deep Talk conversations
  | 'dive' // The Dive lessons
  | 'lighthouse' // Illuminate reflections
  | 'tidelog' // Tide Log entries
  | 'streak' // Consistency
  | 'milestone'; // Special moments

export type AchievementRequirementType = 'count' | 'streak' | 'milestone';

export interface AchievementRequirement {
  type: AchievementRequirementType;
  target: number;
  metric: string; // e.g., 'conversations', 'dive_lessons', etc.
}

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  iconName: string; // Lucide icon name
  requirement: AchievementRequirement;
  order: number; // Display order within category
}

export interface AchievementStats {
  conversations: number;
  dive_lessons: number;
  illuminate_entries: number;
  daily_logs: number;
  released_logs: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string; // YYYY-MM-DD
}

export interface AchievementSummary {
  userId: string;
  unlockedAchievements: string[];
  achievementDates: Record<string, Date>;
  stats: AchievementStats;
  createdAt: Date;
  updatedAt: Date;
}

// Computed achievement with unlock state and progress
export interface Achievement extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100 percentage toward unlock
}

// ============================================
// User Story (Progressive Profile Learning)
// ============================================

// Confidence levels for extracted information
export type StoryFieldConfidence = 'explicit' | 'inferred' | 'mentioned';

// How the information was obtained
export type StoryFieldSource = 'conversation' | 'user_edit';

// Base interface for a single field value
export interface StoryFieldValue<T = string> {
  value: T;
  confidence: StoryFieldConfidence;
  source: StoryFieldSource;
  learnedAt: Date;
  lastConfirmed?: Date;
}

// Extended interface for fields that can change over time (e.g., relationship status)
export interface StoryFieldWithHistory<T = string> extends StoryFieldValue<T> {
  history?: Array<{
    value: T;
    changedAt: Date;
    source: StoryFieldSource;
  }>;
}

// Location structure
export interface StoryLocationValue {
  city?: string;
  country?: string;
  timezone?: string;
}

// Occupation structure
export interface StoryOccupationValue {
  type: 'work' | 'student' | 'between' | 'other';
  details?: string;
}

// Pets structure
export interface StoryPetsValue {
  has: boolean;
  details?: string;
}

/**
 * Main UserStory interface
 * Organized by priority tiers (1 = learn first, 6 = opportunistic)
 */
export interface UserStory {
  userId: string;
  schemaVersion: '1.0';
  createdAt: Date;
  updatedAt: Date;
  lastExtractionAt?: Date;

  // Tier 1: Core Identity (Priority - learn early)
  coreIdentity: {
    name?: StoryFieldValue<string>;
    nickname?: StoryFieldValue<string>;
    age?: StoryFieldValue<number>;
    birthdate?: StoryFieldValue<string>;
    pronouns?: StoryFieldValue<string>;
    location?: StoryFieldValue<StoryLocationValue>;
  };

  // Tier 2: Life Situation (High value for context)
  lifeSituation: {
    occupation?: StoryFieldWithHistory<StoryOccupationValue>;
    livingArrangement?: StoryFieldValue<string>;
    dailySchedule?: StoryFieldValue<string>;
    currentLifePhase?: StoryFieldValue<string>;
  };

  // Tier 3: Relationships (Context for support system)
  relationships: {
    romanticStatus?: StoryFieldWithHistory<string>;
    partnerName?: StoryFieldValue<string>;
    hasPets?: StoryFieldValue<StoryPetsValue>;
    closeFriends?: StoryFieldValue<string>;
    familyContext?: StoryFieldValue<string>;
    supportSystem?: StoryFieldValue<string>;
  };

  // Tier 4: Background & Origin (Deeper context)
  background: {
    culturalBackground?: StoryFieldValue<string>;
    upbringing?: StoryFieldValue<string>;
    significantLifeEvents?: StoryFieldValue<string[]>;
    educationLevel?: StoryFieldValue<string>;
    hometown?: StoryFieldValue<string>;
  };

  // Tier 5: Personal Interests & Coping (Therapeutic value)
  personal: {
    interests?: StoryFieldValue<string[]>;
    hobbies?: StoryFieldValue<string[]>;
    copingActivities?: StoryFieldValue<string[]>;
    avoidances?: StoryFieldValue<string[]>;
    favorites?: StoryFieldValue<Record<string, string>>;
  };

  // Tier 6: Therapeutic Context (Sensitive, high value)
  therapeuticContext: {
    knownTriggers?: StoryFieldValue<string[]>;
    anxietyManifestations?: StoryFieldValue<string[]>;
    pastTherapyExperience?: StoryFieldValue<boolean>;
    currentProfessionalSupport?: StoryFieldValue<boolean>;
    medicationContext?: StoryFieldValue<string>;
    significantAnxietyHistory?: StoryFieldValue<string>;
  };

  // Metadata for extraction system
  extractionMeta: {
    questionsAskedCount: number;
    lastQuestionTopic?: string;
    lastQuestionAt?: Date;
    topicsDiscovered: string[];
    topicsToExplore: string[];
    fieldsDeletedByUser: string[];
  };
}

// Field metadata for UI display
export interface StoryFieldMetadata {
  path: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  sensitivity: 'basic' | 'personal' | 'sensitive' | 'intimate';
  hasHistory: boolean;
}

// Helper type for extracting field value type
export type ExtractFieldType<T> =
  T extends StoryFieldValue<infer U> ? U : T extends StoryFieldWithHistory<infer U> ? U : never;
