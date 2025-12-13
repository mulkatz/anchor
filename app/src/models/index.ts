/**
 * TypeScript type definitions and interfaces
 * Export all your models from this file
 */

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  transcriptionStatus?: 'pending' | 'completed' | 'failed';

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

export interface Feedback {
  userId: string;
  kind: 'idea' | 'bug';
  text: string;
  timestamp: Date;
  platform: string; // 'ios' | 'android' | 'web'
  appVersion: string;
  resolved: boolean; // Admin field
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
export type DiveZone = 'The Shallows' | 'The Twilight Zone' | 'The Midnight Zone' | 'The Trench';

export type DiveLessonStatus = 'locked' | 'in-progress' | 'completed';

export interface DiveReflection {
  id: string;
  text: string;
  createdAt: Date;
  isVoice?: boolean; // If transcribed from voice
}

export interface DiveLessonProgress {
  lessonId: string;
  status: DiveLessonStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  reflections: DiveReflection[];
}

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

export interface DiveSession {
  id: string;
  lessonId: string;
  userId: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  messageCount: number;
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
  transcriptionStatus?: 'pending' | 'completed' | 'failed';

  metadata?: {
    model?: string;
    responseTime?: number;
    isLessonComplete?: boolean; // AI marked lesson complete
    transcriptionConfidence?: number;
    language?: string;
  };
}
