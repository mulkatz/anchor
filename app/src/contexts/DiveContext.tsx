import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type FC,
  type PropsWithChildren,
} from 'react';
import { doc, onSnapshot, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { firestore, functions, httpsCallable } from '../services/firebase.service';
import { useApp } from './AppContext';
import { useSettings } from '../hooks/useSettings';
import { diveLessons, getLessonById, getNextLesson, type DiveLesson } from '../data/dive-lessons';
import type { DiveProgressSummary, DiveLessonStatus, SupportedLanguage } from '../models';
import type { LocalizedLessonContent } from '../hooks/useDiveLesson';

// localStorage key for caching progress
const DIVE_PROGRESS_CACHE_KEY = 'dive_progress_cache';
const DIVE_LESSONS_CACHE_KEY = 'dive_lessons_cache';

interface CachedProgress {
  userId: string;
  progress: DiveProgressSummary;
  cachedAt: number;
}

interface CachedLessons {
  language: SupportedLanguage;
  lessons: Record<string, LocalizedLessonContent>;
  cachedAt: number;
}

interface DiveContextValue {
  // Progress state
  progress: DiveProgressSummary | null;
  isLoading: boolean;

  // Computed helpers
  currentLesson: DiveLesson | null;
  getLessonStatus: (lessonId: string) => DiveLessonStatus;
  isLessonUnlocked: (lessonId: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;

  // Prefetched lesson content
  getPrefetchedLesson: (lessonId: string) => LocalizedLessonContent | null;

  // Actions
  initializeProgress: () => Promise<void>;
  refreshProgress: () => void;
}

const DiveContext = createContext<DiveContextValue | undefined>(undefined);

/**
 * Load cached progress from localStorage
 */
function loadCachedProgress(userId: string): DiveProgressSummary | null {
  try {
    const cached = localStorage.getItem(DIVE_PROGRESS_CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedProgress = JSON.parse(cached);

    // Only use cache if it belongs to current user and is less than 24 hours old
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (parsed.userId === userId && Date.now() - parsed.cachedAt < maxAge) {
      // Restore Date objects
      return {
        ...parsed.progress,
        lastActivityAt: new Date(parsed.progress.lastActivityAt),
        createdAt: new Date(parsed.progress.createdAt),
        updatedAt: new Date(parsed.progress.updatedAt),
      };
    }
  } catch (e) {
    console.warn('Failed to load dive progress cache:', e);
  }
  return null;
}

/**
 * Save progress to localStorage cache
 */
function saveCachedProgress(userId: string, progress: DiveProgressSummary): void {
  try {
    const cached: CachedProgress = {
      userId,
      progress,
      cachedAt: Date.now(),
    };
    localStorage.setItem(DIVE_PROGRESS_CACHE_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('Failed to save dive progress cache:', e);
  }
}

/**
 * Clear cached progress (e.g., on logout or data reset)
 */
export function clearDiveProgressCache(): void {
  try {
    localStorage.removeItem(DIVE_PROGRESS_CACHE_KEY);
    localStorage.removeItem(DIVE_LESSONS_CACHE_KEY);
  } catch (e) {
    console.warn('Failed to clear dive progress cache:', e);
  }
}

/**
 * Load cached lesson content from localStorage
 */
function loadCachedLessons(language: SupportedLanguage): Record<string, LocalizedLessonContent> {
  try {
    const cached = localStorage.getItem(DIVE_LESSONS_CACHE_KEY);
    if (!cached) return {};

    const parsed: CachedLessons = JSON.parse(cached);

    // Only use cache if language matches and is less than 7 days old
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (parsed.language === language && Date.now() - parsed.cachedAt < maxAge) {
      return parsed.lessons;
    }
  } catch (e) {
    console.warn('Failed to load dive lessons cache:', e);
  }
  return {};
}

/**
 * Save lesson content to localStorage cache
 */
function saveCachedLessons(
  language: SupportedLanguage,
  lessons: Record<string, LocalizedLessonContent>
): void {
  try {
    const cached: CachedLessons = {
      language,
      lessons,
      cachedAt: Date.now(),
    };
    localStorage.setItem(DIVE_LESSONS_CACHE_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('Failed to save dive lessons cache:', e);
  }
}

/**
 * Initialize progress in Firestore (internal helper)
 * Creates the first progress document for new users
 */
async function initializeProgressInternal(userId: string): Promise<void> {
  const progressRef = doc(firestore, `users/${userId}/dive_progress/summary`);

  // Check if it already exists (avoid race conditions)
  const existing = await getDoc(progressRef);
  if (existing.exists()) return;

  // Get the first lesson ID
  const firstLesson = diveLessons[0];
  if (!firstLesson) return;

  const initialProgress: Omit<DiveProgressSummary, 'lastActivityAt' | 'createdAt' | 'updatedAt'> & {
    lastActivityAt: ReturnType<typeof Timestamp.now>;
    createdAt: ReturnType<typeof Timestamp.now>;
    updatedAt: ReturnType<typeof Timestamp.now>;
  } = {
    userId,
    currentLessonId: firstLesson.id,
    unlockedLessons: [firstLesson.id],
    completedLessons: [],
    totalReflections: 0,
    lastActivityAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(progressRef, initialProgress);

  console.log('Initialized dive progress for user:', userId);
}

export const DiveProvider: FC<PropsWithChildren> = ({ children }) => {
  const { userId } = useApp();
  const { settings } = useSettings();
  const [progress, setProgress] = useState<DiveProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prefetchedLessons, setPrefetchedLessons] = useState<
    Record<string, LocalizedLessonContent>
  >({});
  const hasInitialized = useRef(false);
  const prefetchingRef = useRef<Set<string>>(new Set());
  const previousLanguageRef = useRef<SupportedLanguage>(settings.language);

  // On mount or userId change, load cached progress immediately for fast display
  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setIsLoading(false);
      hasInitialized.current = false;
      return;
    }

    // Load from cache immediately for instant display
    const cached = loadCachedProgress(userId);
    if (cached) {
      setProgress(cached);
      // Still loading - we'll verify with Firestore
    }

    setIsLoading(true);

    const progressRef = doc(firestore, `users/${userId}/dive_progress/summary`);

    const unsubscribe = onSnapshot(
      progressRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const firestoreProgress: DiveProgressSummary = {
            userId: data.userId,
            currentLessonId: data.currentLessonId,
            unlockedLessons: data.unlockedLessons || [],
            completedLessons: data.completedLessons || [],
            totalReflections: data.totalReflections || 0,
            lastActivityAt: data.lastActivityAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };

          setProgress(firestoreProgress);
          // Update local cache with Firestore data (source of truth)
          saveCachedProgress(userId, firestoreProgress);
        } else {
          // No progress in Firestore - auto-initialize for first-time users
          if (!hasInitialized.current) {
            hasInitialized.current = true;
            await initializeProgressInternal(userId);
          }
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to dive progress:', error);
        // If Firestore fails but we have cache, keep using it
        if (!progress) {
          const cached = loadCachedProgress(userId);
          if (cached) {
            setProgress(cached);
          }
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Prefetch lesson content for unlocked lessons
  useEffect(() => {
    const language = settings.language;

    // Detect language change and clear in-progress prefetches
    if (previousLanguageRef.current !== language) {
      prefetchingRef.current.clear();
      previousLanguageRef.current = language;
    }

    // Load cached lessons for current language
    // ALWAYS update state to clear stale content from previous language
    const cached = loadCachedLessons(language);
    setPrefetchedLessons(cached);

    // Get unlocked lessons to prefetch
    const unlockedLessonIds = progress?.unlockedLessons || [diveLessons[0]?.id].filter(Boolean);
    if (unlockedLessonIds.length === 0) return;

    // Prefetch each unlocked lesson that isn't already cached
    // Note: Check against fresh `cached` object, not stale `prefetchedLessons` state
    const prefetchLesson = async (lessonId: string) => {
      // Skip if already in cache or currently prefetching
      if (cached[lessonId] || prefetchingRef.current.has(lessonId)) {
        return;
      }

      prefetchingRef.current.add(lessonId);

      try {
        const getDiveLesson = httpsCallable<
          { lessonId: string; language: SupportedLanguage },
          { lesson: LocalizedLessonContent }
        >(functions, 'getDiveLesson');

        const result = await getDiveLesson({ lessonId, language });

        setPrefetchedLessons((prev) => {
          const updated = { ...prev, [lessonId]: result.data.lesson };
          saveCachedLessons(language, updated);
          return updated;
        });
      } catch (err) {
        console.warn(`Failed to prefetch lesson ${lessonId}:`, err);
      } finally {
        prefetchingRef.current.delete(lessonId);
      }
    };

    // Prefetch all unlocked lessons
    unlockedLessonIds.forEach((lessonId) => {
      if (lessonId) prefetchLesson(lessonId);
    });
  }, [progress?.unlockedLessons, settings.language]);

  // Initialize progress for first-time users (external API)
  const initializeProgress = useCallback(async () => {
    if (!userId) return;
    await initializeProgressInternal(userId);
  }, [userId]);

  // Get current lesson from progress
  const currentLesson = progress?.currentLessonId
    ? getLessonById(progress.currentLessonId) || null
    : null;

  // Check if lesson is unlocked
  const isLessonUnlocked = useCallback(
    (lessonId: string): boolean => {
      if (!progress) return lessonId === diveLessons[0]?.id; // First lesson always available
      return progress.unlockedLessons.includes(lessonId);
    },
    [progress]
  );

  // Check if lesson is completed
  const isLessonCompleted = useCallback(
    (lessonId: string): boolean => {
      if (!progress) return false;
      return progress.completedLessons.includes(lessonId);
    },
    [progress]
  );

  // Get lesson status
  const getLessonStatus = useCallback(
    (lessonId: string): DiveLessonStatus => {
      if (isLessonCompleted(lessonId)) return 'completed';
      if (isLessonUnlocked(lessonId)) return 'in-progress';
      return 'locked';
    },
    [isLessonCompleted, isLessonUnlocked]
  );

  // Manual refresh trigger
  const refreshProgress = useCallback(() => {
    // The Firestore listener will handle updates automatically
    // This is just a placeholder for manual refresh if needed
  }, []);

  // Get prefetched lesson content
  const getPrefetchedLesson = useCallback(
    (lessonId: string): LocalizedLessonContent | null => {
      return prefetchedLessons[lessonId] || null;
    },
    [prefetchedLessons]
  );

  const value: DiveContextValue = {
    progress,
    isLoading,
    currentLesson,
    getLessonStatus,
    isLessonUnlocked,
    isLessonCompleted,
    getPrefetchedLesson,
    initializeProgress,
    refreshProgress,
  };

  return <DiveContext.Provider value={value}>{children}</DiveContext.Provider>;
};

export const useDive = () => {
  const context = useContext(DiveContext);
  if (context === undefined) {
    throw new Error('useDive must be used within DiveProvider');
  }
  return context;
};
