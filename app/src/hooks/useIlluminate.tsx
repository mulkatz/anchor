import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  where,
  getDocs,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import i18next from 'i18next';

import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import type {
  IlluminateEntry,
  DetectedDistortion,
  CognitiveDistortion,
  EmotionType,
} from '../models';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';

// Input data for creating a new entry (before AI processing)
export interface IlluminateEntryInput {
  situation: string;
  automaticThoughts: string;
  primaryEmotions: EmotionType[];
  emotionalIntensity: number;
}

// Data after AI processing (step 3)
export interface IlluminateAIData {
  aiDetectedDistortions: DetectedDistortion[];
  aiSuggestedReframes: string[];
}

// Final data for completing entry (step 4)
export interface IlluminateCompletionData {
  userConfirmedDistortions: CognitiveDistortion[];
  userDismissedDistortions: CognitiveDistortion[];
  selectedReframe: string;
  customReframe: boolean;
  reframeHelpfulness?: number;
  entryDurationSeconds: number;
}

export interface UseIlluminateReturn {
  entries: IlluminateEntry[];
  recentEntries: IlluminateEntry[]; // Last 7 days
  loading: boolean;
  error: string | null;

  // CRUD operations
  createEntry: (
    input: IlluminateEntryInput,
    aiData: IlluminateAIData,
    completion: IlluminateCompletionData
  ) => Promise<string>;
  updateEntry: (id: string, data: Partial<IlluminateEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  // Analytics helpers
  getAverageIntensity: (days?: number) => number;
  getDistortionCounts: () => Record<CognitiveDistortion, number>;
  getEmotionCounts: () => Record<EmotionType, number>;
}

/**
 * Hook for managing Illuminate entries (CBT thought records - Lighthouse feature)
 * Provides real-time Firestore sync and CRUD operations
 */
export const useIlluminate = (): UseIlluminateReturn => {
  const { userId, isAuthLoading } = useApp();
  const [entries, setEntries] = useState<IlluminateEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Set up real-time listener for illuminate entries
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    const entriesRef = collection(firestore, `users/${userId}/illuminate_entries`);
    const q = query(
      entriesRef,
      orderBy('createdAt', 'desc'),
      limit(100) // Last 100 entries for analytics
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entriesData = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            situation: data.situation,
            automaticThoughts: data.automaticThoughts,
            primaryEmotions: data.primaryEmotions || [],
            // Backwards compatibility: read emotionalIntensity or legacy anxietyIntensity
            emotionalIntensity: data.emotionalIntensity ?? data.anxietyIntensity ?? 50,
            aiDetectedDistortions: data.aiDetectedDistortions || [],
            userConfirmedDistortions: data.userConfirmedDistortions || [],
            userDismissedDistortions: data.userDismissedDistortions || [],
            aiSuggestedReframes: data.aiSuggestedReframes || [],
            selectedReframe: data.selectedReframe,
            customReframe: data.customReframe || false,
            reframeHelpfulness: data.reframeHelpfulness,
            entryDurationSeconds: data.entryDurationSeconds || 0,
            completedAllSteps: data.completedAllSteps || false,
          } as IlluminateEntry;
        });

        setEntries(entriesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching illuminate entries:', err);
        setError(i18next.t('errors.illuminate.loadFailed'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, isAuthLoading]);

  // Get entries from the last 7 days
  const recentEntries = entries.filter((entry) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return entry.createdAt >= sevenDaysAgo;
  });

  /**
   * Create a new Illuminate entry with all data from the 4-step flow
   */
  const createEntry = useCallback(
    async (
      input: IlluminateEntryInput,
      aiData: IlluminateAIData,
      completion: IlluminateCompletionData
    ): Promise<string> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const now = Timestamp.now();

        const entriesRef = collection(firestore, `users/${userId}/illuminate_entries`);
        const docRef = await addDoc(entriesRef, {
          userId,
          createdAt: now,
          updatedAt: now,

          // Step 1: The Situation
          situation: input.situation,

          // Step 2: The Thoughts
          automaticThoughts: input.automaticThoughts,

          // Step 3: The Feelings
          primaryEmotions: input.primaryEmotions,

          // Step 4: The Intensity
          emotionalIntensity: input.emotionalIntensity,

          // Step 5: The Pattern (AI)
          aiDetectedDistortions: aiData.aiDetectedDistortions,
          userConfirmedDistortions: completion.userConfirmedDistortions,
          userDismissedDistortions: completion.userDismissedDistortions,

          // Step 6: The Reframe
          aiSuggestedReframes: aiData.aiSuggestedReframes,
          selectedReframe: completion.selectedReframe,
          customReframe: completion.customReframe,
          // Only include reframeHelpfulness if it has a value (Firestore rejects undefined)
          ...(completion.reframeHelpfulness !== undefined && {
            reframeHelpfulness: completion.reframeHelpfulness,
          }),

          // Meta
          entryDurationSeconds: completion.entryDurationSeconds,
          completedAllSteps: true,
        });

        logAnalyticsEvent(AnalyticsEvent.ILLUMINATE_ENTRY_CREATED, {
          emotional_intensity: input.emotionalIntensity,
          distortion_count: completion.userConfirmedDistortions.length,
          used_ai_reframe: !completion.customReframe,
          emotion_count: input.primaryEmotions.length,
        });

        return docRef.id;
      } catch (err) {
        console.error('Error creating illuminate entry:', err);
        toast.error(i18next.t('errors.illuminate.saveFailed'));
        throw err;
      }
    },
    [userId]
  );

  /**
   * Update an existing Illuminate entry (e.g., add reframe rating)
   */
  const updateEntry = useCallback(
    async (id: string, data: Partial<IlluminateEntry>): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const entryRef = doc(firestore, `users/${userId}/illuminate_entries/${id}`);
        const updateData: Record<string, any> = {
          updatedAt: Timestamp.now(),
        };

        // Only update allowed fields
        if (data.reframeHelpfulness !== undefined) {
          updateData.reframeHelpfulness = data.reframeHelpfulness;
          logAnalyticsEvent(AnalyticsEvent.REFRAME_RATED, {
            rating: data.reframeHelpfulness,
          });
        }

        await updateDoc(entryRef, updateData);
      } catch (err) {
        console.error('Error updating illuminate entry:', err);
        toast.error(i18next.t('errors.illuminate.saveFailed'));
        throw err;
      }
    },
    [userId]
  );

  /**
   * Delete an Illuminate entry
   */
  const deleteEntry = useCallback(
    async (id: string): Promise<void> => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const entryRef = doc(firestore, `users/${userId}/illuminate_entries/${id}`);
        await deleteDoc(entryRef);

        logAnalyticsEvent(AnalyticsEvent.ILLUMINATE_ENTRY_DELETED);
        toast.success(i18next.t('illuminate.deleted'));
      } catch (err) {
        console.error('Error deleting illuminate entry:', err);
        toast.error(i18next.t('errors.illuminate.deleteFailed'));
        throw err;
      }
    },
    [userId]
  );

  /**
   * Calculate average emotional intensity over a period
   */
  const getAverageIntensity = useCallback(
    (days: number = 30): number => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      const recentEntries = entries.filter((e) => e.createdAt >= cutoff);
      if (recentEntries.length === 0) return 0;

      const sum = recentEntries.reduce((acc, e) => acc + e.emotionalIntensity, 0);
      return Math.round(sum / recentEntries.length);
    },
    [entries]
  );

  /**
   * Get count of each cognitive distortion across all entries
   */
  const getDistortionCounts = useCallback((): Record<CognitiveDistortion, number> => {
    const counts: Record<CognitiveDistortion, number> = {
      catastrophizing: 0,
      mind_reading: 0,
      fortune_telling: 0,
      all_or_nothing: 0,
      emotional_reasoning: 0,
      should_statements: 0,
      labeling: 0,
      personalization: 0,
      filtering: 0,
      overgeneralization: 0,
    };

    entries.forEach((entry) => {
      entry.userConfirmedDistortions.forEach((distortion) => {
        counts[distortion]++;
      });
    });

    return counts;
  }, [entries]);

  /**
   * Get count of each emotion across all entries
   */
  const getEmotionCounts = useCallback((): Record<EmotionType, number> => {
    const counts: Partial<Record<EmotionType, number>> = {};

    entries.forEach((entry) => {
      entry.primaryEmotions.forEach((emotion) => {
        counts[emotion] = (counts[emotion] || 0) + 1;
      });
    });

    return counts as Record<EmotionType, number>;
  }, [entries]);

  return {
    entries,
    recentEntries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    getAverageIntensity,
    getDistortionCounts,
    getEmotionCounts,
  };
};
