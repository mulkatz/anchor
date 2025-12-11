# Temporal Awareness

**Status:** ✅ Implemented
**Version:** 1.0.0
**Last Updated:** December 11, 2025

---

## Overview

Temporal Awareness makes the AI chat **time-conscious**, enabling natural references to past conversations and creating a sense of continuity. The AI understands when messages were sent, acknowledges time gaps, and references events using natural language like "yesterday", "this morning", or "last week".

**Key Benefit:** Conversations feel more human and contextually aware, enhancing the therapeutic relationship.

---

## Features

### 1. **Time-Aware AI Context**

Every message includes a timestamp that the AI can see and reference:

```
[2 hours ago] User: "I'm feeling anxious"
[5 minutes ago] User: "It's getting worse"
[just now] User: "Help me calm down"

AI: "I can see you've been struggling with this for a couple hours now. Let's work through it together."
```

**Benefits:**

- AI tracks emotional progression over time
- Can reference specific past conversations
- Understands context better ("compared to earlier today...")

---

### 2. **Session Break Detection**

Automatically detects when user returns after **>4 hours** and prompts AI to acknowledge naturally:

```
User: [Returns after 2 days]
AI: "hey, good to hear from you again. how've things been since we last talked?"
```

**Session Gap Examples:**

- 5 hours → "after a 5-hour break"
- 2 days → "after 2 days"
- 1 week → "after a week"

---

### 3. **Increased Context Limits**

- **Message History:** 50 → **75 messages**
- **Audio Recording:** 60 → **120 seconds** (2 minutes)

More context = better therapeutic continuity and pattern recognition.

---

### 4. **UI Enhancements**

#### **Date Dividers**

Visual separators group messages by day:

```
─────── Today ───────
[Today's messages]

───── Yesterday ─────
[Yesterday's messages]

──── December 8 ────
[Older messages]
```

#### **Hover Timestamps**

Subtle timestamps appear on hover:

- Today: "3:42 PM"
- Yesterday: "Yesterday 10:15 AM"
- Older: "Dec 8 at 2:30 PM"

---

## Technical Implementation

### **Timezone & DST Support**

Full timezone awareness with daylight saving time (DST) support:

**Frontend sends:**

```typescript
metadata: {
  userLocalTime: Date.now(),                    // Epoch timestamp (ms)
  userTimezoneOffset: new Date().getTimezoneOffset(), // -60 for CET
  userTimezone: "Europe/Berlin"                 // IANA timezone identifier
}
```

**Backend uses:**

- User's local time for all temporal calculations
- `Intl.DateTimeFormat` with user's timezone for DST-aware formatting
- Handles summer/winter time transitions automatically

---

### **Temporal Functions**

#### **Frontend** (`app/src/utils/temporal.ts`)

```typescript
// Relative time for UI
getRelativeTimeForUI(date);
// → "5m", "3h", "Yesterday", "Dec 8"

// Full timestamp with context
getFullTimestamp(date);
// → "Yesterday 3:42 PM", "Dec 8 at 10:15 AM"

// Date divider text
getDateDivider(date);
// → "Today", "Yesterday", "December 8"
```

#### **Backend** (`backend/functions/src/temporal.ts`)

```typescript
// Relative time for AI context
getRelativeTimeForAI(date, now, timezone);
// → "2 hours ago (at 3:42 PM)", "yesterday at 10:15 AM"

// Current context for system prompt
getCurrentContextTimestamp(now, timezone);
// → "Today is Wednesday, December 11, 2025 at 4:06 PM"

// Time of day
getTimeOfDay(now, timezone);
// → "morning", "afternoon", "evening", "night"

// Session break detection
detectSessionBreak(lastMessageTime, now);
// → true if >4 hours gap

getSessionBreakDescription(lastMessageTime, now);
// → "after a 5-hour break", "after 2 days"
```

---

### **AI System Prompt Enhancement**

The AI receives temporal context in its system prompt:

