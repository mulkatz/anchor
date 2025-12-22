import { useState, useCallback, useEffect } from 'react';
import { doc, onSnapshot, setDoc, deleteField, Timestamp } from 'firebase/firestore';
import { firestore } from '../services/firebase.service';
import { useApp } from '../contexts/AppContext';
import type { UserStory, StoryFieldValue, StoryFieldWithHistory } from '../models';

/**
 * useUserStory Hook
 * Manages user story data with Firestore for real-time sync
 *
 * Note: No localStorage caching for privacy - story data stays in Firestore only
 */

/**
 * Create an empty user story structure
 */
const createEmptyStory = (userId: string): UserStory => ({
  userId,
  schemaVersion: '1.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  coreIdentity: {},
  lifeSituation: {},
  relationships: {},
  background: {},
  personal: {},
  therapeuticContext: {},
  strengths: {},
  extractionMeta: {
    questionsAskedCount: 0,
    topicsDiscovered: [],
    topicsToExplore: [],
    fieldsDeletedByUser: [],
  },
});

/**
 * Convert Firestore Timestamp to Date recursively
 */
function convertTimestamps(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;

  if (obj instanceof Timestamp) {
    return obj.toDate();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }

  const converted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = convertTimestamps(value);
  }
  return converted;
}

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Check if a field has history tracking
 */
function hasHistoryTracking(fieldPath: string): boolean {
  const historyFields = [
    'lifeSituation.occupation',
    'relationships.romanticStatus',
    'lifeSituation.currentLifePhase',
  ];
  return historyFields.includes(fieldPath);
}

export const useUserStory = () => {
  const { userId } = useApp();
  const [story, setStory] = useState<UserStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load and listen for real-time updates
  useEffect(() => {
    if (!userId) {
      setStory(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storyRef = doc(firestore, `users/${userId}/profile/userStory`);

    const unsubscribe = onSnapshot(
      storyRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Convert Firestore Timestamps to Dates
          const converted = convertTimestamps(data) as UserStory;
          setStory(converted);
        } else {
          // No story exists yet - return null (will be created on first extraction)
          setStory(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading user story:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  /**
   * Update a single field in the user story
   * Handles nested paths like "coreIdentity.name"
   */
  const updateField = useCallback(
    async <T,>(fieldPath: string, value: T) => {
      if (!userId) return;

      const storyRef = doc(firestore, `users/${userId}/profile/userStory`);
      const now = new Date();

      // Build the field value object
      const fieldValue: StoryFieldValue<T> = {
        value,
        confidence: 'explicit', // User edits are always explicit
        source: 'user_edit',
        learnedAt: now,
        lastConfirmed: now,
      };

      // For history-tracked fields, preserve history
      if (hasHistoryTracking(fieldPath) && story) {
        const existing = getNestedValue(story as unknown as Record<string, unknown>, fieldPath) as
          | StoryFieldWithHistory<T>
          | undefined;

        if (
          existing?.value !== undefined &&
          JSON.stringify(existing.value) !== JSON.stringify(value)
        ) {
          const history = existing.history || [];
          history.push({
            value: existing.value,
            changedAt: now,
            source: existing.source,
          });

          (fieldValue as StoryFieldWithHistory<T>).history = history.slice(-5); // Keep last 5
        }
      }

      // Remove from deleted fields if it was previously deleted
      const deletedFields = story?.extractionMeta?.fieldsDeletedByUser || [];
      const updatedDeletedFields = deletedFields.filter((f) => f !== fieldPath);

      try {
        await setDoc(
          storyRef,
          {
            [fieldPath]: fieldValue,
            updatedAt: now,
            'extractionMeta.fieldsDeletedByUser': updatedDeletedFields,
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to update user story field:', err);
        throw err;
      }
    },
    [userId, story]
  );

  /**
   * Delete (forget) a field from the user story
   */
  const forgetField = useCallback(
    async (fieldPath: string) => {
      if (!userId) return;

      const storyRef = doc(firestore, `users/${userId}/profile/userStory`);
      const now = new Date();

      // Add to deleted fields list to prevent re-extraction
      const deletedFields = story?.extractionMeta?.fieldsDeletedByUser || [];
      if (!deletedFields.includes(fieldPath)) {
        deletedFields.push(fieldPath);
      }

      try {
        await setDoc(
          storyRef,
          {
            [fieldPath]: deleteField(),
            updatedAt: now,
            'extractionMeta.fieldsDeletedByUser': deletedFields,
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to delete user story field:', err);
        throw err;
      }
    },
    [userId, story]
  );

  /**
   * Initialize an empty story document if needed
   */
  const initializeStory = useCallback(async () => {
    if (!userId || story) return;

    const storyRef = doc(firestore, `users/${userId}/profile/userStory`);
    const emptyStory = createEmptyStory(userId);

    try {
      await setDoc(storyRef, emptyStory);
    } catch (err) {
      console.error('Failed to initialize user story:', err);
      throw err;
    }
  }, [userId, story]);

  /**
   * Get a specific field's value
   */
  const getFieldValue = useCallback(
    <T,>(fieldPath: string): T | undefined => {
      if (!story) return undefined;
      const field = getNestedValue(story as unknown as Record<string, unknown>, fieldPath) as
        | StoryFieldValue<T>
        | undefined;
      return field?.value;
    },
    [story]
  );

  /**
   * Get a specific field with full metadata
   */
  const getField = useCallback(
    <T,>(fieldPath: string): StoryFieldValue<T> | StoryFieldWithHistory<T> | undefined => {
      if (!story) return undefined;
      return getNestedValue(story as unknown as Record<string, unknown>, fieldPath) as
        | StoryFieldValue<T>
        | StoryFieldWithHistory<T>
        | undefined;
    },
    [story]
  );

  /**
   * Check if a field has been deleted by user (shouldn't be re-extracted)
   */
  const isFieldDeleted = useCallback(
    (fieldPath: string): boolean => {
      return story?.extractionMeta?.fieldsDeletedByUser?.includes(fieldPath) || false;
    },
    [story]
  );

  /**
   * Get count of known fields
   */
  const getKnownFieldCount = useCallback((): number => {
    return story?.extractionMeta?.topicsDiscovered?.length || 0;
  }, [story]);

  return {
    story,
    isLoading,
    error,
    updateField,
    forgetField,
    initializeStory,
    getFieldValue,
    getField,
    isFieldDeleted,
    getKnownFieldCount,
  };
};
