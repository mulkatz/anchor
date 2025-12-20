/**
 * Data Gathering Utilities for Psychological Profile Generation
 *
 * Collects and formats all user data from Firestore for profile analysis.
 */

import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  WeeklyData,
  ConversationData,
  IlluminateEntryData,
  DailyLogData,
  DiveSessionData,
  JournalSessionData,
  WeeklyInsightData,
  ConversationProfileData,
  AssessmentData,
  CognitiveDistortion,
  EmotionType,
  WeatherType,
  AnxietySeverity,
} from './types';

/**
 * Gather all user data for profile generation
 * For initial profile: gathers all available data
 * For updates: gathers data from the last 7 days + historical context
 */
export async function gatherAllUserData(
  userId: string,
  isInitialProfile: boolean = false
): Promise<WeeklyData> {
  const db = admin.firestore();

  // For initial profile, get all data; for updates, get last 7 days
  const cutoffDate = isInitialProfile
    ? new Date(0) // All time
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

  const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

  // Run all queries in parallel for efficiency
  const [
    conversationsData,
    illuminateData,
    dailyLogsData,
    diveSessionsData,
    journalData,
    insightData,
    profileData,
    assessmentsData,
  ] = await Promise.all([
    gatherConversations(db, userId, cutoffTimestamp, isInitialProfile),
    gatherIlluminateEntries(db, userId, cutoffTimestamp),
    gatherDailyLogs(db, userId, cutoffTimestamp),
    gatherDiveSessions(db, userId, cutoffTimestamp),
    gatherJournalEntries(db, userId, cutoffTimestamp),
    gatherWeeklyInsight(db, userId),
    gatherConversationProfile(db, userId),
    gatherAssessments(db, userId, cutoffTimestamp),
  ]);

  return {
    conversations: conversationsData,
    illuminateEntries: illuminateData,
    dailyLogs: dailyLogsData,
    diveSessions: diveSessionsData,
    journalSessions: journalData,
    weeklyInsight: insightData,
    conversationProfile: profileData,
    assessments: assessmentsData,
  };
}

/**
 * Gather conversation data with user messages
 */
async function gatherConversations(
  db: FirebaseFirestore.Firestore,
  userId: string,
  cutoffTimestamp: Timestamp,
  isInitialProfile: boolean
): Promise<ConversationData[]> {
  // Get conversations updated after cutoff
  const conversationsQuery = isInitialProfile
    ? db.collection(`users/${userId}/conversations`).orderBy('updatedAt', 'desc').limit(20)
    : db
        .collection(`users/${userId}/conversations`)
        .where('updatedAt', '>=', cutoffTimestamp)
        .orderBy('updatedAt', 'desc');

  const conversationsSnap = await conversationsQuery.get();

  const conversations: ConversationData[] = await Promise.all(
    conversationsSnap.docs.map(async (convDoc) => {
      const convData = convDoc.data();

      // Get user messages from this conversation
      const messagesQuery = isInitialProfile
        ? db
            .collection(`users/${userId}/conversations/${convDoc.id}/messages`)
            .where('role', '==', 'user')
            .orderBy('createdAt', 'desc')
            .limit(30) // Last 30 messages per conversation for initial
        : db
            .collection(`users/${userId}/conversations/${convDoc.id}/messages`)
            .where('role', '==', 'user')
            .where('createdAt', '>=', cutoffTimestamp)
            .orderBy('createdAt', 'desc');

      const messagesSnap = await messagesQuery.get();

      return {
        id: convDoc.id,
        messageCount: convData.messageCount || 0,
        userMessages: messagesSnap.docs.map((m) => ({
          text: m.data().text || '',
          timestamp: m.data().createdAt || Timestamp.now(),
        })),
        hasCrisisMessages: convData.metadata?.hasCrisisMessages || false,
      };
    })
  );

  return conversations;
}

/**
 * Gather Illuminate (CBT thought record) entries
 */
async function gatherIlluminateEntries(
  db: FirebaseFirestore.Firestore,
  userId: string,
  cutoffTimestamp: Timestamp
): Promise<IlluminateEntryData[]> {
  const entriesSnap = await db
    .collection(`users/${userId}/illuminate_entries`)
    .where('createdAt', '>=', cutoffTimestamp)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  return entriesSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      situation: data.situation || '',
      automaticThoughts: data.automaticThoughts || '',
      emotionalIntensity: data.emotionalIntensity ?? data.anxietyIntensity ?? 50,
      primaryEmotions: (data.primaryEmotions || []) as EmotionType[],
      userConfirmedDistortions: (data.userConfirmedDistortions || []) as CognitiveDistortion[],
      selectedReframe: data.selectedReframe || '',
      createdAt: data.createdAt || Timestamp.now(),
    };
  });
}

/**
 * Gather daily mood logs (Tide Log)
 */
