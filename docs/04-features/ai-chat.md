# AI Chat Feature

**Read this when:** Implementing AI chat responses, understanding crisis detection, working with Gemini AI, or debugging therapeutic conversation flow.

---

## Overview

Therapeutic AI conversations powered by Google Vertex AI (Gemini 2.5 Flash). Built on Cognitive Behavioral Therapy (CBT) and Acceptance and Commitment Therapy (ACT) principles to provide immediate emotional support during anxiety episodes.

**Status:** ✅ Implemented

---

## Why AI Chat?

Traditional therapy isn't always available during anxiety episodes. AI chat provides:

- **24/7 Availability** - Support whenever needed, no appointments
- **Immediate Response** - No waiting, instant therapeutic guidance
- **Non-Judgmental** - Safe space for expression without fear
- **CBT/ACT Techniques** - Evidence-based therapeutic approaches
- **Crisis Detection** - Automatic identification of high-risk situations

---

## Technical Architecture

### AI Model

**Platform:** Google Vertex AI
**Model:** Gemini 2.5 Flash
**Why Gemini 2.5 Flash?**

- Fast response times (< 2 seconds)
- Strong reasoning capabilities
- Cost-effective for high-volume usage
- Multimodal support (future: image analysis)

---

## Message Flow

```
User sends message (text or voice) →
Firestore message created →
Cloud Function triggered (onDocumentWritten) →
Crisis keyword detection →
[If crisis] Show crisis resources card →
Generate AI prompt with CBT/ACT context →
Call Gemini API →
Stream response to Firestore →
User sees AI reply in real-time
```

---

## Crisis Detection

### Keyword System

**Critical:** Crisis keywords are checked on ALL user messages (text and transcribed voice).

**Implementation:** `/backend/functions/src/chat.ts`

```typescript
const CRISIS_KEYWORDS = [
  /\b(suicide|suicidal|kill myself|end (my )?life)\b/i,
  /\b(hurt myself|self[- ]?harm|cutting)\b/i,
  /\b(don'?t want to live|rather be dead)\b/i,
  /\b(no reason to live|nothing to live for)\b/i,
];

const hasCrisisKeyword = CRISIS_KEYWORDS.some((regex) => regex.test(message.text));
```

### Crisis Resources Card

When crisis keywords detected:

1. **Immediate Response**
   - Show crisis resources card BEFORE AI response
   - Prominent display of hotlines (988, 911)
   - Heavy haptic feedback to get attention

2. **Card Content**
   - 988 (24/7 Crisis Hotline)
   - 911 (Emergency)
   - "You're not alone" reassurance
   - One-tap to call (native) or copy number (web)

3. **AI Response Modified**
   - More supportive, less solution-focused
   - Encourages professional help
   - Validates feelings without dismissing crisis

**Location:** `/app/src/components/features/chat/CrisisResourcesCard.tsx`

---

## Therapeutic Prompt Design

### System Prompt

**Goal:** Establish AI as supportive, non-judgmental companion using evidence-based techniques.

**Key Elements:**

1. **Identity**
   - "You are Anchor, a compassionate AI companion"
   - NOT a therapist or medical professional
   - Provides emotional support and coping strategies

2. **Therapeutic Framework**
   - CBT: Identify and challenge negative thought patterns
   - ACT: Accept emotions, commit to values-based actions
   - Grounding techniques when appropriate

3. **Tone**
   - Warm, empathetic, non-judgmental
   - Gen Z-friendly (informal but not juvenile)
   - Validating without being patronizing

4. **Boundaries**
   - Clear limitations (not therapy)
   - Encourage professional help when needed
   - Never diagnose or prescribe

**Example System Prompt:**

```typescript
const SYSTEM_PROMPT = `You are Anchor, a compassionate AI companion designed to support people experiencing anxiety and panic attacks.

Your role:
- Provide immediate emotional support using CBT and ACT techniques
- Help users ground themselves during anxiety episodes
- Validate feelings while gently challenging catastrophic thinking
- Encourage connection with professional help when appropriate

Your tone:
- Warm, empathetic, and non-judgmental
- Conversational and Gen Z-friendly
- Validating without being patronizing

Important boundaries:
- You are NOT a therapist or medical professional
- Never diagnose or prescribe medication
- Encourage users to seek professional help for serious concerns
- In crisis situations, direct to 988 or 911

Techniques to use:
- Thought challenging (CBT)
- Acceptance of emotions (ACT)
- Grounding exercises (5-4-3-2-1)
- Breathing techniques
- Mindfulness practices`;
```

---

## Response Generation

### Cloud Function

**Location:** `/backend/functions/src/chat.ts`

**Trigger:** `onDocumentWritten` (fires on message create/update)

**Flow:**

1. **Check if user message**

   ```typescript
   if (message.role !== 'user') return;
   ```

2. **Wait for transcription if voice message**

   ```typescript
   if (message.hasAudio && message.transcriptionStatus === 'pending') {
     return; // Wait for transcription to complete
   }
   ```

3. **Crisis detection**

   ```typescript
   const hasCrisisKeyword = CRISIS_KEYWORDS.some((regex) => regex.test(message.text));

   if (hasCrisisKeyword) {
     await addCrisisResourcesCard();
   }
   ```

4. **Build conversation context**

   ```typescript
   const conversationHistory = await getRecentMessages(conversationId, 10);
   const context = conversationHistory.map((msg) => ({
     role: msg.role,
     content: msg.text,
   }));
   ```

5. **Call Gemini API**

   ```typescript
   const response = await gemini.generateContent({
     contents: [
       { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
       ...context,
       { role: 'user', parts: [{ text: message.text }] },
     ],
     generationConfig: {
       temperature: 0.8, // Creative but not random
       topP: 0.9,
       maxOutputTokens: 500, // Keep responses concise
     },
   });
   ```

