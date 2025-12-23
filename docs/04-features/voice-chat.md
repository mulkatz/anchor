# Voice Chat Feature

**Read this when:** Implementing or debugging voice message recording, understanding transcription flow, working with Cloud Storage, or troubleshooting audio issues.

---

## Overview

WhatsApp-style voice messaging designed for users who find typing difficult during anxiety episodes. Voice messages are recorded, uploaded to Cloud Storage, transcribed using Google Cloud Speech-to-Text, and processed through the AI therapeutic response pipeline.

**Status:** ✅ Implemented

---

## Why Voice Chat?

During panic attacks or high anxiety, typing is cognitively overwhelming. Voice input provides:

- **Lower cognitive load** - Speaking is easier than typing during distress
- **Natural expression** - Voice captures emotion and urgency better than text
- **Accessibility** - Helps users with motor difficulties or visual impairments
- **Speed** - Faster than typing, especially on mobile

---

## Complete Architecture Flow

```
User clicks mic → Recording starts (10 min max) → User clicks again →
Upload to Cloud Storage → Firestore message (pending) →
Transcription Cloud Function triggers →
  (Short audio <60s): recognize() → instant result
  (Long audio >60s): longRunningRecognize() → GCS upload → poll for result →
Update message (completed) → onMessageCreate triggers →
Crisis detection → Gemini AI response → User sees transcription + AI reply
```

---

## Frontend Implementation

### Recording Plugin

**Library:** `capacitor-voice-recorder` v7.0.6

**Platform Support:**

- **iOS:** Records AAC format
- **Android:** Platform-dependent (usually AAC/MP4)
- **Web:** WebM/Opus format

**Configuration:**

- **Max duration:** 600 seconds (10 minutes) - allows extended voice journaling
- **UI pattern:** Click-to-start, click-to-stop (simplified from hold-to-record)
- **Auto-cutoff:** Recording stops automatically at 10 minutes

---

### Key Components

#### 1. useVoiceRecorder Hook

**Location:** `/app/src/hooks/useVoiceRecorder.tsx`

**Responsibilities:**

- Manages recording lifecycle (start, stop, cancel)
- Handles microphone permissions
- Tracks duration with auto-cutoff at 10 minutes (600s)
- Converts base64 audio to Blob for upload
- Integrates haptic feedback (selection patterns)

**State:**

```typescript
interface RecordingState {
  isRecording: boolean;
  duration: number;
  hasPermission: boolean;
  error: string | null;
}
```

**Key Functions:**

```typescript
startRecording(): Promise<void>
stopRecording(): Promise<RecordingData>
cancelRecording(): void
requestPermission(): Promise<boolean>
```

**Haptic Integration:**

- Selection start when recording begins
- Selection changed during recording (optional)
- Selection end when recording stops

---

#### 2. ChatInput Component

**Location:** `/app/src/components/features/chat/ChatInput.tsx`

**Features:**

- **Dynamic button:** Shows mic when input empty, send when text present
- **Click once to start**, click again to stop and send
- **Visual feedback:** Pulsing red dot during recording
- **Duration display:** Shows elapsed time (MM:SS)

**Implementation:**

```typescript
{isRecording ? (
  <button onClick={stopAndSendRecording}>
    <Mic className="text-danger animate-pulse" />
    <span>{formatDuration(duration)}</span>
  </button>
) : (
  <button onClick={inputEmpty ? startRecording : sendTextMessage}>
    {inputEmpty ? <Mic /> : <Send />}
  </button>
)}
```

---

#### 3. AudioMessageBubble Component

**Location:** `/app/src/components/features/chat/AudioMessageBubble.tsx`

**Three States:**

**1. Transcribing (`transcriptionStatus: 'pending'`)**

- Animated waveform (pulsing bars)
- Text: "Transcribing your message..."
- Shows duration badge
- Loading indicator

**2. Completed (`transcriptionStatus: 'completed'`)**

- Displays transcribed text
- Small waveform badge (visual indicator)
- Duration + confidence percentage
- Styled to match UserMessage bubble

**3. Failed (`transcriptionStatus: 'failed'`)**

- Error message
- Retry option (fallback to text input)
- Warning icon
- Clear error messaging

**Styling:**

- Same width as UserMessage (consistent UI)
- Glass morphism background
- Bioluminescent accents
- Proper margins and padding

---

### Upload Flow

**Location:** `/app/src/hooks/useChat.tsx`

