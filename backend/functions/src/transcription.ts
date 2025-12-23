import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { trackUsage, flushUsage } from './usage';

// Set ffmpeg path for Cloud Functions
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const speechClient = new SpeechClient();
const storage = new Storage();

// Threshold for using long-running recognition (60 seconds of audio)
// Google's synchronous recognize() API has a ~60 second limit
const LONG_AUDIO_THRESHOLD_BYTES = 960000; // ~60s at 16kHz 16-bit mono
const LONG_AUDIO_BUCKET = 'anxiety-buddy-0.firebasestorage.app'; // Use existing bucket

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
 * Transcribe long audio using longRunningRecognize
 * Required for audio > 60 seconds (Google's synchronous API limit)
 *
 * Process:
 * 1. Upload audio to GCS (required for long-running recognition)
 * 2. Start async recognition operation
 * 3. Poll for completion
 * 4. Clean up GCS file
 */
async function transcribeLongAudio(
  audioBuffer: Buffer,
  config: {
    encoding: string;
    sampleRateHertz: number;
    languageCode: string;
  },
  context: { userId: string; messageId: string }
): Promise<{ transcription: string; confidence: number }> {
  const tempGcsPath = `temp-transcription/${context.userId}/${context.messageId}-${Date.now()}.wav`;
  const bucket = storage.bucket(LONG_AUDIO_BUCKET);
  const tempFile = bucket.file(tempGcsPath);

  try {
    logger.info('Starting long audio transcription', {
      userId: context.userId,
      messageId: context.messageId,
      audioSize: audioBuffer.length,
      gcsPath: tempGcsPath,
    });

    // 1. Upload audio to GCS
    await tempFile.save(audioBuffer, {
      contentType: 'audio/wav',
      metadata: {
        purpose: 'transcription',
        userId: context.userId,
        messageId: context.messageId,
      },
    });

    logger.info('Audio uploaded to GCS for long-running recognition', {
      gcsPath: tempGcsPath,
    });

    // 2. Start long-running recognition
    const gcsUri = `gs://${LONG_AUDIO_BUCKET}/${tempGcsPath}`;

    const [operation] = await speechClient.longRunningRecognize({
      config: {
        encoding: config.encoding as any, // LINEAR16, WEBM_OPUS, etc.
        sampleRateHertz: config.sampleRateHertz,
        languageCode: config.languageCode,
        model: 'latest_long',
        enableAutomaticPunctuation: true,
        useEnhanced: true,
        profanityFilter: false,
      },
      audio: {
        uri: gcsUri,
      },
    });

    logger.info('Long-running recognition started', {
      operationName: operation.name,
    });

    // 3. Wait for operation to complete (with timeout)
    const [response] = await operation.promise();

    // 4. Extract transcription
    const transcription =
      response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .join('\n')
        .trim() || '';

    const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;

    logger.info('Long-running recognition completed', {
      transcriptionLength: transcription.length,
      confidence,
    });

    return { transcription, confidence };
  } finally {
    // 5. Clean up GCS file (always, even on error)
    try {
      await tempFile.delete();
      logger.info('Cleaned up temporary GCS file', { gcsPath: tempGcsPath });
    } catch (cleanupError) {
      // Don't fail transcription if cleanup fails
      logger.warn('Failed to clean up temporary GCS file', {
        gcsPath: tempGcsPath,
        error: cleanupError,
      });
    }
  }
}

/**
 * Shared transcription logic
 * Used by both conversation and dive session audio messages
 *
 * Automatically chooses between:
 * - recognize() for short audio (<60s) - fast, synchronous
 * - longRunningRecognize() for long audio (>60s) - async, no time limit
 */
async function transcribeAudioMessage(
  message: admin.firestore.DocumentData,
  messageDocPath: string,
  context: { type: 'conversation' | 'dive'; userId: string; sessionId: string; messageId: string }
): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Get audio file from Cloud Storage
    const bucketName = process.env.GCLOUD_PROJECT + '.firebasestorage.app';
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(message.audioPath);

    logger.info('Looking for audio file', {
      bucketName,
      audioPath: message.audioPath,
      type: context.type,
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
      needsConversion = true;
      encoding = 'LINEAR16';
      sampleRateHertz = 16000;

      logger.info('AAC/MP4 detected - converting to LINEAR16 WAV');

      const inputFormat = mimeType.includes('mp4') ? 'mp4' : 'm4a';
      audioBuffer = await convertToLinear16Wav(audioBuffer, inputFormat);

      logger.info('Audio conversion completed', {
        originalFormat: mimeType,
        convertedFormat: 'LINEAR16 WAV',
        convertedSize: audioBuffer.length,
      });
    } else {
      logger.warn('Unknown audio format, attempting LINEAR16 conversion', { mimeType });
      needsConversion = true;
      encoding = 'LINEAR16';
      sampleRateHertz = 16000;
      audioBuffer = await convertToLinear16Wav(audioBuffer, 'mp4');
    }

    // 3. Get language from message metadata
    const languageCode = message.metadata?.language || 'en-US';

    // Determine if we need long-running recognition
    const isLongAudio = audioBuffer.length > LONG_AUDIO_THRESHOLD_BYTES;

    logger.info('Audio analysis', {
      encoding,
      sampleRateHertz,
      mimeType,
      needsConversion,
      audioSize: audioBuffer.length,
      isLongAudio,
      languageCode,
      detectedFormat:
        mimeType.includes('aac') || mimeType.includes('mp4')
          ? 'mobile (AAC/MP4 → LINEAR16)'
          : 'web (WebM)',
    });

    let transcription: string;
    let confidence: number;

    if (isLongAudio) {
      // 4a. Long audio: Use longRunningRecognize (async, no time limit)
      logger.info('Using long-running recognition for audio > 60s', {
        audioSize: audioBuffer.length,
        estimatedDuration: `${Math.round(audioBuffer.length / 16000)}s`,
      });

      const result = await transcribeLongAudio(
        audioBuffer,
        { encoding, sampleRateHertz, languageCode },
        { userId: context.userId, messageId: context.messageId }
      );
      transcription = result.transcription;
      confidence = result.confidence;
    } else {
      // 4b. Short audio: Use synchronous recognize (fast, <60s)
      logger.info('Using synchronous recognition for short audio');

      const audioContent = audioBuffer.toString('base64');

      const [response] = await speechClient.recognize({
        config: {
          encoding: encoding as any,
          sampleRateHertz,
          languageCode,
          model: 'latest_long',
          enableAutomaticPunctuation: true,
          useEnhanced: true,
          profanityFilter: false,
        },
        audio: {
          content: audioContent,
        },
      });

      transcription =
        response.results
          ?.map((result) => result.alternatives?.[0]?.transcript)
          .join('\n')
          .trim() || '';

      confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;
    }

    logger.info('Transcription completed', {
      messageId: context.messageId,
      type: context.type,
      transcription: transcription.substring(0, 100),
      confidence,
      duration: Date.now() - startTime,
      method: isLongAudio ? 'longRunningRecognize' : 'recognize',
    });

    // 7. Update Firestore message with transcription
    const messageRef = admin.firestore().doc(messageDocPath);

    await messageRef.update({
      text: transcription,
      transcriptionStatus: 'completed',
      'metadata.transcriptionConfidence': confidence,
      'metadata.transcriptionTime': Date.now() - startTime,
      'metadata.lowConfidenceWarning': confidence < 0.6,
    });

    logger.info('Transcription saved to Firestore', {
      messageId: context.messageId,
      type: context.type,
      confidence,
      lowConfidence: confidence < 0.6,
    });

    // Track speech-to-text usage
    trackUsage({
      userId: context.userId,
      timestamp: new Date(),
      service: 'speech_to_text',
      feature: 'transcription',
      audioDurationMs: message.audioDuration || 0,
      isLongRunning: isLongAudio,
    });

    // Track storage download
    trackUsage({
      userId: context.userId,
      timestamp: new Date(),
      service: 'cloud_storage',
      feature: context.type === 'dive' ? 'dive_audio' : 'audio_messages',
      operation: 'download',
      bytes: audioBuffer.length,
    });

    // Flush usage tracking
    await flushUsage(context.userId);
  } catch (error: any) {
    logger.error('Transcription failed - Full error details', {
      messageId: context.messageId,
      type: context.type,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      errorMetadata: error.metadata,
      fullError: JSON.stringify(error, null, 2),
      stack: error.stack,
    });

    // Mark transcription as failed in Firestore
    try {
      const messageRef = admin.firestore().doc(messageDocPath);

      await messageRef.update({
        transcriptionStatus: 'failed',
        text: '[Transcription failed]',
        'metadata.transcriptionError': error.message,
      });
    } catch (updateError) {
      logger.error('Failed to update message with error status', {
        messageId: context.messageId,
        error: updateError,
      });
    }
  }
}

