import { useState, useEffect } from 'react';
import { functions, httpsCallable } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import { useDive } from '../contexts/DiveContext';
import { useSettings } from './useSettings';
import type { SupportedLanguage } from '../models';

/**
 * Localized lesson content from backend
 */
export interface LocalizedLessonContent {
  id: string;
  zone: string; // Translated zone name
  title: string;
  clinicalConcept: string;
  oceanMetaphor: string;
  commonResistance: string;
  socraticGoal: string;
  suggestedReading?: string;
  safetyNotes?: string;
}

interface UseDiveLessonProps {
  lessonId: string | undefined;
}

interface UseDiveLessonReturn {
  lesson: LocalizedLessonContent | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch localized lesson content from backend
 * First checks for prefetched content from DiveContext, then falls back to fetching
 */
export const useDiveLesson = ({ lessonId }: UseDiveLessonProps): UseDiveLessonReturn => {
  const { userId } = useApp();
  const { settings } = useSettings();
  const { getPrefetchedLesson } = useDive();

  // Check for prefetched content first
  const prefetchedLesson = lessonId ? getPrefetchedLesson(lessonId) : null;

  const [lesson, setLesson] = useState<LocalizedLessonContent | null>(prefetchedLesson);
  const [isLoading, setIsLoading] = useState(!prefetchedLesson && !!lessonId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have prefetched content, use it immediately
    if (prefetchedLesson) {
      setLesson(prefetchedLesson);
      setIsLoading(false);
      return;
    }

    if (!lessonId || !userId) {
      setLesson(null);
      setIsLoading(false);
      return;
    }

    // Fall back to fetching if not prefetched
    const fetchLesson = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const language: SupportedLanguage = settings.language;
        const getDiveLesson = httpsCallable<
          { lessonId: string; language: SupportedLanguage },
          { lesson: LocalizedLessonContent }
        >(functions, 'getDiveLesson');

        const result = await getDiveLesson({ lessonId, language });
        setLesson(result.data.lesson);
      } catch (err) {
        console.error('Error fetching lesson content:', err);
        setError('Failed to load lesson content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, userId, settings.language, prefetchedLesson]);

  return { lesson, isLoading, error };
};