```typescript
const sendVoiceMessage = async (recordingData: RecordingData) => {
  const messageId = crypto.randomUUID();
  const audioPath = `audio-messages/${userId}/${conversationId}/${messageId}.m4a`;

  // 1. Upload to Cloud Storage
  const storageRef = ref(storage, audioPath);
  await uploadBytes(storageRef, recordingData.blob, {
    contentType: recordingData.mimeType,
  });

  // 2. Create Firestore message
  await addDoc(messagesRef, {
    userId,
    conversationId,
    text: '', // Empty until transcribed
    role: 'user',
    hasAudio: true,
    audioPath,
    audioDuration: recordingData.duration,
    transcriptionStatus: 'pending',
    createdAt: Timestamp.now(),
    metadata: {
      audioFormat: recordingData.mimeType,
      platform: Capacitor.getPlatform(),
    },
  });
};
```

---

## Backend Implementation

### Cloud Storage Setup

**Bucket:** `anxiety-buddy-0.firebasestorage.app` (new Firebase Storage format)

**Path Structure:**

```
audio-messages/
  {userId}/
    {conversationId}/
      {messageId}.m4a
```

**Retention Policy:**

- Audio files auto-delete after 7 days
- Privacy + cost optimization
- Transcribed text persists in Firestore

**Security Rules:** `/backend/storage.rules`

```javascript
match /audio-messages/{userId}/{conversationId}/{messageId} {
  allow write: if request.auth != null
               && request.auth.uid == userId
               && request.resource.size < 5 * 1024 * 1024  // 5MB max
               && request.resource.contentType.matches('audio/.*');

  allow read: if request.auth != null
              && request.auth.uid == userId;
}
```

---

### Transcription Cloud Function

**Location:** `/backend/functions/src/transcription.ts`

**Trigger:** `onDocumentCreated` on message creation

**Function Settings:**

- **Memory:** 512MiB
- **Timeout:** 540 seconds (9 minutes) - supports 10-minute audio

**Flow:**

1. **Download audio from Cloud Storage**

   ```typescript
   const audioBuffer = await bucket.file(audioPath).download();
   ```

2. **Determine encoding from mimeType**
   - Web: WEBM_OPUS or OGG_OPUS
   - Mobile: AAC/MP4 → Requires conversion

3. **CRITICAL: Audio Format Conversion**
   - Google Speech-to-Text does NOT support AAC/MP4 directly
   - Convert AAC/MP4 → LINEAR16 WAV using `fluent-ffmpeg`
   - Conversion: pcm_s16le codec, mono, 16kHz sample rate

4. **Choose Transcription Method Based on Audio Length**

   ```typescript
   const isLongAudio = audioBuffer.length > 960000; // ~60s of audio

   if (isLongAudio) {
     // Long audio (>60s): Use longRunningRecognize
     // 1. Upload to GCS temp location
     // 2. Start async recognition with GCS URI
     // 3. Poll for completion
     // 4. Clean up GCS file
     const result = await transcribeLongAudio(audioBuffer, config);
   } else {
     // Short audio (<60s): Use synchronous recognize
     const [response] = await speechClient.recognize({
       config: { encoding, sampleRateHertz, languageCode, ... },
       audio: { content: audioBuffer.toString('base64') },
     });
   }
   ```

   **Why two methods?**
   - Google's `recognize()` has a ~60 second limit for inline audio
   - `longRunningRecognize()` supports hours of audio but requires GCS URI
   - Same pricing for both ($0.006-0.009 per 15 seconds)

5. **Update Firestore message with transcription**
   ```typescript
   await messageRef.update({
     text: transcription,
     transcriptionStatus: 'completed',
     confidence: response.results[0].alternatives[0].confidence,
   });
   ```

---

### Audio Format Conversion (Server-Side)

**Why needed:** Android and iOS record in AAC/MP4 format, which Google Speech-to-Text API does NOT support.

**Implementation:**

```typescript
async function convertToLinear16Wav(inputBuffer: Buffer, inputFormat: string): Promise<Buffer> {
  const inputPath = `/tmp/input-${Date.now()}.${inputFormat}`;
  const outputPath = `/tmp/output-${Date.now()}.wav`;

  // Write input buffer to temp file
  await fs.writeFile(inputPath, inputBuffer);

  // Convert with ffmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('wav')
      .audioCodec('pcm_s16le') // LINEAR16 codec
      .audioChannels(1) // Mono
      .audioFrequency(16000) // 16kHz sample rate
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });

  // Read converted file
  const outputBuffer = await fs.readFile(outputPath);

  // Cleanup temp files
  await fs.unlink(inputPath);
  await fs.unlink(outputPath);

  return outputBuffer;
}
```