async function gatherDailyLogs(
  db: FirebaseFirestore.Firestore,
  userId: string,
  cutoffTimestamp: Timestamp
): Promise<DailyLogData[]> {
  const logsSnap = await db
    .collection(`users/${userId}/daily_logs`)
    .where('createdAt', '>=', cutoffTimestamp)
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get();

  return logsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      date: data.date || '',
      moodDepth: data.mood_depth ?? 50,
      weather: (data.weather || 'clear') as WeatherType,
      noteText: data.note_text || '',
    };
  });
}

/**
 * Gather completed Dive (somatic learning) sessions
 */
async function gatherDiveSessions(
  db: FirebaseFirestore.Firestore,
  userId: string,
  cutoffTimestamp: Timestamp
): Promise<DiveSessionData[]> {
  // Get dive progress to find completed lessons
  const progressSnap = await db.doc(`users/${userId}/dive_progress/summary`).get();

  if (!progressSnap.exists) {
    return [];
  }

  // Get dive sessions to count messages
  const sessionsSnap = await db
    .collection(`users/${userId}/dive_sessions`)
    .where('createdAt', '>=', cutoffTimestamp)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  return sessionsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      lessonId: data.lessonId || '',
      completedAt: data.completedAt || data.createdAt || Timestamp.now(),
      messageCount: data.messageCount || 0,
    };
  });
}

/**
 * Gather journal entries (Depths)
 */
async function gatherJournalEntries(
  db: FirebaseFirestore.Firestore,
  userId: string,
  cutoffTimestamp: Timestamp
): Promise<JournalSessionData[]> {
  const journalSnap = await db
    .collection(`users/${userId}/journal_entries`)
    .where('updatedAt', '>=', cutoffTimestamp)
    .orderBy('updatedAt', 'desc')
    .limit(20)
    .get();

  const sessions: JournalSessionData[] = [];

  journalSnap.docs.forEach((doc) => {
    const data = doc.data();
    const docSessions = data.sessions || [];

    docSessions.forEach((session: { text?: string; wordCount?: number }) => {
      if (session.text) {
        sessions.push({
          date: data.date || '',
          text: session.text,
          wordCount: session.wordCount || 0,
        });
      }
    });
  });

  return sessions;
}

/**
 * Gather most recent weekly insight
 */
async function gatherWeeklyInsight(
  db: FirebaseFirestore.Firestore,
  userId: string
): Promise<WeeklyInsightData | null> {
  const insightSnap = await db
    .collection(`users/${userId}/weekly_insights`)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (insightSnap.empty) {
    return null;
  }

  const data = insightSnap.docs[0].data();
  return {
    insightText: data.insightText || '',
    recommendations: data.recommendations || [],
    identifiedTriggers: data.identifiedTriggers || [],
  };
}

/**
 * Gather conversation profile (communication style)
 */
async function gatherConversationProfile(
  db: FirebaseFirestore.Firestore,
  userId: string
): Promise<ConversationProfileData | null> {
  const profileSnap = await db.doc(`users/${userId}/profile/conversationProfile`).get();

  if (!profileSnap.exists) {
    return null;
  }

  const data = profileSnap.data();
  return {
    styleDescription: data?.styleDescription || '',
    mirroringIntensity: data?.mirroringIntensity || 3,
  };
}

/**
 * Gather anxiety assessments
 */
async function gatherAssessments(
  db: FirebaseFirestore.Firestore,
  userId: string,
  cutoffTimestamp: Timestamp
): Promise<AssessmentData[]> {
  const assessmentsSnap = await db
    .collection(`users/${userId}/anxiety_assessments`)
    .where('createdAt', '>=', cutoffTimestamp)
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  return assessmentsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      totalScore: data.totalScore || 0,
      severity: (data.severity || 'mild') as AnxietySeverity,
      createdAt: data.createdAt || Timestamp.now(),
    };
  });
}

/**
 * Format weekly data into a readable string for AI context
 */
