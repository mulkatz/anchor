import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type FC,
  type PropsWithChildren,
} from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase.service';
import { useApp } from './AppContext';
import type { WeeklyInsight, CognitiveDistortion, EmotionType } from '../models';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';

// localStorage cache key
const INSIGHT_CACHE_KEY = 'weekly_insight_cache';

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

interface CachedInsight {
  userId: string;
  weekStartDate: string;
  insight: Omit<WeeklyInsight, 'createdAt'> & { createdAt: string };
  cachedAt: number;
}

interface InsightContextValue {
  insight: WeeklyInsight | null;
  loading: boolean;
  error: string | null;
  fetchInsight: () => Promise<void>;
  markAsViewed: () => Promise<void>;
}

const InsightContext = createContext<InsightContextValue | undefined>(undefined);

/**
 * Get the Monday of the current week as YYYY-MM-DD
 */
function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/**
 * Load cached insight from localStorage
 */
function loadCachedInsight(userId: string): WeeklyInsight | null {
  try {
    const cached = localStorage.getItem(INSIGHT_CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedInsight = JSON.parse(cached);

    // Only use cache if belongs to current user and is from current week
    const currentWeekStart = getWeekStartDate();
    if (parsed.userId === userId && parsed.weekStartDate === currentWeekStart) {
      return {
        ...parsed.insight,
        createdAt: new Date(parsed.insight.createdAt),
      };
    }
  } catch (e) {
    console.warn('Failed to load insight cache:', e);
  }
  return null;
}

/**
 * Save insight to localStorage cache
 */
function saveCachedInsight(userId: string, insight: WeeklyInsight): void {
  try {
    const cached: CachedInsight = {
      userId,
      weekStartDate: insight.weekStartDate,
      insight: {
        ...insight,
        createdAt: insight.createdAt.toISOString(),
      },
      cachedAt: Date.now(),
    };
    localStorage.setItem(INSIGHT_CACHE_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('Failed to save insight cache:', e);
  }
}

/**
 * InsightProvider - Pre-fetches weekly insights on app initialization
 * Prevents layout shift by loading insight data before pages render
 */
export const InsightProvider: FC<PropsWithChildren> = ({ children }) => {
  const { userId, userProfile } = useApp();
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

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
        const newInsight: WeeklyInsight = {
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
        };
        setInsight(newInsight);
        saveCachedInsight(userId, newInsight);
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

      setInsight((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          viewed: true,
          viewedAt: new Date(),
        };
        // Update cache with viewed status
        saveCachedInsight(prev.userId, updated);
        return updated;
      });

      logAnalyticsEvent(AnalyticsEvent.INSIGHT_VIEWED, {
        week_start: insight.weekStartDate,
      });
    } catch (err) {
      console.error('Error marking insight as viewed:', err);
    }
  }, [insight]);

  // Auto-fetch insight on mount when userId is available
  useEffect(() => {
    if (!userId) {
      setInsight(null);
      setHasFetched(false);
      return;
    }

    // Load from cache immediately for instant display
    const cached = loadCachedInsight(userId);
    if (cached) {
      setInsight(cached);
    }

    // Fetch fresh data in background (only once per session)
    if (!hasFetched) {
      setHasFetched(true);
      fetchInsight();
    }
  }, [userId, hasFetched, fetchInsight]);

  const value: InsightContextValue = {
    insight,
    loading,
    error,
    fetchInsight,
    markAsViewed,
  };

  return <InsightContext.Provider value={value}>{children}</InsightContext.Provider>;
};

export const useInsightContext = () => {
  const context = useContext(InsightContext);
  if (context === undefined) {
    throw new Error('useInsightContext must be used within InsightProvider');
  }
  return context;
};
