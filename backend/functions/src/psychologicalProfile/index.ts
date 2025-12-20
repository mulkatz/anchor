/**
 * Psychological Profile Cloud Functions
 *
 * Entry points for psychological profile generation and management.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';

import { createOrUpdateProfile } from './profileUpdate';
import { SupportedLanguage, PsychologicalProfile } from './types';

// Define the admin key secret
const profileAdminKey = defineSecret('PROFILE_ADMIN_KEY');

/**
 * Cloud Function: createPsychologicalProfile
 *
 * Creates or updates a psychological profile for a user.
 * Protected by an admin key for testing purposes.
 *
 * Parameters:
 * - userId: The user ID to generate profile for
 * - adminKey: Admin key for authorization
 * - language: Language for profile generation ('en-US' or 'de-DE')
 *
 * Returns:
 * - The generated/updated psychological profile
 */
export const createPsychologicalProfile = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300, // 5 minutes for comprehensive profile generation
    secrets: [profileAdminKey],
  },
  async (request): Promise<PsychologicalProfile> => {
    const { userId, adminKey, language = 'en-US' } = request.data || {};

    // Validate admin key
    const expectedKey = profileAdminKey.value();
    if (!adminKey || adminKey !== expectedKey) {
      logger.warn('Invalid admin key attempt', {
        providedKeyPrefix: adminKey?.slice(0, 4) + '...',
      });
      throw new HttpsError('permission-denied', 'Invalid admin key');
    }

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new HttpsError('invalid-argument', 'userId is required and must be a string');
    }

    // Validate language
    const validLanguages: SupportedLanguage[] = ['en-US', 'de-DE'];
    const selectedLanguage: SupportedLanguage = validLanguages.includes(language)
      ? language
      : 'en-US';

    logger.info('Creating psychological profile', {
      userId,
      language: selectedLanguage,
      caller: request.auth?.uid || 'anonymous',
    });

    try {
      const profile = await createOrUpdateProfile(userId, selectedLanguage);

      logger.info('Psychological profile created successfully', {
        userId,
        version: profile.version,
        weeklyNotesCount: profile.historicalChronicle.weeklyNotes.length,
        milestonesCount: profile.historicalChronicle.milestones.length,
      });

      return profile;
    } catch (error) {
      logger.error('Failed to create psychological profile', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof Error && error.message.includes('Insufficient data')) {
        throw new HttpsError('failed-precondition', error.message);
      }

      throw new HttpsError(
        'internal',
        `Failed to create psychological profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
);

// Re-export types for external use
export * from './types';