export function formatWeeklyDataForAI(data: WeeklyData): string {
  const sections: string[] = [];

  // Conversations
  if (data.conversations.length > 0) {
    const totalMessages = data.conversations.reduce((sum, c) => sum + c.userMessages.length, 0);
    const crisisCount = data.conversations.filter((c) => c.hasCrisisMessages).length;

    sections.push(`=== CONVERSATIONS (${data.conversations.length} active) ===
Total user messages: ${totalMessages}
Conversations with crisis indicators: ${crisisCount}

Sample user messages (most recent):
${data.conversations
  .flatMap((c) =>
    c.userMessages.slice(0, 5).map((m) => {
      const date = m.timestamp.toDate().toISOString().split('T')[0];
      return `[${date}] "${m.text.slice(0, 300)}${m.text.length > 300 ? '...' : ''}"`;
    })
  )
  .slice(0, 15)
  .join('\n')}`);
  }

  // Illuminate entries
  if (data.illuminateEntries.length > 0) {
    const avgIntensity =
      data.illuminateEntries.reduce((sum, e) => sum + e.emotionalIntensity, 0) /
      data.illuminateEntries.length;

    const distortionCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};

    data.illuminateEntries.forEach((e) => {
      e.userConfirmedDistortions.forEach((d) => {
        distortionCounts[d] = (distortionCounts[d] || 0) + 1;
      });
      e.primaryEmotions.forEach((em) => {
        emotionCounts[em] = (emotionCounts[em] || 0) + 1;
      });
    });

    const topDistortions = Object.entries(distortionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([d, count]) => `${d}: ${count}`)
      .join(', ');

    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([e, count]) => `${e}: ${count}`)
      .join(', ');

    sections.push(`=== ILLUMINATE ENTRIES (${data.illuminateEntries.length} CBT thought records) ===
Average emotional intensity: ${avgIntensity.toFixed(1)}/100
Confirmed distortions: ${topDistortions || 'None confirmed'}
Frequent emotions: ${topEmotions || 'Not recorded'}

Detailed entries:
${data.illuminateEntries
  .slice(0, 8)
  .map((e) => {
    const date = e.createdAt.toDate().toISOString().split('T')[0];
    return `[${date}] Situation: "${e.situation.slice(0, 150)}"
  Thoughts: "${e.automaticThoughts.slice(0, 150)}"
  Intensity: ${e.emotionalIntensity}/100
  Distortions: ${e.userConfirmedDistortions.join(', ') || 'None confirmed'}
  Reframe: "${e.selectedReframe.slice(0, 100) || 'None selected'}"`;
  })
  .join('\n\n')}`);
  }

  // Daily logs
  if (data.dailyLogs.length > 0) {
    const avgMoodDepth =
      data.dailyLogs.reduce((sum, l) => sum + l.moodDepth, 0) / data.dailyLogs.length;

    const weatherCounts: Record<string, number> = {};
    data.dailyLogs.forEach((l) => {
      weatherCounts[l.weather] = (weatherCounts[l.weather] || 0) + 1;
    });

    sections.push(`=== DAILY MOOD LOGS (${data.dailyLogs.length} entries) ===
Average mood depth: ${avgMoodDepth.toFixed(1)}/100 (0=Deep/Calm, 100=Surface/Anxious)
Weather patterns: ${Object.entries(weatherCounts)
      .map(([w, c]) => `${w}: ${c}`)
      .join(', ')}

Daily log notes:
${data.dailyLogs
  .filter((l) => l.noteText)
  .slice(0, 7)
  .map(
    (l) =>
      `[${l.date}] (Depth: ${l.moodDepth}, Weather: ${l.weather}) "${l.noteText.slice(0, 200)}"`
  )
  .join('\n')}`);
  }

  // Dive sessions
  if (data.diveSessions.length > 0) {
    sections.push(`=== DIVE SESSIONS (Somatic Learning) ===
Completed lessons: ${data.diveSessions.map((s) => s.lessonId).join(', ')}
Total reflection messages: ${data.diveSessions.reduce((sum, s) => sum + s.messageCount, 0)}`);
  }

  // Journal entries
  if (data.journalSessions.length > 0) {
    const totalWords = data.journalSessions.reduce((sum, s) => sum + s.wordCount, 0);

    sections.push(`=== JOURNAL ENTRIES (Depths) ===
Sessions: ${data.journalSessions.length}
Total words written: ${totalWords}

Journal excerpts:
${data.journalSessions
  .slice(0, 5)
  .map((s) => `[${s.date}] "${s.text.slice(0, 250)}${s.text.length > 250 ? '...' : ''}"`)
  .join('\n')}`);
  }

  // Assessments
  if (data.assessments.length > 0) {
    sections.push(`=== ANXIETY ASSESSMENTS ===
${data.assessments
  .map((a) => {
    const date = a.createdAt.toDate().toISOString().split('T')[0];
    return `[${date}] Score: ${a.totalScore}, Severity: ${a.severity}`;
  })
  .join('\n')}`);
  }

  // Conversation profile
  if (data.conversationProfile) {
    sections.push(`=== COMMUNICATION STYLE (AI-analyzed) ===
${data.conversationProfile.styleDescription}
Mirroring intensity: ${data.conversationProfile.mirroringIntensity}/5`);
  }

  // Weekly insight
  if (data.weeklyInsight) {
    sections.push(`=== PREVIOUS WEEKLY INSIGHT ===
${data.weeklyInsight.insightText}

Recommendations: ${data.weeklyInsight.recommendations.join('; ')}
Identified triggers: ${data.weeklyInsight.identifiedTriggers.join(', ')}`);
  }

  // Handle case of no data
  if (sections.length === 0) {
    return 'NO DATA AVAILABLE - This appears to be a new user with no recorded interactions.';
  }

  return sections.join('\n\n');
}

/**
 * Count total data points for determining if profile can be created
 */
export function countDataPoints(data: WeeklyData): number {
  let count = 0;

  count += data.conversations.reduce((sum, c) => sum + c.userMessages.length, 0);
  count += data.illuminateEntries.length * 3; // Weighted - rich data
  count += data.dailyLogs.length;
  count += data.diveSessions.length * 2;
  count += data.journalSessions.length * 2;
  count += data.assessments.length * 2;

  return count;
}
