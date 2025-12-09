import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

// Set ffmpeg path for Cloud Functions
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const speechClient = new SpeechClient();
const storage = new Storage();

/**
 * Convert audio buffer to LINEAR16 WAV format
 * Required because Speech-to-Text doesn't support AAC/MP4
 */
async function convertToLinear16Wav(inputBuffer: Buffer, inputFormat: string): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input-${Date.now()}.${inputFormat}`);
  const outputPath = path.join(tempDir, `output-${Date.now()}.wav`);

  try {
    // Write input buffer to temp file
    fs.writeFileSync(inputPath, inputBuffer);

    // Convert using ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioCodec('pcm_s16le') // LINEAR16 codec
        .audioChannels(1) // Mono
        .audioFrequency(16000) // 16kHz sample rate
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .save(outputPath);
    });

    // Read converted file
    const convertedBuffer = fs.readFileSync(outputPath);

    // Cleanup temp files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return convertedBuffer;
  } catch (error) {
    // Cleanup on error
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    throw error;
  }
}

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
      let audioBuffer = await file.download().then(([buffer]) => buffer);

      // 2. Determine audio encoding from mimeType
      const mimeType = message.metadata?.audioFormat || 'audio/webm';
      let encoding: string;
      let sampleRateHertz: number;
      let needsConversion = false;

      logger.info('Processing audio file', {
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
        // Google Speech-to-Text does NOT support AAC/MP4 directly
        // We need to convert to LINEAR16 WAV
        needsConversion = true;
        encoding = 'LINEAR16';
        sampleRateHertz = 16000;

        logger.info('AAC/MP4 detected - converting to LINEAR16 WAV');

        // Convert audio to LINEAR16 WAV
        const inputFormat = mimeType.includes('mp4') ? 'mp4' : 'm4a';
        audioBuffer = await convertToLinear16Wav(audioBuffer, inputFormat);

        logger.info('Audio conversion completed', {
          originalFormat: mimeType,
          convertedFormat: 'LINEAR16 WAV',
          convertedSize: audioBuffer.length,
        });
      } else {
        // Unknown format - try LINEAR16 conversion as fallback
        logger.warn('Unknown audio format, attempting LINEAR16 conversion', { mimeType });
        needsConversion = true;
        encoding = 'LINEAR16';
        sampleRateHertz = 16000;
        audioBuffer = await convertToLinear16Wav(audioBuffer, 'mp4');
      }

      logger.info('Using audio encoding', {
        encoding,
        sampleRateHertz,
        mimeType,
        needsConversion,
        detectedFormat:
          mimeType.includes('aac') || mimeType.includes('mp4')
            ? 'mobile (AAC/MP4 → LINEAR16)'
            : 'web (WebM)',
      });

      // 3. Prepare audio for Speech-to-Text
      // Convert to base64 (required by Speech-to-Text API)
      const audioContent = audioBuffer.toString('base64');

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