/**
 * Cloud Function: Transcribe Audio Messages (Conversations)
 * Triggers when a new message with hasAudio=true is created in conversations
 */
export const onAudioMessageCreate = onDocumentCreated(
  {
    document: 'users/{userId}/conversations/{conversationId}/messages/{messageId}',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 540, // 9 minutes for long audio (up to 10 min recording)
  },
  async (event) => {
    const message = event.data?.data();
    if (!message || !message.hasAudio) {
      return;
    }

    const { userId, conversationId, messageId } = event.params;

    logger.info('Starting conversation audio transcription', {
      userId,
      conversationId,
      messageId,
      audioPath: message.audioPath,
    });

    const docPath = `users/${userId}/conversations/${conversationId}/messages/${messageId}`;
    await transcribeAudioMessage(message, docPath, {
      type: 'conversation',
      userId,
      sessionId: conversationId,
      messageId,
    });
  }
);

/**
 * Cloud Function: Transcribe Audio Messages (Dive Sessions)
 * Triggers when a new message with hasAudio=true is created in dive sessions
 */
export const onDiveAudioMessageCreate = onDocumentCreated(
  {
    document: 'users/{userId}/dive_sessions/{sessionId}/messages/{messageId}',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 540, // 9 minutes for long audio (up to 10 min recording)
  },
  async (event) => {
    const message = event.data?.data();
    if (!message || !message.hasAudio) {
      return;
    }

    const { userId, sessionId, messageId } = event.params;

    logger.info('Starting dive audio transcription', {
      userId,
      sessionId,
      messageId,
      audioPath: message.audioPath,
    });

    const docPath = `users/${userId}/dive_sessions/${sessionId}/messages/${messageId}`;
    await transcribeAudioMessage(message, docPath, {
      type: 'dive',
      userId,
      sessionId,
      messageId,
    });
  }
);

