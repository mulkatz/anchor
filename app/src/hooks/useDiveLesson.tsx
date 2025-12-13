import { useState, useEffect } from 'react';
import { functions, httpsCallable } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
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
 * Used to display translated lesson content in the intro card
 */
export const useDiveLesson = ({ lessonId }: UseDiveLessonProps): UseDiveLessonReturn => {
  const [lesson, setLesson] = useState<LocalizedLessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useApp();
  const { settings } = useSettings();

  useEffect(() => {
    if (!lessonId || !userId) {
      setLesson(null);
      return;
    }

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
  }, [lessonId, userId, settings.language]);

  return { lesson, isLoading, error };
};