**Dependencies:**

- `fluent-ffmpeg`: ^2.1.3
- `@ffmpeg-installer/ffmpeg`: ^1.1.0

---

### Speech-to-Text Configuration

**API:** Google Cloud Speech-to-Text v2

**Configuration:**

- **Model:** `latest_long` (enhanced for conversational speech)
- **Language:** `en-US` (future: auto-detect with alternativeLanguageCodes)
- **Sample Rate:**
  - 48kHz for web audio (WebM/Opus)
  - 16kHz for mobile audio (converted LINEAR16 WAV)
- **Encoding:** Dynamic based on platform
  - Web: `WEBM_OPUS` or `OGG_OPUS`
  - Android/iOS: `LINEAR16` (after conversion from AAC/MP4)
- **Features:**
  - Automatic punctuation: **ON**
  - Profanity filter: **OFF** (preserves crisis keywords)
  - Enhanced models: **ON**

---

### AI Response Trigger

**Location:** `/backend/functions/src/chat.ts`

**Trigger:** `onDocumentWritten` (fires on both create AND update)

**Logic:**

```typescript
// Message created with transcriptionStatus: 'pending' → Skip
if (message.transcriptionStatus === 'pending') {
  console.log('Waiting for transcription...');
  return;
}

// Message updated to transcriptionStatus: 'completed' → Process with AI
if (message.transcriptionStatus === 'completed' && message.text) {
  await generateAIResponse(message);
}
```

**Why `onDocumentWritten` instead of `onCreate`?**

- Handles both initial message creation and transcription updates
- Ensures AI responds after transcription completes, not before
- Single function for all message processing

---

## Security & Privacy

### Permissions

**iOS:** `/app/native/ios/App/App/Info.plist`

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Record voice messages to communicate with your anxiety support buddy</string>
```

**Android:** `/app/native/android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

### Data Retention

**7-Day Audio Deletion:**

- Cloud Storage lifecycle rule auto-deletes after 7 days
- Transcribed text persists indefinitely in Firestore
- Minimizes PHI (Protected Health Information) exposure
- HIPAA compliance consideration

**Implementation:**

```json
// firebase.json
{
  "storage": {
    "rules": "storage.rules",
    "lifecycleRules": [
      {
        "action": { "type": "Delete" },
        "condition": {
          "age": 7,
          "matchesPrefix": ["audio-messages/"]
        }
      }
    ]
  }
}
```

---

### GCP IAM Permissions

**Required Role:** Cloud Speech Client (`roles/speech.client`)

**Grant to:** Cloud Functions service account

**Command:**

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/speech.client"
```

---

## Cost Analysis

### Pricing (as of Dec 2024)

- **Speech-to-Text:** $0.036 per minute (enhanced model)
- **Cloud Storage:** $0.020/GB/month (minimal, 7-day retention)
- **Cloud Functions:** Included in Firebase pricing
- **Bandwidth:** Negligible for audio files

### Example Cost (1000 active users)

**Assumptions:**

- 10 voice messages per user per month
- Average 30 seconds per message

**Calculation:**

- Total minutes: 1000 users × 10 msgs × 0.5 min = 5,000 minutes/month
- **Transcription cost:** 5,000 × $0.036 = **$180/month**
- **Per user:** $0.18/month

### Cost Optimization Strategies

1. **Rate limiting:** Max 20 voice messages per user per day
2. **Client-side silence detection:** Trim silence before upload
3. **10-minute max duration:** Enforced at client level
4. **Smart method selection:** Short audio uses fast `recognize()`, only long audio pays GCS overhead
5. **Future: On-device transcription** (iOS Speech Framework, Android SpeechRecognizer) - **FREE**
   - Tradeoff: 80-90% accuracy vs. 95%+ (cloud)

---

## Crisis Detection

**Critical:** Voice messages are transcribed BEFORE crisis keyword detection.

```typescript
// In transcription.ts - after transcription completes
await messageRef.update({
  text: transcription, // Now contains transcribed text
  transcriptionStatus: 'completed',
});

// This triggers onDocumentWritten in chat.ts
// Crisis keywords are checked on the transcribed text:
const hasCrisisKeyword = CRISIS_KEYWORDS.some((regex) => regex.test(message.text));

