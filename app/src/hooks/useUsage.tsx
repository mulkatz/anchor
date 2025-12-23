import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import type { UsageSummary } from '../models';

export interface UseUsageReturn {
  summary: UsageSummary | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for subscribing to user's usage summary in real-time
 * Updates automatically as AI calls, transcriptions, etc. are tracked
 */
export const useUsage = (): UseUsageReturn => {
  const { userId } = useApp();
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to usage summary document (stored directly at usage/{userId})
    const summaryRef = doc(firestore, 'usage', userId);

    const unsubscribe = onSnapshot(
      summaryRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // Convert Firestore timestamps to JS Dates
          setSummary({
            userId: data.userId,
            currentPeriod: data.currentPeriod,
            lifetime: {
              ...data.lifetime,
              firstActivityAt: data.lifetime?.firstActivityAt?.toDate?.() || new Date(),
            },
            limits: {
              ...data.limits,
              alertTriggeredAt: data.limits?.alertTriggeredAt?.toDate?.() || null,
            },
            lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
            schemaVersion: data.schemaVersion || '1.0',
          });
        } else {
          // No usage document yet - user hasn't triggered any tracked actions
          setSummary(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error subscribing to usage summary:', err);
        setError('Failed to load usage data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    summary,
    loading,
    error,
  };
};

/**
 * Format token count for display (e.g., 485000 -> "485K")
 */
export const formatTokenCount = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${Math.round(tokens / 1000)}K`;
  }
  return tokens.toString();
};

/**
 * Format cost for display (e.g., 2.47 -> "$2.47")
 */
export const formatCost = (costUsd: number): string => {
  if (costUsd < 0.01) {
    return '< $0.01';
  }
  return `$${costUsd.toFixed(2)}`;
};

/**
 * Format speech minutes for display (e.g., 8.1 -> "8.1 min")
 */
export const formatSpeechMinutes = (minutes: number): string => {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} sec`;
  }
  return `${minutes.toFixed(1)} min`;
};

/**
 * Get period display name (e.g., "December 2024")
 */
export const getPeriodDisplayName = (startDate: string, locale: string = 'en-US'): string => {
  const date = new Date(startDate + 'T00:00:00');
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
};

/**
 * Get days remaining in period
 */
export const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate + 'T23:59:59');
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};