6. **Save AI response to Firestore**
   ```typescript
   await addDoc(messagesRef, {
     userId,
     conversationId,
     text: response.text,
     role: 'assistant',
     createdAt: Timestamp.now(),
   });
   ```

---

## Frontend Implementation

### Chat Interface

**Location:** `/app/src/components/features/chat/ChatWindow.tsx`

**Features:**

- Real-time message updates (Firestore listeners)
- Auto-scroll to latest message
- Loading indicator while AI generates response
- Typing indicator (optional)
- Message bubbles with glass morphism styling

---

### Message Components

**UserMessage:** `/app/src/components/features/chat/UserMessage.tsx`

- Right-aligned
- Bioluminescent cyan accent (`biolum-cyan`)
- Glass morphism background
- Shows timestamp on long-press

**AssistantMessage:** `/app/src/components/features/chat/AssistantMessage.tsx`

- Left-aligned
- Subtle white/glass styling
- Icon: AI assistant avatar
- Shows timestamp on long-press

**AudioMessageBubble:** (See [Voice Chat Feature](voice-chat.md))

- Transcription states: pending, completed, failed
- Styled to match UserMessage

**CrisisResourcesCard:**

- Special styling: warm-ember accents
- Prominent call-to-action buttons
- Heavy haptic feedback on tap
- Always visible (doesn't scroll away)

---

## Analytics Events

Track these events for monitoring and improvement:

- `CHAT_MESSAGE_SENT` - User sends message (text or voice)
- `AI_RESPONSE_GENERATED` - AI response successfully generated
- `CRISIS_DETECTED` - Crisis keyword detected in message
- `CRISIS_RESOURCES_SHOWN` - Crisis card displayed
- `CRISIS_HOTLINE_CALLED` - User taps 988/911 button
- `CONVERSATION_STARTED` - New conversation created
- `CONVERSATION_ARCHIVED` - Conversation moved to vault

---

## Firestore Data Model

### Collections Structure

```
users/{userId}/
  ├── conversations/{conversationId}/
  │   ├── title: string
  │   ├── createdAt: Timestamp
  │   ├── updatedAt: Timestamp
  │   ├── archived: boolean
  │   └── messages/{messageId}/
  │       ├── text: string
  │       ├── role: 'user' | 'assistant'
  │       ├── hasAudio?: boolean
  │       ├── audioPath?: string
  │       ├── transcriptionStatus?: 'pending' | 'completed' | 'failed'
  │       ├── confidence?: number
  │       └── createdAt: Timestamp
```

### Security Rules

**Location:** `/backend/firestore.rules`

```javascript
match /users/{userId}/conversations/{conversationId} {
  allow read, write: if request.auth != null
                     && request.auth.uid == userId;

  match /messages/{messageId} {
    allow read: if request.auth != null
                && request.auth.uid == userId;

    // Only users can write user messages
    allow create: if request.auth != null
                  && request.auth.uid == userId
                  && request.resource.data.role == 'user';

    // Only Cloud Functions can write assistant messages
    allow create: if request.auth.token.admin == true
                  && request.resource.data.role == 'assistant';

    // Only Cloud Functions can update messages (transcription)
    allow update: if request.auth.token.admin == true;
  }
}
```

---

## Cost Optimization

### Token Management

**Current Config:**

- `maxOutputTokens: 500` (approx 375 words)
- Concise responses reduce cost and improve UX

**Context Window:**

- Include last 10 messages for context
- Balance: Enough context vs. token cost

**Future:**

- Intelligent context pruning
- Summarize old conversations
- Remove redundant exchanges

---

### Caching (Future Enhancement)

**Google AI Caching:**

- Cache system prompt (reused across conversations)
- Cache user profile data
- Reduces tokens per request
- Significant cost savings at scale

---

## Testing Checklist

### Message Flow

- [ ] User text message sends successfully
- [ ] User voice message sends and transcribes
- [ ] AI response generates within 2 seconds
- [ ] Messages appear in correct order
- [ ] Real-time updates work (no refresh needed)

### Crisis Detection

- [ ] Crisis keywords trigger resources card
- [ ] Card appears BEFORE AI response
- [ ] Heavy haptic feedback on card appearance
- [ ] 988 button opens dialer (native) or copies (web)
- [ ] 911 button opens dialer (native) or copies (web)
- [ ] Analytics events fire correctly

### AI Quality

- [ ] Responses are empathetic and supportive
- [ ] CBT techniques used when appropriate
- [ ] Boundaries maintained (no diagnosis)
- [ ] Tone is Gen Z-friendly but professional
- [ ] Responses under 500 tokens

### Error Handling

- [ ] Network errors handled gracefully
- [ ] Retry logic for failed API calls
- [ ] User informed of errors
- [ ] Messages saved locally when offline

---

## Future Enhancements

### Conversation Features

- [ ] Edit/delete messages
- [ ] Conversation branching (save at checkpoints)
- [ ] Search conversation history
- [ ] Export conversations

### AI Improvements

- [ ] Personalized responses (based on user history)
- [ ] Proactive check-ins (with user permission)
- [ ] Multi-modal input (images, audio analysis)
- [ ] Voice output (text-to-speech responses)

### Analytics

- [ ] Track therapeutic technique effectiveness
- [ ] Measure anxiety reduction over time
- [ ] A/B test prompt variations
- [ ] User feedback on response quality

---

## See Also

- [Voice Chat Feature](voice-chat.md) - Voice message transcription
- [Profile Settings](profile-settings.md) - Crisis resources in settings
- [Firebase Setup](../05-implementation/firebase.md) - Cloud Functions, Firestore
- [i18n Guide](../05-implementation/i18n-guide.md) - Translating chat UI
