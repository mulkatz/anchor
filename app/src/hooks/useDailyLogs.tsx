import { useState, useEffect, useMemo } from 'react';
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
} from 'firebase/firestore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import i18next from 'i18next';

import { firestore, auth } from '../services/firebase.service';
import type { DailyLog, WeatherType } from '../models';
import { logAnalyticsEvent, AnalyticsEvent } from '../services/analytics.service';

export interface UseDailyLogsReturn {
  logs: DailyLog[];
  todayLog: DailyLog | null;
  loading: boolean;
  error: string | null;
  createLog: (data: Partial<DailyLog>) => Promise<string>;
  updateLog: (id: string, data: Partial<DailyLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

/**
 * Hook for managing daily journal logs (Tide Log feature)
 * Provides real-time Firestore sync and CRUD operations
 */
export const useDailyLogs = (): UseDailyLogsReturn => {
  const userId = auth.currentUser?.uid;
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Compute today's log from the logs array
  const todayLog = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return logs.find((log) => log.date === today) || null;
  }, [logs]);

  // Set up real-time listener for daily logs
  useEffect(() => {
    if (!userId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const logsRef = collection(firestore, `users/${userId}/daily_logs`);
    const q = query(
      logsRef,
      orderBy('date', 'desc'),
      limit(90) // Last 90 days (30 for reef, 60 extra for stream)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData = snapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId,
            date: data.date,
            mood_depth: data.mood_depth,
            weather: data.weather as WeatherType,
            note_text: data.note_text,
            is_released: data.is_released || false,
            timezone: data.timezone,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as DailyLog;
        });

        setLogs(logsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching daily logs:', err);
        setError(i18next.t('errors.tideLog.loadFailed'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  /**
   * Create a new daily log entry
   */
  const createLog = async (data: Partial<DailyLog>): Promise<string> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = Timestamp.now();

      const logsRef = collection(firestore, `users/${userId}/daily_logs`);
      const docRef = await addDoc(logsRef, {
        userId: userId,
        date: today,
        mood_depth: data.mood_depth ?? 50,
        weather: data.weather ?? 'clear',
        note_text: data.note_text ?? '',
        is_released: data.is_released ?? false,
        timezone,
        createdAt: now,
        updatedAt: now,
      });

      logAnalyticsEvent(AnalyticsEvent.TIDE_LOG_CREATED, {
        weather: data.weather,
        mood_depth: data.mood_depth,
        has_note: !!data.note_text,
        is_released: data.is_released,
      });

      return docRef.id;
    } catch (err) {
      console.error('Error creating daily log:', err);
      toast.error(i18next.t('errors.tideLog.saveFailed'));
      throw err;
    }
  };

  /**
   * Update an existing daily log entry
   */
  const updateLog = async (id: string, data: Partial<DailyLog>): Promise<void> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const logRef = doc(firestore, `users/${userId}/daily_logs/${id}`);
      const updateData: Record<string, any> = {
        updatedAt: Timestamp.now(),
      };

      if (data.mood_depth !== undefined) updateData.mood_depth = data.mood_depth;
      if (data.weather !== undefined) updateData.weather = data.weather;
      if (data.note_text !== undefined) updateData.note_text = data.note_text;
      if (data.is_released !== undefined) updateData.is_released = data.is_released;

      await updateDoc(logRef, updateData);

      logAnalyticsEvent(AnalyticsEvent.TIDE_LOG_UPDATED, {
        weather: data.weather,
        mood_depth: data.mood_depth,
        is_released: data.is_released,
      });
    } catch (err) {
      console.error('Error updating daily log:', err);
      toast.error(i18next.t('errors.tideLog.saveFailed'));
      throw err;
    }
  };

  /**
   * Delete a daily log entry
   */
  const deleteLog = async (id: string): Promise<void> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const logRef = doc(firestore, `users/${userId}/daily_logs/${id}`);
      await deleteDoc(logRef);

      logAnalyticsEvent(AnalyticsEvent.TIDE_LOG_DELETED);

      toast.success(i18next.t('tideLog.deleted'));
    } catch (err) {
      console.error('Error deleting daily log:', err);
      toast.error(i18next.t('errors.tideLog.deleteFailed'));
      throw err;
    }
  };

  return {
    logs,
    todayLog,
    loading,
    error,
    createLog,
    updateLog,
    deleteLog,
  };
};
