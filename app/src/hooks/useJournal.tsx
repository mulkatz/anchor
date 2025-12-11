import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { format, subDays, parseISO } from 'date-fns';
import { App as CapacitorApp } from '@capacitor/app';

import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import { db, LocalJournalEntry, LocalJournalSession } from '../db/db';
import type { JournalEntry, JournalSession } from '../models';

const FIX_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes until session becomes fixed
const SYNC_INTERVAL_MS = 60 * 1000; // Sync to Firebase every 60 seconds

export interface UseJournalReturn {
  entries: JournalEntry[];
  todayEntry: JournalEntry | null;
  activeSession: JournalSession | null;
  loading: boolean;
  error: string | null;
  hasMoreEntries: boolean;

  // Actions
  updateActiveSessionText: (text: string) => void;
  fixCurrentSession: () => Promise<void>;
  loadOlderEntries: () => Promise<void>;

  // Timer state
  timeUntilFix: number | null; // Milliseconds until current session fixes
}

/**
 * Generates a UUID for session IDs
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Count words in text
 */
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Convert local entry to JournalEntry model
 */
const localToJournalEntry = (local: LocalJournalEntry): JournalEntry => ({
  id: local.firestoreId || String(local.id),
  userId: local.userId,
  date: local.date,
  sessions: local.sessions.map((s) => ({
    id: s.id,
    text: s.text,
    startedAt: s.startedAt,
    fixedAt: s.fixedAt,
    wordCount: s.wordCount,
  })),
  createdAt: local.createdAt,
  updatedAt: local.updatedAt,
});

/**
 * Hook for managing Depths journal entries
 * Provides offline-first storage with Firestore sync
 */
