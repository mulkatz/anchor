/**
 * UserStory Types
 * Data model for progressive user profiling through natural conversation
 */

// Confidence levels for extracted information
export type StoryFieldConfidence = 'explicit' | 'inferred' | 'mentioned';

// How the information was obtained
export type StoryFieldSource = 'conversation' | 'user_edit';

// Base interface for a single field value
export interface StoryFieldValue<T = string> {
  value: T;
  confidence: StoryFieldConfidence;
  source: StoryFieldSource;
  learnedAt: Date | FirebaseFirestore.Timestamp;
  lastConfirmed?: Date | FirebaseFirestore.Timestamp;
}

// Extended interface for fields that can change over time (e.g., relationship status)
export interface StoryFieldWithHistory<T = string> extends StoryFieldValue<T> {
  history?: Array<{
    value: T;
    changedAt: Date | FirebaseFirestore.Timestamp;
    source: StoryFieldSource;
  }>;
}

// Location structure
export interface LocationValue {
  city?: string;
  country?: string;
  timezone?: string;
}

// Occupation structure
export interface OccupationValue {
  type: 'work' | 'student' | 'between' | 'other';
  details?: string;
}

// Pets structure
export interface PetsValue {
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
  createdAt: Date | FirebaseFirestore.Timestamp;
  updatedAt: Date | FirebaseFirestore.Timestamp;
  lastExtractionAt?: Date | FirebaseFirestore.Timestamp;

  // Tier 1: Core Identity (Priority - learn early)
  coreIdentity: {
    name?: StoryFieldValue<string>;
    nickname?: StoryFieldValue<string>;
    age?: StoryFieldValue<number>;
    birthdate?: StoryFieldValue<string>; // YYYY-MM-DD or partial like "March" or "1998"
    pronouns?: StoryFieldValue<string>;
    location?: StoryFieldValue<LocationValue>;
  };

  // Tier 2: Life Situation (High value for context)
  lifeSituation: {
    occupation?: StoryFieldWithHistory<OccupationValue>;
    livingArrangement?: StoryFieldValue<string>; // "alone", "with roommates", "with family", etc.
    dailySchedule?: StoryFieldValue<string>; // "9-5 office", "shift work", "student schedule", etc.
    currentLifePhase?: StoryFieldValue<string>; // "in college", "new job", "career change", etc.
  };

  // Tier 3: Relationships (Context for support system)
  relationships: {
    romanticStatus?: StoryFieldWithHistory<string>; // "single", "in a relationship", "married", etc.
    partnerName?: StoryFieldValue<string>;
    hasPets?: StoryFieldValue<PetsValue>;
    closeFriends?: StoryFieldValue<string>; // General description of friend situation
    familyContext?: StoryFieldValue<string>; // Brief family situation
    supportSystem?: StoryFieldValue<string>; // Who they turn to for support
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
    copingActivities?: StoryFieldValue<string[]>; // What helps them when anxious
    avoidances?: StoryFieldValue<string[]>; // What they avoid when anxious
    favorites?: StoryFieldValue<Record<string, string>>; // favorite_music, favorite_show, etc.
  };

  // Tier 6: Therapeutic Context (Sensitive, high value)
  therapeuticContext: {
    knownTriggers?: StoryFieldValue<string[]>;
    anxietyManifestations?: StoryFieldValue<string[]>; // How anxiety shows up physically/mentally
    anxietyType?: StoryFieldValue<string>; // "social", "generalized", "panic", "health", etc.
    bodyExperience?: StoryFieldValue<string>; // "chest tightness", "racing thoughts", etc.
    whatDoesntWork?: StoryFieldValue<string[]>; // Things they've tried that don't help
    pastTherapyExperience?: StoryFieldValue<boolean>;
    currentProfessionalSupport?: StoryFieldValue<boolean>;
    therapyFocus?: StoryFieldValue<string>; // What they're working on in therapy
    medicationContext?: StoryFieldValue<string>; // Only if user shares
    significantAnxietyHistory?: StoryFieldValue<string>;
  };

  // Tier 7: Strengths & Protective Factors (Therapeutic resources)
  strengths: {
    whatGivesHope?: StoryFieldValue<string[]>; // Sources of hope/meaning
    proudMoments?: StoryFieldValue<string[]>; // Things they're proud of
    pastWins?: StoryFieldValue<string[]>; // Challenges they've overcome
    motivators?: StoryFieldValue<string[]>; // What drives them
    positiveRelationships?: StoryFieldValue<string[]>; // People who lift them up
    coreValues?: StoryFieldValue<string[]>; // What matters most to them
  };

  // Metadata for extraction system
  extractionMeta: {
    questionsAskedCount: number;
    lastQuestionTopic?: string;
    lastQuestionAt?: Date | FirebaseFirestore.Timestamp;
    topicsDiscovered: string[]; // Fields that have been filled
    topicsToExplore: string[]; // Queue of natural follow-ups
    fieldsDeletedByUser: string[]; // Fields user asked to forget (prevent re-extraction)
  };
}

/**
 * Extraction result from AI analysis
 */
export interface StoryExtraction {
  field: string; // Dot notation path like "coreIdentity.name"
  value: unknown;
  confidence: StoryFieldConfidence;
  evidence: string; // Quote or explanation of how we learned this
}

/**
 * Topic extraction for mid-term memory
 */
export type TopicCategory =
  | 'work'
  | 'relationships'
  | 'health'
  | 'anxiety'
  | 'life-event'
  | 'other';
export type TopicStatus = 'active' | 'resolved' | 'fading';
export type TopicValence = 'positive' | 'negative' | 'neutral';
export type ResolutionOutcome = 'success' | 'neutral' | 'difficult' | undefined;