if (hasCrisisKeyword) {
  // Show crisis resources card immediately
  await addCrisisResourcesCard();
}
```

**Ensures:** Crisis detection works identically for voice and text messages.

---

## Error Handling

| Error                            | Detection                                     | User Feedback                                           | System Action                     |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| **Mic permission denied**        | `hasAudioRecordingPermission()` returns false | "Microphone access required. Enable in Settings?"       | Show settings deep link           |
| **Recording fails**              | `startRecording()` throws                     | "Unable to start recording. Please try again."          | Fallback to text input            |
| **Upload failure**               | `uploadBytes()` throws                        | "Connection issue. Retrying..."                         | Retry 3 times, then queue locally |
| **Low transcription confidence** | `confidence < 0.6`                            | "Audio was unclear. Transcription may not be accurate." | Show warning banner               |
| **Transcription API error**      | Speech-to-Text throws                         | `transcriptionStatus: 'failed'` in message              | Log error, show retry option      |
| **Network offline**              | Browser check                                 | "You're offline. Recording saved locally."              | Queue for sync when online        |

---

## Key Files Reference

### Frontend

- `/app/src/hooks/useVoiceRecorder.tsx` - Recording state machine
- `/app/src/hooks/useChat.tsx` - sendVoiceMessage function
- `/app/src/components/features/chat/ChatInput.tsx` - Mic/send toggle button
- `/app/src/components/features/chat/AudioMessageBubble.tsx` - Transcription UI
- `/app/src/models/index.ts` - Message interface with voice fields
- `/app/native/ios/App/App/Info.plist` - iOS microphone permission
- `/app/native/android/app/src/main/AndroidManifest.xml` - Android mic permission

### Backend

- `/backend/functions/src/transcription.ts` - Speech-to-Text Cloud Function
- `/backend/functions/src/chat.ts` - AI response trigger (onDocumentWritten)
- `/backend/storage.rules` - Cloud Storage security rules
- `/backend/firebase.json` - Storage rules + lifecycle config

---

## Testing Checklist

### Frontend

- [ ] Microphone permission dialog appears on first use
- [ ] Recording starts on first click, stops on second click
- [ ] Button shows pulsing red dot during recording
- [ ] Duration counter updates every second
- [ ] Auto-cutoff at 10 minutes works
- [ ] Cancel button stops recording without sending

### Upload & Storage

- [ ] Audio uploads to Cloud Storage successfully
- [ ] Firestore message created with `pending` status
- [ ] Audio file path correct in message document
- [ ] File size under 5MB limit enforced

### Transcription

- [ ] Short audio (<60s) transcribes quickly via `recognize()`
- [ ] Long audio (>60s) transcribes via `longRunningRecognize()`
- [ ] Transcription appears in chat bubble
- [ ] Confidence percentage displayed
- [ ] Low confidence warning shows when < 60%
- [ ] Failed state shows retry option
- [ ] 10-minute recording transcribes successfully

### AI Response

- [ ] AI responds to transcribed text
- [ ] Crisis keywords detected in transcribed voice messages
- [ ] Crisis resources card shown when appropriate

### Cross-Platform

- [ ] Works on iOS (AAC format)
- [ ] Works on Android (platform audio format)
- [ ] Works on web (WebM format)
- [ ] Offline queuing works (message saved locally)

---

## Future Enhancements

### On-Device Transcription (Cost Savings)

**iOS:** Apple Speech Framework

- Free, offline
- <1s latency
- 85-90% accuracy

**Android:** SpeechRecognizer API

- Free, offline
- Platform-dependent accuracy
- 80-90% accuracy

**Tradeoff:** Lower accuracy vs. zero cost

---

### Multi-Language Support

- Auto-detect language with Speech-to-Text API's `alternativeLanguageCodes`
- Update crisis keyword lists for each language
- Fallback to English if language not supported

---

### Audio Playback

- Allow users to replay their own voice messages
- Download from Cloud Storage on-demand
- Playback controls: play, pause, scrub
- Waveform visualization

---

### Streaming Transcription

- Use Speech-to-Text Streaming API for real-time transcription
- Show text as user speaks (reduces perceived latency)
- Requires WebSocket connection
- More complex implementation

---

## See Also

- [AI Chat Feature](ai-chat.md) - Therapeutic AI response generation
- [Firebase Setup](../05-implementation/firebase.md) - Cloud Functions, Storage, Firestore
- [Haptics Implementation](../05-implementation/haptics.md) - Selection feedback patterns
- [i18n Guide](../05-implementation/i18n-guide.md) - Translating voice UI strings
