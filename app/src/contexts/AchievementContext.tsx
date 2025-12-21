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
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { firestore } from '../services/firebase.service';
import { useApp } from './AppContext';
import { useHaptics } from '../hooks/useHaptics';
import { achievements, getAchievementById, TOTAL_ACHIEVEMENTS } from '../data/achievements';
import type { AchievementSummary, AchievementStats, Achievement } from '../models';

// localStorage key for caching
const ACHIEVEMENT_CACHE_KEY = 'achievements_cache';

interface CachedAchievements {
  userId: string;
  summary: AchievementSummary;
  cachedAt: number;
}

interface AchievementContextValue {
  // State
  summary: AchievementSummary | null;
  isLoading: boolean;

  // Computed achievements with progress
  computedAchievements: Achievement[];
  unlockedCount: number;
  totalCount: number;

  // Actions
  checkAndUnlockAchievements: (metric: string, currentValue: number) => Promise<void>;
  updateStats: (stats: Partial<AchievementStats>) => Promise<void>;
  refreshAchievements: () => void;
}

const AchievementContext = createContext<AchievementContextValue | undefined>(undefined);

/**
 * Load cached achievements from localStorage
 */
function loadCachedAchievements(userId: string): AchievementSummary | null {
  try {
    const cached = localStorage.getItem(ACHIEVEMENT_CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedAchievements = JSON.parse(cached);

    // Only use cache if it belongs to current user and is less than 24 hours old
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (parsed.userId === userId && Date.now() - parsed.cachedAt < maxAge) {
      // Restore Date objects
      const restoredDates: Record<string, Date> = {};
      for (const [id, dateStr] of Object.entries(parsed.summary.achievementDates)) {
        restoredDates[id] = new Date(dateStr as unknown as string);
      }

      return {
        ...parsed.summary,
        achievementDates: restoredDates,
        createdAt: new Date(parsed.summary.createdAt),
        updatedAt: new Date(parsed.summary.updatedAt),
      };
    }
  } catch (e) {
    console.warn('Failed to load achievement cache:', e);
  }
  return null;
}

/**
 * Save achievements to localStorage cache
 */
function saveCachedAchievements(userId: string, summary: AchievementSummary): void {
  try {
    const cached: CachedAchievements = {
      userId,
      summary,
      cachedAt: Date.now(),
    };
    localStorage.setItem(ACHIEVEMENT_CACHE_KEY, JSON.stringify(cached));
  } catch (e) {
    console.warn('Failed to save achievement cache:', e);
  }
}

/**
 * Clear cached achievements (e.g., on logout or data reset)
 */
export function clearAchievementCache(): void {
  try {
    localStorage.removeItem(ACHIEVEMENT_CACHE_KEY);
  } catch (e) {
    console.warn('Failed to clear achievement cache:', e);
  }
}

/**
 * Create initial achievement summary for new users
 */
function createInitialSummary(userId: string): AchievementSummary {
  return {
    userId,
    unlockedAchievements: [],
    achievementDates: {},
    stats: {
      conversations: 0,
      dive_lessons: 0,
      illuminate_entries: 0,
      daily_logs: 0,
      released_logs: 0,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: '',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Initialize achievements in Firestore for new users
 */
async function initializeAchievements(userId: string): Promise<void> {
  const summaryRef = doc(firestore, `users/${userId}/achievements/summary`);

  // Check if it already exists (avoid race conditions)
  const existing = await getDoc(summaryRef);
  if (existing.exists()) return;

  const initialSummary = {
    userId,
    unlockedAchievements: [],
    achievementDates: {},
    stats: {
      conversations: 0,
      dive_lessons: 0,
      illuminate_entries: 0,
      daily_logs: 0,
      released_logs: 0,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: '',
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(summaryRef, initialSummary);
  console.log('Initialized achievements for user:', userId);
}

export const AchievementProvider: FC<PropsWithChildren> = ({ children }) => {
  const { userId } = useApp();
  const { medium } = useHaptics();
  const [summary, setSummary] = useState<AchievementSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  // Track which achievements we've already shown toasts for in this session
  const shownToastsRef = useRef<Set<string>>(new Set());

  // On mount or userId change, load cached achievements immediately
  useEffect(() => {
    if (!userId) {
      setSummary(null);
      setIsLoading(false);
      hasInitialized.current = false;
      shownToastsRef.current.clear();
      return;
    }

    // Load from cache immediately for instant display
    const cached = loadCachedAchievements(userId);
    if (cached) {
      setSummary(cached);
      // Mark existing achievements as already shown
      cached.unlockedAchievements.forEach((id) => shownToastsRef.current.add(id));
    }

    setIsLoading(true);

    const summaryRef = doc(firestore, `users/${userId}/achievements/summary`);

    const unsubscribe = onSnapshot(
      summaryRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          // Convert Firestore dates to JS Dates
          const achievementDates: Record<string, Date> = {};
          if (data.achievementDates) {
            for (const [id, timestamp] of Object.entries(data.achievementDates)) {
              achievementDates[id] =
                (timestamp as any)?.toDate?.() || new Date(timestamp as string);
            }
          }

          const firestoreSummary: AchievementSummary = {
            userId: data.userId,
            unlockedAchievements: data.unlockedAchievements || [],
            achievementDates,
            stats: {
              conversations: data.stats?.conversations || 0,
              dive_lessons: data.stats?.dive_lessons || 0,
              illuminate_entries: data.stats?.illuminate_entries || 0,
              daily_logs: data.stats?.daily_logs || 0,
              released_logs: data.stats?.released_logs || 0,
              current_streak: data.stats?.current_streak || 0,
              longest_streak: data.stats?.longest_streak || 0,
              last_activity_date: data.stats?.last_activity_date || '',
            },
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };

          // Check for new achievements to show toasts
          // (Only show toasts for achievements unlocked AFTER initial load)
          if (summary) {
            const newUnlocks = firestoreSummary.unlockedAchievements.filter(
              (id) => !shownToastsRef.current.has(id)
            );

            // Import dynamically to avoid circular dependency
            if (newUnlocks.length > 0) {
              import('../components/features/achievements/AchievementToast').then(
                ({ showAchievementToast }) => {
                  for (const id of newUnlocks) {
                    const achievement = getAchievementById(id);
                    if (achievement) {
                      showAchievementToast(id, achievement.iconName, { medium });
                      shownToastsRef.current.add(id);
                    }
                  }
                }
              );
            }
          } else {
            // First load - mark all as shown
            firestoreSummary.unlockedAchievements.forEach((id) => shownToastsRef.current.add(id));
          }

          setSummary(firestoreSummary);
          saveCachedAchievements(userId, firestoreSummary);
        } else {
          // No achievements in Firestore - auto-initialize for first-time users
          if (!hasInitialized.current) {
            hasInitialized.current = true;
            await initializeAchievements(userId);
          }
          // Set empty summary while waiting for initialization
          const initial = createInitialSummary(userId);
          setSummary(initial);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to achievements:', error);
        // If Firestore fails but we have cache, keep using it
        if (!summary) {
          const cached = loadCachedAchievements(userId);
          if (cached) {
            setSummary(cached);
          } else {
            // Create empty summary to prevent null issues
            setSummary(createInitialSummary(userId));
          }
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Check and unlock achievements based on metric value
  const checkAndUnlockAchievements = useCallback(
    async (metric: string, currentValue: number) => {
      if (!userId || !summary) return;

      const alreadyUnlocked = new Set(summary.unlockedAchievements);
      const newUnlocks: string[] = [];

      // Find achievements for this metric that are now unlockable
      for (const achievement of achievements) {
        if (alreadyUnlocked.has(achievement.id)) continue;
        if (achievement.requirement.metric !== metric) continue;

        if (currentValue >= achievement.requirement.target) {
          newUnlocks.push(achievement.id);
        }
      }

      if (newUnlocks.length === 0) return;

      // Update Firestore (idempotent - arrayUnion won't duplicate)
      const summaryRef = doc(firestore, `users/${userId}/achievements/summary`);

      const now = Timestamp.now();
      const achievementDates: Record<string, any> = {};
      for (const id of newUnlocks) {
        achievementDates[`achievementDates.${id}`] = now;
      }

      try {
        await updateDoc(summaryRef, {
          unlockedAchievements: arrayUnion(...newUnlocks),
          ...achievementDates,
          [`stats.${metric}`]: currentValue,
          updatedAt: now,
        });
      } catch (error) {
        console.error('Failed to unlock achievements:', error);
      }
    },
    [userId, summary]
  );

  // Update stats (for streak tracking from Cloud Functions)
  const updateStats = useCallback(
    async (stats: Partial<AchievementStats>) => {
      if (!userId) return;

      const summaryRef = doc(firestore, `users/${userId}/achievements/summary`);

      const updates: Record<string, any> = {
        updatedAt: Timestamp.now(),
      };

      for (const [key, value] of Object.entries(stats)) {
        updates[`stats.${key}`] = value;
      }

      try {
        await updateDoc(summaryRef, updates);
      } catch (error) {
        console.error('Failed to update achievement stats:', error);
      }
    },
    [userId]
  );

  // Compute achievements with progress info
  const computedAchievements: Achievement[] = achievements.map((def) => {
    const isUnlocked = summary?.unlockedAchievements.includes(def.id) || false;
    const unlockedAt = summary?.achievementDates[def.id];

    // Calculate progress percentage
    let progress = 0;
    if (!isUnlocked && summary?.stats) {
      const statsRecord = summary.stats as unknown as Record<string, number>;
      const currentValue = statsRecord[def.requirement.metric] || 0;
      progress = Math.min((currentValue / def.requirement.target) * 100, 100);
    } else if (isUnlocked) {
      progress = 100;
    }

    return {
      ...def,
      isUnlocked,
      unlockedAt,
      progress,
    };
  });

  const unlockedCount = summary?.unlockedAchievements.length || 0;

  // Manual refresh trigger
  const refreshAchievements = useCallback(() => {
    // The Firestore listener handles updates automatically
  }, []);

  const value: AchievementContextValue = {
    summary,
    isLoading,
    computedAchievements,
    unlockedCount,
    totalCount: TOTAL_ACHIEVEMENTS,
    checkAndUnlockAchievements,
    updateStats,
    refreshAchievements,
  };

  // Debug function for testing achievement toasts (DEV only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).testAchievementToast = async (achievementId?: string) => {
        const { showAchievementToast } =
          await import('../components/features/achievements/AchievementToast');
        const id = achievementId || 'first_light';
        const achievement = getAchievementById(id);
        if (achievement) {
          showAchievementToast(id, achievement.iconName, { medium });
          console.log(`Triggered toast for: ${id}`);
        } else {
          console.log('Available achievements:', achievements.map((a) => a.id).join(', '));
        }
      };
      console.log('🎯 Debug: testAchievementToast(achievementId?) available on window');
    }
    return () => {
      if (import.meta.env.DEV) {
        delete (window as any).testAchievementToast;
      }
    };
  }, [medium]);

  return <AchievementContext.Provider value={value}>{children}</AchievementContext.Provider>;
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
};