```
Today is Wednesday, December 11, 2025 at 4:06 PM (afternoon)

Note: The user is returning to this conversation after a 5-hour break.
Acknowledge the time gap naturally if relevant (e.g., "hey, good to
hear from you again" or "how've you been since we last talked?").

IMPORTANT: You can now reference when things happened in your
conversation. Each message has a timestamp showing when it was sent
relative to now. Use this to make your responses more natural and
contextually aware (e.g., "you mentioned yesterday that...",
"earlier today you said...", "I remember you talked about this
last week...").
```

---

## Natural Language Examples

### **Time References**

- "you mentioned **yesterday** that work was stressing you out"
- "**this morning** you seemed more anxious"
- "I remember you talked about this **last week**"
- "how are you feeling compared to **earlier today**?"

### **Session Continuity**

- "good to hear from you again"
- "it's been a couple days - how've things been?"
- "welcome back! how did that situation work out?"

### **Pattern Recognition** (Future)

- "you often feel anxious on **Monday mornings**"
- "**last Tuesday** you mentioned similar feelings"
- "you seem calmer in the **afternoon** usually"

---

## Performance Considerations

### **Token Usage**

- Each message adds ~20-30 tokens for timestamp prefix
- 75 messages × 30 tokens = ~2,250 tokens for timestamps
- Total context: ~15-20k tokens (well within limits)

### **Firestore Reads**

- Single query fetches last 75 messages (orderBy + limit)
- No additional reads for temporal data
- Metadata stored in existing message documents

---

## Troubleshooting

### **Time is off by 1 hour**

- **Cause:** Daylight saving time (DST) issue
- **Fix:** Ensure `userTimezone` is sent from frontend
- **Check:** Backend logs should show "Using user local time for temporal context"

### **AI doesn't reference past messages**

- **Cause:** Not enough message history or timestamps not formatted correctly
- **Fix:** Check backend logs for temporal context in system prompt
- **Verify:** Message format should include `[relative time] message text`

### **Date dividers not appearing**

- **Cause:** Messages from same day or `isSameDay` logic issue
- **Fix:** Check ChatContainer.tsx:45 logic
- **Debug:** Console.log `message.createdAt` to verify Date objects

---

## Future Enhancements

### **Short-term**

- Weekly/monthly conversation summaries
- Emotion tracking over time graphs
- Pattern recognition alerts ("You often feel this way on Mondays")

### **Long-term**

- Long-term memory system (key facts persist beyond 75 messages)
- Proactive check-ins based on time patterns
- Smart context windowing (recent messages weighted more)
- Session threading (group related conversations)

---

## Files Modified

### **Frontend**

- `app/src/hooks/useChat.tsx` - Send timezone metadata
- `app/src/hooks/useVoiceRecorder.tsx` - 120s max recording
- `app/src/utils/temporal.ts` - ✨ New temporal utilities
- `app/src/components/features/chat/ChatContainer.tsx` - Date dividers
- `app/src/components/features/chat/DateDivider.tsx` - ✨ New component
- `app/src/components/features/chat/MessageBubble.tsx` - Pass timestamps
- `app/src/components/features/chat/UserMessage.tsx` - Show timestamps
- `app/src/components/features/chat/AssistantMessage.tsx` - Show timestamps
- `app/src/components/features/chat/AudioMessageBubble.tsx` - Show timestamps

### **Backend**

- `backend/functions/src/chat.ts` - Temporal awareness + 75 msg history
- `backend/functions/src/languageConfig.ts` - Dynamic system prompts
- `backend/functions/src/temporal.ts` - ✨ New timezone-aware utilities

---

## Related Documentation

- [Voice Chat](./voice-chat.md) - Audio messages include timestamps
- [AI Chat](./ai-chat.md) - How AI uses temporal context
- [Design Principles](../01-vision/design-principles.md) - Natural conversation

---

**Temporal Awareness turns the AI into a friend who remembers your history, not just a chatbot responding to isolated messages.** 🕐✨
