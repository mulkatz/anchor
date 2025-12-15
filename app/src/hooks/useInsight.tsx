import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import type { WeeklyInsight, CognitiveDistortion, EmotionType } from '../models';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';

interface WeeklyInsightResponse {
  id: string;
  weekStartDate: string;
  entryCount: number;
  averageAnxietyIntensity: number;
  mostCommonDistortions: { type: CognitiveDistortion; count: number; percentage: number }[];
  mostCommonEmotions: { type: EmotionType; count: number }[];
  identifiedTriggers: string[];
  insightText: string;
  recommendations: string[];
  viewed: boolean;
  createdAt: { _seconds: number; _nanoseconds: number };
}

export interface UseInsightReturn {
  insight: WeeklyInsight | null;
  loading: boolean;
  error: string | null;
  fetchInsight: () => Promise<void>;
  markAsViewed: () => Promise<void>;
  rateInsight: (rating: number) => Promise<void>;
}

/**
 * Hook for managing weekly AI insights (Beacon feature)
 */
export const useInsight = (): UseInsightReturn => {
  const { userId, userProfile } = useApp();
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch or generate weekly insight
   */
  const fetchInsight = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const generateWeeklyInsightFn = httpsCallable<
        { language?: string; forceRegenerate?: boolean },
        WeeklyInsightResponse | null
      >(functions, 'generateWeeklyInsight');

      const result = await generateWeeklyInsightFn({
        language: userProfile?.language || 'en-US',
      });

      if (result.data) {
        const data = result.data;
        setInsight({
          id: data.id,
          userId,
          weekStartDate: data.weekStartDate,
          createdAt: new Date(data.createdAt._seconds * 1000),
          entryCount: data.entryCount,
          averageAnxietyIntensity: data.averageAnxietyIntensity,
          mostCommonDistortions: data.mostCommonDistortions,
          mostCommonEmotions: data.mostCommonEmotions,
          identifiedTriggers: data.identifiedTriggers,
          insightText: data.insightText,
          recommendations: data.recommendations,
          viewed: data.viewed,
        });
      } else {
        setInsight(null);
      }
    } catch (err) {
      console.error('Error fetching insight:', err);
      setError('Failed to load insight');
    } finally {
      setLoading(false);
    }
  }, [userId, userProfile?.language]);

  /**
   * Mark the current insight as viewed
   */
  const markAsViewed = useCallback(async () => {
    if (!insight || insight.viewed) return;

    try {
      const markInsightViewedFn = httpsCallable<{ insightId: string }, { success: boolean }>(
        functions,
        'markInsightViewed'
      );

      await markInsightViewedFn({ insightId: insight.id });

      setInsight((prev) =>
        prev
          ? {
              ...prev,
              viewed: true,
              viewedAt: new Date(),
            }
          : null
      );

      logAnalyticsEvent(AnalyticsEvent.INSIGHT_VIEWED, {
        week_start: insight.weekStartDate,
      });
    } catch (err) {
      console.error('Error marking insight as viewed:', err);
    }
  }, [insight]);

  /**
   * Rate the insight's helpfulness
   */
  const rateInsight = useCallback(
    async (rating: number) => {
      if (!insight) return;

      try {
        const rateInsightFn = httpsCallable<
          { insightId: string; rating: number },
          { success: boolean }
        >(functions, 'rateInsight');

        await rateInsightFn({ insightId: insight.id, rating });

        setInsight((prev) =>
          prev
            ? {
                ...prev,
                helpfulnessRating: rating,
              }
            : null
        );

        logAnalyticsEvent(AnalyticsEvent.INSIGHT_RATED, { rating });
      } catch (err) {
        console.error('Error rating insight:', err);
      }
    },
    [insight]
  );

  return {
    insight,
    loading,
    error,
    fetchInsight,
    markAsViewed,
    rateInsight,
  };
};