export interface TopicExtraction {
  type: 'topic';
  topic: string; // "job interview anxiety"
  context: string; // "Interview at Google on Friday"
  category: TopicCategory;
  status: TopicStatus;
  valence?: TopicValence; // Is this positive/negative for them emotionally?
  resolutionOutcome?: ResolutionOutcome; // If resolved, how did it go?
}

export interface ExtractionResult {
  extractions: StoryExtraction[];
  topicExtractions: TopicExtraction[]; // NEW: Topics/problems mentioned
  suggestedFollowUps: string[]; // Natural next things to learn
  detectedForgetRequest?: {
    topic: string;
    fullRequest: string;
  };
}

// ============================================
// Mid-Term Memory (Temporal Topic Tracking)
// ============================================

/**
 * A recent topic or problem the user is dealing with
 */
export interface RecentTopic {
  id: string;
  topic: string; // "job interview anxiety"
  context: string; // "has an interview at Google on Friday"
  category: TopicCategory;

  // Temporal tracking
  firstMentionedAt: Date | FirebaseFirestore.Timestamp;
  lastMentionedAt: Date | FirebaseFirestore.Timestamp;
  mentionCount: number;

  // Status
  status: TopicStatus;

  // Emotional context - helps AI know how to bring it up
  valence?: TopicValence; // positive/negative/neutral

  // Resolution tracking - for celebrating wins
  resolutionOutcome?: ResolutionOutcome; // How did it go? (only for resolved topics)
  resolvedAt?: Date | FirebaseFirestore.Timestamp;

  // Pattern detection - flag recurring themes
  isRecurring?: boolean; // true if mentionCount >= 3

  // Optional: linked to user story fields
  relatedFields?: string[]; // ['therapeuticContext.knownTriggers']
}

/**
 * Mid-Term Memory document
 * Stores recent topics/problems with temporal relevance
 * Path: users/{userId}/profile/midTermMemory
 */
export interface MidTermMemory {
  userId: string;
  createdAt: Date | FirebaseFirestore.Timestamp;
  updatedAt: Date | FirebaseFirestore.Timestamp;

  // Recent topics/problems - max ~20, older ones pruned
  recentTopics: RecentTopic[];

  // Check-in tracking to avoid repetition
  lastCheckIn?: {
    topicId: string;
    at: Date | FirebaseFirestore.Timestamp;
  };
}

/**
 * Default empty story for new users
 */
export const createEmptyUserStory = (userId: string): UserStory => ({
  userId,
  schemaVersion: '1.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  coreIdentity: {},
  lifeSituation: {},
  relationships: {},
  background: {},
  personal: {},
  therapeuticContext: {},
  strengths: {},
  extractionMeta: {
    questionsAskedCount: 0,
    topicsDiscovered: [],
    topicsToExplore: [],
    fieldsDeletedByUser: [],
  },
});

/**
 * Field metadata for UI and extraction guidance
 */
export interface FieldMetadata {
  path: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  sensitivity: 'basic' | 'personal' | 'sensitive' | 'intimate';
  hasHistory: boolean;
  exampleQuestions: {
    en: string[];
    de: string[];
  };
}

export const FIELD_METADATA: Record<string, FieldMetadata> = {
  'coreIdentity.name': {
    path: 'coreIdentity.name',
    tier: 1,
    sensitivity: 'basic',
    hasHistory: false,
    exampleQuestions: {
      en: ['btw what should I call you?', "I don't think I know your name actually"],
      de: ['btw wie soll ich dich nennen?', 'ich glaub ich kenn deinen namen gar nicht'],
    },
  },
  'coreIdentity.age': {
    path: 'coreIdentity.age',
    tier: 1,
    sensitivity: 'basic',
    hasHistory: false,
    exampleQuestions: {
      en: ['how old are you btw?', 'wait are you in school or working?'],
      de: ['wie alt bist du eigentlich?', 'warte bist du noch in der schule oder arbeitest du?'],
    },
  },
  'lifeSituation.occupation': {
    path: 'lifeSituation.occupation',
    tier: 2,
    sensitivity: 'basic',
    hasHistory: true,
    exampleQuestions: {
      en: ['what kinda work do you do?', 'are you a student or working?'],
      de: ['was arbeitest du so?', 'studierst du oder arbeitest du?'],
    },
  },
  'relationships.romanticStatus': {
    path: 'relationships.romanticStatus',
    tier: 3,
    sensitivity: 'personal',
    hasHistory: true,
    exampleQuestions: {
      en: ['is that your partner?', 'are you seeing someone?'],
      de: ['ist das dein partner?', 'bist du mit jemandem zusammen?'],
    },
  },
  'relationships.hasPets': {
    path: 'relationships.hasPets',
    tier: 3,
    sensitivity: 'basic',
    hasHistory: false,
    exampleQuestions: {
      en: ['do you have any pets?', 'wait you have a dog?'],
      de: ['hast du haustiere?', 'warte du hast einen hund?'],
    },
  },
  'therapeuticContext.knownTriggers': {
    path: 'therapeuticContext.knownTriggers',
    tier: 6,
    sensitivity: 'intimate',
    hasHistory: false,
    exampleQuestions: {
      en: [], // Never proactively ask about triggers
      de: [],
    },
  },
  'therapeuticContext.pastTherapyExperience': {
    path: 'therapeuticContext.pastTherapyExperience',
    tier: 6,
    sensitivity: 'sensitive',
    hasHistory: false,
    exampleQuestions: {
      en: [], // Only acknowledge if shared
      de: [],
    },
  },
};
