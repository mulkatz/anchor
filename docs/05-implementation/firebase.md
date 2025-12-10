# Firebase Integration

**Read this when:** Working with Firestore, Auth, Cloud Storage, Cloud Functions, database queries

---

## Services Used

| Service             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| **Firestore**       | NoSQL database (conversations, messages, feedback) |
| **Authentication**  | User identity (anonymous auth)                     |
| **Cloud Storage**   | Audio files, profile photos                        |
| **Cloud Functions** | Backend logic (transcription, AI chat)             |

---

## Firestore Data Structure

```
/users/{userId}
  /conversations/{conversationId}
    - createdAt: Timestamp
    - updatedAt: Timestamp
    - title: string (optional)
    - messageCount: number

    /messages/{messageId}
      - userId: string
      - conversationId: string
      - text: string
      - role: 'user' | 'assistant' | 'system'
      - createdAt: Timestamp
      - hasAudio?: boolean
      - audioPath?: string
      - audioDuration?: number
      - transcriptionStatus?: 'pending' | 'completed' | 'failed'
      - transcriptionConfidence?: number
      - hasCrisis?: boolean
      - metadata?: object

  /profile/{profileId}
    - displayName: string
    - photoURL: string | null
    - createdAt: Timestamp
    - updatedAt: Timestamp

/feedback/{feedbackId}
  - userId: string
  - kind: 'idea' | 'bug'
  - text: string
  - timestamp: Timestamp
  - platform: string
  - appVersion: string
  - resolved: boolean
```

---

## Authentication

### Anonymous Auth

Currently using anonymous authentication - users get auto-generated IDs.

**Setup:**

```typescript
// firebase.service.ts
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

export const initAuth = () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      await signInAnonymously(auth);
    }
  });
};
```

**Getting Current User:**

```typescript
import { useApp } from '@/contexts/AppContext';

const { user } = useApp();
const userId = user?.uid;
```

---

## Firestore Queries

### Get Conversations

```typescript
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const useConversations = (userId: string) => {
  useEffect(() => {
    const q = query(collection(db, 'users', userId, 'conversations'), orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(conversations);
    });

    return () => unsubscribe();
  }, [userId]);
};
```

### Get Messages (Real-time)

```typescript
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const useMessages = (userId: string, conversationId: string) => {
  useEffect(() => {
    const q = query(
      collection(db, 'users', userId, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [userId, conversationId]);
};
```

### Create Message

```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const sendMessage = async (text: string) => {
  await addDoc(collection(db, 'users', userId, 'conversations', conversationId, 'messages'), {
    userId,
    conversationId,
    text,
    role: 'user',
    createdAt: serverTimestamp(),
  });
};
```

---

## Cloud Storage

### Audio Messages

**Path:** `audio-messages/{userId}/{conversationId}/{messageId}.m4a`

**Upload:**

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadAudio = async (blob: Blob, messageId: string) => {
  const audioRef = ref(storage, `audio-messages/${userId}/${conversationId}/${messageId}.m4a`);

  await uploadBytes(audioRef, blob, {
    contentType: 'audio/mp4',
  });

  return getDownloadURL(audioRef);
};
```

**Retention:** Auto-delete after 7 days (lifecycle rule)

### Profile Photos

**Path:** `profile-photos/{userId}/{fileName}`

**Max size:** 2MB
**Formats:** image/\*

---

## Cloud Functions

### Transcription Function

**Trigger:** `onDocumentCreated` - when message with `hasAudio: true` is created

**Location:** `/backend/functions/src/transcription.ts`

**Flow:**

1. Download audio from Cloud Storage
2. Convert AAC/MP4 to LINEAR16 WAV (ffmpeg)
3. Call Google Speech-to-Text API
4. Update message with transcription

```typescript
export const onAudioMessageCreate = onDocumentCreated(
  'users/{userId}/conversations/{conversationId}/messages/{messageId}',
  async (event) => {
    const message = event.data?.data();
    if (!message?.hasAudio || message.transcriptionStatus !== 'pending') {
      return;
    }
    // Transcription logic...
  }
);
```

### AI Chat Function

**Trigger:** `onDocumentWritten` - when message is created or updated

**Location:** `/backend/functions/src/chat.ts`

**Flow:**

1. Check if user message needs response
2. Skip if transcription still pending
3. Check for crisis keywords
4. Generate AI response via Vertex AI (Gemini)
5. Create assistant message

```typescript
export const onMessageWrite = onDocumentWritten(
  'users/{userId}/conversations/{conversationId}/messages/{messageId}',
  async (event) => {
    const message = event.data?.after?.data();
    if (message?.role !== 'user') return;
    if (message?.transcriptionStatus === 'pending') return;
    // AI response logic...
  }
);
```

---

## Security Rules

### Firestore Rules

**Location:** `/backend/firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // Feedback - users can create only
    match /feedback/{feedbackId} {
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.text.size() <= 1000;
      allow read, update, delete: if false;
    }
  }
}
```

### Storage Rules

**Location:** `/backend/storage.rules`

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Audio messages - user-scoped
    match /audio-messages/{userId}/{conversationId}/{messageId} {
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('audio/.*');
      allow read: if request.auth != null
                  && request.auth.uid == userId;
    }

    // Profile photos
    match /profile-photos/{userId}/{fileName} {
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
      allow read: if request.auth != null
                  && request.auth.uid == userId;
    }
  }
}
```

---

## Deployment

### Deploy Functions

```bash
cd backend
firebase deploy --only functions
```

### Deploy Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Deploy All

```bash
firebase deploy
```

---

## Local Development

### Emulators (Future)

```bash
firebase emulators:start
```

**Ports:**

- Firestore: 8080
- Auth: 9099
- Storage: 9199
- Functions: 5001

---

## Error Handling

### Firestore Errors

```typescript
try {
  await addDoc(collection(db, 'messages'), data);
} catch (error) {
  if (error.code === 'permission-denied') {
    // User not authenticated
  } else if (error.code === 'unavailable') {
    // Network error - queue for retry
  }
}
```

### Common Error Codes

| Code                | Meaning                       |
| ------------------- | ----------------------------- |
| `permission-denied` | Security rules blocked access |
| `unavailable`       | Network/server unavailable    |
| `not-found`         | Document doesn't exist        |
| `already-exists`    | Document already exists       |

---

## See Also

- [Voice Chat Feature](../04-features/voice-chat.md) - Audio transcription
- [AI Chat Feature](../04-features/ai-chat.md) - Gemini integration
- [Profile Settings](../04-features/profile-settings.md) - Data management
- [Tech Stack](../03-architecture/tech-stack.md) - Firebase dependencies
