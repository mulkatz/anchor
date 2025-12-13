import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type FC,
  type PropsWithChildren,
} from 'react';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { firestore } from '../services/firebase.service';
import { useApp } from './AppContext';
import { diveLessons, getLessonById, getNextLesson, type DiveLesson } from '../data/dive-lessons';
import type { DiveProgressSummary, DiveLessonStatus } from '../models';

interface DiveContextValue {
  // Progress state
  progress: DiveProgressSummary | null;
  isLoading: boolean;

  // Computed helpers
  currentLesson: DiveLesson | null;
  getLessonStatus: (lessonId: string) => DiveLessonStatus;
  isLessonUnlocked: (lessonId: string) => boolean;
  isLessonCompleted: (lessonId: string) => boolean;

  // Actions
  initializeProgress: () => Promise<void>;
  refreshProgress: () => void;
}

const DiveContext = createContext<DiveContextValue | undefined>(undefined);

export const DiveProvider: FC<PropsWithChildren> = ({ children }) => {
  const { userId } = useApp();
  const [progress, setProgress] = useState<DiveProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to progress changes in Firestore
  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const progressRef = doc(firestore, `users/${userId}/dive_progress/summary`);

    const unsubscribe = onSnapshot(
      progressRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProgress({
            userId: data.userId,
            currentLessonId: data.currentLessonId,
            unlockedLessons: data.unlockedLessons || [],
            completedLessons: data.completedLessons || [],
            totalReflections: data.totalReflections || 0,
            lastActivityAt: data.lastActivityAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          // No progress yet - user hasn't started The Dive
          setProgress(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to dive progress:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Initialize progress for first-time users
  const initializeProgress = useCallback(async () => {
    if (!userId) return;

    const progressRef = doc(firestore, `users/${userId}/dive_progress/summary`);

    // Get the first lesson ID
    const firstLesson = diveLessons[0];
    if (!firstLesson) return;

    await setDoc(progressRef, {
      userId,
      currentLessonId: firstLesson.id,
      unlockedLessons: [firstLesson.id],
      completedLessons: [],
      totalReflections: 0,
      lastActivityAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
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

  const value: DiveContextValue = {
    progress,
    isLoading,
    currentLesson,
    getLessonStatus,
    isLessonUnlocked,
    isLessonCompleted,
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