/**
 * Transcription response interface
 */
interface TranscriptionResponse {
  text: string;
  confidence: number;
}

/**
 * Cloud Function: Transcribe Audio (Callable)
 * Direct transcription without persistence - returns text immediately
 * Used for speech-to-text in textareas (Illuminate, etc.)
 */
export const transcribeAudioCallable = onCall(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (request): Promise<TranscriptionResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { audioBase64, mimeType, language } = request.data || {};

    if (!audioBase64) {
      throw new HttpsError('invalid-argument', 'audioBase64 is required');
    }

    const userId = request.auth.uid;
    const startTime = Date.now();

    logger.info('Starting direct audio transcription', {
      userId,
      mimeType,
      language,
      audioSize: audioBase64.length,
    });

    try {
      // 1. Convert base64 to buffer
      let audioBuffer: Buffer = Buffer.from(audioBase64, 'base64') as Buffer;

      // 2. Determine encoding and convert if needed
      const audioMimeType = mimeType || 'audio/m4a';
      let encoding: string;
      let sampleRateHertz: number;

      if (audioMimeType.includes('webm') || audioMimeType.includes('opus')) {
        encoding = 'WEBM_OPUS';
        sampleRateHertz = 48000;
      } else if (audioMimeType.includes('ogg')) {
        encoding = 'OGG_OPUS';
        sampleRateHertz = 48000;
      } else if (
        audioMimeType.includes('aac') ||
        audioMimeType.includes('mp4') ||
        audioMimeType.includes('m4a') ||
        audioMimeType.includes('audio/mpeg')
      ) {
        // AAC/MP4/M4A needs conversion to LINEAR16
        encoding = 'LINEAR16';
        sampleRateHertz = 16000;

        logger.info('Converting AAC/MP4 to LINEAR16 WAV');
        const inputFormat = audioMimeType.includes('mp4') ? 'mp4' : 'm4a';
        audioBuffer = await convertToLinear16Wav(audioBuffer, inputFormat);
      } else {
        // Unknown format - try LINEAR16 conversion
        logger.warn('Unknown audio format, attempting LINEAR16 conversion', {
          mimeType: audioMimeType,
        });
        encoding = 'LINEAR16';
        sampleRateHertz = 16000;
        audioBuffer = await convertToLinear16Wav(audioBuffer, 'm4a');
      }

      // 3. Prepare audio content
      const audioContent = audioBuffer.toString('base64');
      const languageCode = language || 'en-US';

      logger.info('Calling Speech-to-Text API', {
        encoding,
        sampleRateHertz,
        languageCode,
        bufferSize: audioBuffer.length,
      });

      // 4. Call Google Cloud Speech-to-Text API
      const [response] = await speechClient.recognize({
        config: {
          encoding: encoding as any,
          sampleRateHertz,
          languageCode,
          model: 'latest_long',
          enableAutomaticPunctuation: true,
          useEnhanced: true,
          profanityFilter: false,
        },
        audio: {
          content: audioContent,
        },
      });

      // 5. Extract transcription and confidence
      const text =
        response.results
          ?.map((result) => result.alternatives?.[0]?.transcript)
          .join(' ')
          .trim() || '';

      const confidence = response.results?.[0]?.alternatives?.[0]?.confidence || 0;

      logger.info('Direct transcription completed', {
        userId,
        textLength: text.length,
        confidence,
        duration: Date.now() - startTime,
      });

      // Track speech-to-text usage for callable transcription
      // Note: We don't have exact duration, estimate from buffer size
      // Rough estimate: 16kHz * 2 bytes * seconds = buffer size
      const estimatedDurationMs = (audioBuffer.length / 32) * 1000; // Very rough estimate

      trackUsage({
        userId,
        timestamp: new Date(),
        service: 'speech_to_text',
        feature: 'transcription',
        audioDurationMs: estimatedDurationMs,
        isLongRunning: false,
      });

      // Flush usage tracking
      await flushUsage(userId);

      return { text, confidence };
    } catch (error: any) {
      logger.error('Direct transcription failed', {
        userId,
        errorMessage: error.message,
        errorCode: error.code,
        stack: error.stack,
      });

      throw new HttpsError('internal', 'Transcription failed: ' + error.message);
    }
  }
);
