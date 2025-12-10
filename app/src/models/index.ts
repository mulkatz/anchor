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

// Add more models as needed
