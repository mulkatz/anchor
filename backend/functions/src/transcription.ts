import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

const speechClient = new SpeechClient();
const storage = new Storage();

/**
 * Cloud Function: Transcribe Audio Messages
 * Triggers when a new message with hasAudio=true is created
 * Transcribes audio using Google Cloud Speech-to-Text API
 */
export const onAudioMessageCreate = onDocumentCreated(
  {
    document: 'users/{userId}/conversations/{conversationId}/messages/{messageId}',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 120, // 2 minutes max for transcription
  },
  async (event) => {
    const message = event.data?.data();
    if (!message || !message.hasAudio) {
      // Not an audio message, skip
      return;
    }

    const { userId, conversationId } = event.params;
    const messageId = event.params.messageId;

    logger.info('Starting audio transcription', {
      userId,
      conversationId,
      messageId,
      audioPath: message.audioPath,
    });

    const startTime = Date.now();

    try {
      // 1. Get audio file from Cloud Storage
      // Use the default Firebase Storage bucket (new format: .firebasestorage.app)
      const bucketName = process.env.GCLOUD_PROJECT + '.firebasestorage.app';
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(message.audioPath);

      logger.info('Looking for audio file', {
        bucketName,
        audioPath: message.audioPath,
      });

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`Audio file not found: ${message.audioPath}`);
      }

      // Download audio file
      logger.info('Downloading audio file from Cloud Storage');
      const [audioBuffer] = await file.download();

      // 2. Prepare audio for Speech-to-Text
      // Convert to base64 (required by Speech-to-Text API)
      const audioContent = audioBuffer.toString('base64');

      // 3. Determine audio encoding from mimeType
      const mimeType = message.metadata?.audioFormat || 'audio/webm';
      let encoding: string;
      let sampleRateHertz: number;

      logger.info('Calling Speech-to-Text API - Initial detection', {
        audioFormat: mimeType,
        audioSize: audioBuffer.length,
        audioPath: message.audioPath,
      });

      // Map mimeType to Speech-to-Text encoding
      // Android typically records as audio/mp4 or audio/aac
      // iOS records as audio/mp4 or audio/m4a
      // Web records as audio/webm with opus codec
      if (mimeType.includes('webm') || mimeType.includes('opus')) {
        encoding = 'WEBM_OPUS';
        sampleRateHertz = 48000;
      } else if (mimeType.includes('ogg')) {
        encoding = 'OGG_OPUS';
        sampleRateHertz = 48000;
      } else if (
        mimeType.includes('aac') ||
        mimeType.includes('mp4') ||
        mimeType.includes('m4a') ||
        mimeType.includes('audio/mpeg')
      ) {
        // Android and iOS use AAC in MP4 container
        // Note: Google Speech-to-Text does NOT support AAC directly
        // We need to use ENCODING_UNSPECIFIED and let Google auto-detect
        encoding = 'ENCODING_UNSPECIFIED';
        sampleRateHertz = 16000; // Try 16kHz for mobile audio
      } else {
        // Fallback: Let Google auto-detect
        logger.warn('Unknown audio format, using auto-detection', { mimeType });
        encoding = 'ENCODING_UNSPECIFIED';
        sampleRateHertz = 16000;
      }

      logger.info('Using audio encoding', {
        encoding,
        sampleRateHertz,
        mimeType,
        detectedFormat:
          mimeType.includes('aac') || mimeType.includes('mp4') ? 'mobile (AAC/MP4)' : 'web (WebM)',
      });

      // 4. Call Google Cloud Speech-to-Text API
      const [response] = await speechClient.recognize({
        config: {
          encoding: encoding as any,
          sampleRateHertz,
          languageCode: 'en-US',
          model: 'latest_long', // Enhanced model for conversational speech
          enableAutomaticPunctuation: true,
          useEnhanced: true, // Use enhanced model for better accuracy
          // Don't filter profanity - need to preserve crisis keywords
          profanityFilter: false,
        },
        audio: {
          content: audioContent,
        },
      });

      // 5. Extract transcription and confidence
      const transcription =
        response.results
          ?.map((result) => result.alternatives?.[0]?.transcript)
          .join('\n')
          .trim() || '';

      const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;

      logger.info('Transcription completed', {
        messageId,
        transcription: transcription.substring(0, 100), // Log first 100 chars
        confidence,
        duration: Date.now() - startTime,
      });

      // 6. Update Firestore message with transcription
      const messageRef = admin
        .firestore()
        .doc(`users/${userId}/conversations/${conversationId}/messages/${messageId}`);

      await messageRef.update({
        text: transcription,
        transcriptionStatus: 'completed',
        'metadata.transcriptionConfidence': confidence,
        'metadata.transcriptionTime': Date.now() - startTime,
        'metadata.lowConfidenceWarning': confidence < 0.6,
      });

      logger.info('Transcription saved to Firestore', {
        messageId,
        confidence,
        lowConfidence: confidence < 0.6,
      });

      // 7. Note: onMessageCreate will now be triggered with the transcribed text
      // This will generate the AI response automatically
    } catch (error: any) {
      // Log detailed error information
      logger.error('Transcription failed - Full error details', {
        messageId,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorMetadata: error.metadata,
        fullError: JSON.stringify(error, null, 2),
        stack: error.stack,
      });

      // Mark transcription as failed in Firestore
      try {
        const messageRef = admin
          .firestore()
          .doc(`users/${userId}/conversations/${conversationId}/messages/${messageId}`);

        await messageRef.update({
          transcriptionStatus: 'failed',
          text: '[Transcription failed]',
          'metadata.transcriptionError': error.message,
        });
      } catch (updateError) {
        logger.error('Failed to update message with error status', {
          messageId,
          error: updateError,
        });
      }

      // Don't throw - we've already marked the message as failed
      // This prevents Cloud Functions from retrying indefinitely
    }
  }
);