export const useJournal = (): UseJournalReturn => {
  const { userId, isAuthLoading } = useApp();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreEntries, setHasMoreEntries] = useState<boolean>(true);
  const [oldestLoadedDate, setOldestLoadedDate] = useState<string | null>(null);
  const [timeUntilFix, setTimeUntilFix] = useState<number | null>(null);

  // Timer ref for the 30-min fix
  const fixTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastEditTimeRef = useRef<Date | null>(null);

  // Ref to track if initial load has happened (prevent re-syncing)
  const initialLoadDoneRef = useRef<boolean>(false);
  // Refs for functions to avoid effect dependency cascades
  const syncPendingEntriesRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const loadLocalEntriesRef = useRef<(daysBack?: number) => Promise<LocalJournalEntry[]>>(
    async () => []
  );
  const fixCurrentSessionRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Compute today's entry
  const todayEntry = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return entries.find((entry) => entry.date === today) || null;
  }, [entries]);

  // Compute active session (last session of today's entry if not fixed)
  const activeSession = useMemo(() => {
    if (!todayEntry || todayEntry.sessions.length === 0) return null;
    const lastSession = todayEntry.sessions[todayEntry.sessions.length - 1];
    return lastSession.fixedAt === null ? lastSession : null;
  }, [todayEntry]);

  /**
   * Load entries from IndexedDB
   */
  const loadLocalEntries = useCallback(
    async (daysBack: number = 7): Promise<LocalJournalEntry[]> => {
      if (!userId) return [];

      const startDate = format(subDays(new Date(), daysBack), 'yyyy-MM-dd');

      return await db.journalEntries
        .where('userId')
        .equals(userId)
        .and((entry) => entry.date >= startDate)
        .reverse()
        .sortBy('date');
    },
    [userId]
  );

  // Keep ref updated
  useEffect(() => {
    loadLocalEntriesRef.current = loadLocalEntries;
  }, [loadLocalEntries]);

  /**
   * Sync local entry to Firestore
   */
  const syncToFirestore = useCallback(
    async (localEntry: LocalJournalEntry): Promise<void> => {
      if (!userId) return;

      try {
        const entriesRef = collection(firestore, `users/${userId}/journal_entries`);

        if (localEntry.firestoreId) {
          // Update existing document
          const docRef = doc(
            firestore,
            `users/${userId}/journal_entries/${localEntry.firestoreId}`
          );
          await updateDoc(docRef, {
            sessions: localEntry.sessions.map((s) => ({
              ...s,
              startedAt: Timestamp.fromDate(s.startedAt),
              fixedAt: s.fixedAt ? Timestamp.fromDate(s.fixedAt) : null,
            })),
            updatedAt: Timestamp.now(),
          });
        } else {
          // Create new document
          const docRef = await addDoc(entriesRef, {
            userId,
            date: localEntry.date,
            sessions: localEntry.sessions.map((s) => ({
              ...s,
              startedAt: Timestamp.fromDate(s.startedAt),
              fixedAt: s.fixedAt ? Timestamp.fromDate(s.fixedAt) : null,
            })),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

          // Update local entry with Firestore ID
          await db.journalEntries.update(localEntry.id!, {
            firestoreId: docRef.id,
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          });
        }

        // Mark as synced
        await db.journalEntries.update(localEntry.id!, {
          syncStatus: 'synced',
          lastSyncedAt: new Date(),
        });
      } catch (err) {
        console.error('Error syncing to Firestore:', err);
        // Keep as pending, will retry later
      }
    },
    [userId]
  );

  /**
   * Get or create today's entry in IndexedDB
   */
  const getOrCreateTodayEntry = useCallback(async (): Promise<LocalJournalEntry> => {
    if (!userId) throw new Error('User not authenticated');

    const today = format(new Date(), 'yyyy-MM-dd');

    // Check if entry exists
    const existing = await db.journalEntries
      .where('userId')
      .equals(userId)
      .and((entry) => entry.date === today)
      .first();

    if (existing) return existing;

    // Create new entry
    const newEntry: Omit<LocalJournalEntry, 'id'> = {
      userId,
      date: today,
      sessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
    };

    const id = await db.journalEntries.add(newEntry as LocalJournalEntry);
    return { ...newEntry, id } as LocalJournalEntry;
  }, [userId]);

  /**
   * Start or restart the 30-min fix timer
   * OPTIMIZED: Does NOT cause re-renders on every call
   */
  const startFixTimer = useCallback(() => {
    // Clear existing timers
    if (fixTimerRef.current) clearTimeout(fixTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    lastEditTimeRef.current = new Date();
    // Don't call setTimeUntilFix here - it causes re-render on every keystroke!

    // Only start countdown interval if we don't already have one tracking this session
    // The interval updates UI every 10 seconds (not every second) to reduce re-renders
    countdownIntervalRef.current = setInterval(() => {
      if (lastEditTimeRef.current) {
        const elapsed = Date.now() - lastEditTimeRef.current.getTime();
        const remaining = Math.max(0, FIX_TIMEOUT_MS - elapsed);
        setTimeUntilFix(remaining);

        if (remaining === 0) {
          clearInterval(countdownIntervalRef.current!);
        }
      }
    }, 10000); // Update UI every 10 seconds instead of every second

    // Set fix timer
    fixTimerRef.current = setTimeout(async () => {
      await fixCurrentSessionRef.current();
    }, FIX_TIMEOUT_MS);
  }, []);

  /**
   * Fix the current session (make it uneditable)
   */
  const fixCurrentSession = useCallback(async (): Promise<void> => {
    if (!userId || !activeSession) return;

    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const localEntry = await db.journalEntries
        .where('userId')
        .equals(userId)
        .and((entry) => entry.date === today)
        .first();

      if (!localEntry) return;

      // Update the last session to be fixed
      const updatedSessions = localEntry.sessions.map((session, index) => {
        if (index === localEntry.sessions.length - 1 && session.fixedAt === null) {
          return { ...session, fixedAt: new Date() };
        }
        return session;
      });

      await db.journalEntries.update(localEntry.id!, {
        sessions: updatedSessions,
        syncStatus: 'pending',
      });

      // Sync to Firestore when session fixes (important milestone)
      const updatedEntry = await db.journalEntries.get(localEntry.id!);
      if (updatedEntry) {
        await syncToFirestore(updatedEntry);
      }

      // Refresh entries
      const localEntries = await loadLocalEntries();
      setEntries(localEntries.map(localToJournalEntry));

      // Clear timer state
      setTimeUntilFix(null);
      if (fixTimerRef.current) clearTimeout(fixTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    } catch (err) {
      console.error('Error fixing session:', err);
    }
  }, [userId, activeSession, syncToFirestore, loadLocalEntries]);

  // Keep ref updated
  useEffect(() => {
    fixCurrentSessionRef.current = fixCurrentSession;
  }, [fixCurrentSession]);

  /**
   * Update the active session's text
   * OPTIMIZED: Only updates IndexedDB, does NOT trigger React re-renders on every keystroke
   */
  const updateActiveSessionText = useCallback(
    async (text: string): Promise<void> => {
      if (!userId) return;

      try {
        let localEntry = await getOrCreateTodayEntry();

        // Check if we need to start a new session
        const lastSession =
          localEntry.sessions.length > 0
            ? localEntry.sessions[localEntry.sessions.length - 1]
            : null;

        const needsNewSession = !lastSession || lastSession.fixedAt !== null;

        let updatedSessions: LocalJournalSession[];
        let shouldRefreshEntries = false;

        if (needsNewSession) {
          // Start a new session - this DOES require a re-render to show new session
          const newSession: LocalJournalSession = {
            id: generateUUID(),
            text,
            startedAt: new Date(),
            fixedAt: null,
            wordCount: countWords(text),
          };
          updatedSessions = [...localEntry.sessions, newSession];
          shouldRefreshEntries = true; // New session added, need to update UI
        } else {
          // Update existing session - just update IndexedDB, no re-render needed
          updatedSessions = localEntry.sessions.map((session, index) => {
            if (index === localEntry.sessions.length - 1) {
              return {
                ...session,
                text,
                wordCount: countWords(text),
              };
            }
            return session;
          });
        }

        // Update local entry (IndexedDB only - no Firebase sync here!)
        await db.journalEntries.update(localEntry.id!, {
          sessions: updatedSessions,
          syncStatus: 'pending',
        });

        // Restart fix timer
        startFixTimer();

        // Only refresh React state when structurally necessary (new session created)
        if (shouldRefreshEntries) {
          const localEntries = await loadLocalEntriesRef.current();
          setEntries(localEntries.map(localToJournalEntry));
        }
      } catch (err) {
        console.error('Error updating session text:', err);
        setError('Failed to save');
      }
    },
    [userId, getOrCreateTodayEntry, startFixTimer]
  );

  /**
   * Load older entries (for lazy loading on scroll up)
   */
  const loadOlderEntries = useCallback(async (): Promise<void> => {
    if (!userId || !hasMoreEntries) return;

    try {
      const startDate = oldestLoadedDate
        ? format(subDays(parseISO(oldestLoadedDate), 7), 'yyyy-MM-dd')
        : format(subDays(new Date(), 14), 'yyyy-MM-dd');

      const endDate = oldestLoadedDate || format(subDays(new Date(), 7), 'yyyy-MM-dd');

      // Load from IndexedDB first
      const olderLocalEntries = await db.journalEntries
        .where('userId')
        .equals(userId)
        .and((entry) => entry.date >= startDate && entry.date < endDate)
        .reverse()
        .sortBy('date');

      // If no local entries, try Firestore
      if (olderLocalEntries.length === 0) {
        const entriesRef = collection(firestore, `users/${userId}/journal_entries`);
        const q = query(
          entriesRef,
          where('date', '>=', startDate),
          where('date', '<', endDate),
          orderBy('date', 'desc'),
          limit(7)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setHasMoreEntries(false);
          return;
        }

        // Save to IndexedDB
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          await db.journalEntries.add({
            firestoreId: docSnap.id,
            userId: data.userId,
            date: data.date,
            sessions: data.sessions.map((s: any) => ({
              id: s.id,
              text: s.text,
              startedAt: s.startedAt?.toDate() || new Date(),
              fixedAt: s.fixedAt?.toDate() || null,
              wordCount: s.wordCount || 0,
            })),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          });
        }
      }

      // Reload all entries
      const allLocalEntries = await db.journalEntries
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('date');

      setEntries(allLocalEntries.map(localToJournalEntry));

      // Update oldest loaded date
      if (allLocalEntries.length > 0) {
        setOldestLoadedDate(allLocalEntries[allLocalEntries.length - 1].date);
      }
    } catch (err) {
      console.error('Error loading older entries:', err);
    }
  }, [userId, hasMoreEntries, oldestLoadedDate]);

  /**
   * Sync all pending entries to Firestore
   */
  const syncPendingEntries = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const pendingEntries = await db.journalEntries
        .where('syncStatus')
        .equals('pending')
        .toArray();

      // Only sync if there are actually pending entries
      if (pendingEntries.length === 0) return;

      for (const entry of pendingEntries) {
        await syncToFirestore(entry);
      }
    } catch (err) {
      console.error('Error syncing pending entries:', err);
    }
  }, [userId, syncToFirestore]);

  // Keep ref updated for use in effects without triggering re-runs
  useEffect(() => {
    syncPendingEntriesRef.current = syncPendingEntries;
  }, [syncPendingEntries]);

  /**
   * Initial load effect - runs ONCE when userId is available
   */
  useEffect(() => {
    if (isAuthLoading) return;

    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // Prevent running multiple times
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    const loadInitialData = async () => {
      try {
        // Load from IndexedDB first (instant) - use ref to avoid dependency
        const localEntries = await loadLocalEntriesRef.current();
        setEntries(localEntries.map(localToJournalEntry));
        setLoading(false);

        if (localEntries.length > 0) {
          setOldestLoadedDate(localEntries[localEntries.length - 1].date);
        }

        // Check for unfixed sessions that should be fixed
        const today = format(new Date(), 'yyyy-MM-dd');
        let hasChanges = false;

        for (const entry of localEntries) {
          let entryChanged = false;

          for (const session of entry.sessions) {
            if (session.fixedAt === null && entry.date !== today) {
              // Fix old unfixed sessions
              session.fixedAt = new Date(session.startedAt.getTime() + FIX_TIMEOUT_MS);
              entryChanged = true;
            } else if (session.fixedAt === null && entry.date === today) {
              // Check if this session should be fixed
              const elapsed = Date.now() - session.startedAt.getTime();
              if (elapsed >= FIX_TIMEOUT_MS) {
                session.fixedAt = new Date(session.startedAt.getTime() + FIX_TIMEOUT_MS);
                entryChanged = true;
              } else {
                // Resume fix timer with remaining time
                lastEditTimeRef.current = session.startedAt;
                const remaining = FIX_TIMEOUT_MS - elapsed;
                // Don't set state here - avoid re-render

                fixTimerRef.current = setTimeout(async () => {
                  await fixCurrentSessionRef.current();
                }, remaining);

                // Update countdown every 30 seconds (minimal re-renders)
                countdownIntervalRef.current = setInterval(() => {
                  if (lastEditTimeRef.current) {
                    const elapsedNow = Date.now() - lastEditTimeRef.current.getTime();
                    const remainingNow = Math.max(0, FIX_TIMEOUT_MS - elapsedNow);
                    setTimeUntilFix(remainingNow);
                  }
                }, 30000); // Every 30 seconds, not every second!
              }
            }
          }

          // Only update entries that actually changed
          if (entryChanged) {
            await db.journalEntries.update(entry.id!, {
              sessions: entry.sessions,
              syncStatus: 'pending',
            });
            hasChanges = true;
          }
        }

        // Only sync if there were changes
        if (hasChanges) {
          await syncPendingEntriesRef.current();
        }
      } catch (err) {
        console.error('Error loading journal entries:', err);
        setError('Failed to load journal');
        setLoading(false);
      }
    };

    loadInitialData();

    // Cleanup timers on unmount
    return () => {
      if (fixTimerRef.current) clearTimeout(fixTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [userId, isAuthLoading]); // Minimal dependencies - only re-run when auth changes

  /**
   * Periodic sync + visibility/app state sync
   * Only syncs every SYNC_INTERVAL_MS, on page visibility change, and on app background
   */
  useEffect(() => {
    if (!userId) return;

    // Periodic sync interval (every 60 seconds)
    const syncInterval = setInterval(() => {
      syncPendingEntriesRef.current();
    }, SYNC_INTERVAL_MS);

    // Browser visibility change handler (tab hidden/visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncPendingEntriesRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Capacitor app state change handler (app goes to background)
    let appStateListener: { remove: () => void } | null = null;
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        // App is going to background - sync immediately
        syncPendingEntriesRef.current();
      }
    }).then((listener) => {
      appStateListener = listener;
    });

    // Cleanup
    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      appStateListener?.remove();
      // Final sync on unmount (use ref to get latest function)
      syncPendingEntriesRef.current();
    };
  }, [userId]); // Only depends on userId now!

  return {
    entries,
    todayEntry,
    activeSession,
    loading,
    error,
    hasMoreEntries,
    updateActiveSessionText,
    fixCurrentSession,
    loadOlderEntries,
    timeUntilFix,
  };
};
