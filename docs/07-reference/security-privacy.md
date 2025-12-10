# Security & Privacy

**Read this when:** Security review, privacy policy updates, compliance considerations, data handling

---

## Data Storage Philosophy

**Principle:** Collect minimum necessary, protect maximum possible.

| Data Type         | Storage            | Retention                   |
| ----------------- | ------------------ | --------------------------- |
| **Conversations** | Firestore          | Permanent (user can delete) |
| **Voice audio**   | Cloud Storage      | 7 days auto-delete          |
| **Settings**      | LocalStorage       | Permanent (local)           |
| **Analytics**     | Firebase Analytics | Anonymized, opt-in          |

---

## User Data

### What We Collect

**Required:**

- Anonymous user ID (Firebase Auth)
- Conversation messages (for AI responses)
- Voice recordings (for transcription, deleted after 7 days)

**Optional (with consent):**

- Anonymous analytics events
- Feedback submissions
- App ratings

### What We DON'T Collect

- Name or email (anonymous auth)
- Location data
- Contact lists
- Health data beyond what user voluntarily shares in chat
- Device identifiers for tracking

---

## Firebase Security Rules

### Firestore Rules

**Principle:** Users can only access their own data.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User data - owner only
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // Feedback - create only, no read
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

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Audio - user-scoped, size/type limited
    match /audio-messages/{userId}/{allPaths=**} {
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('audio/.*');
      allow read: if request.auth != null
                  && request.auth.uid == userId;
    }

    // Profile photos - user-scoped
    match /profile-photos/{userId}/{allPaths=**} {
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

## Data Retention

| Data                 | Retention       | Reason                         |
| -------------------- | --------------- | ------------------------------ |
| **Voice recordings** | 7 days          | Privacy, minimize PHI exposure |
| **Transcribed text** | User-controlled | Part of conversation history   |
| **Analytics**        | 14 months       | Firebase default, anonymized   |
| **Crash logs**       | 90 days         | Debugging                      |

---

## User Data Rights

### Export Data

Users can export all their data:

- Conversations, messages
- Settings
- Profile information

**Implementation:** `dataManagement.ts` → `exportUserData()`

### Delete Data

**Clear Cache:** Removes temporary files
**Delete All Data:** Removes all conversations and messages
**Delete Account:** Removes Firebase Auth account and all data

**Implementation:** `dataManagement.ts`

---

## Permissions Required

| Permission        | Platform    | Usage                  | Required   |
| ----------------- | ----------- | ---------------------- | ---------- |
| **Haptics**       | All         | Therapeutic feedback   | Yes (core) |
| **Microphone**    | iOS/Android | Voice messages         | Optional   |
| **Camera**        | iOS/Android | Profile photo (future) | Optional   |
| **Notifications** | iOS/Android | Check-ins (future)     | Optional   |

### Permission Handling

- Request only when needed (not on first launch)
- Explain why permission is needed
- Work gracefully without permission

---

## Sensitive Data Handling

### Crisis Detection

- Keywords are checked locally and server-side
- Crisis state is flagged but not logged
- User messages containing crisis keywords are NOT shared externally

### Mental Health Data

- Considered PHI (Protected Health Information)
- Encrypted in transit (HTTPS)
- Encrypted at rest (Firebase)
- No third-party data sharing

---

## HIPAA Considerations

**Current Status:** NOT HIPAA compliant (not required for consumer app)

**If pursuing HIPAA:**

- Sign BAA with Google Cloud
- Implement audit logging
- Additional access controls
- Data encryption reviews
- Staff training

---

## Security Best Practices

### Client-Side

**Do:**

- Validate all user input
- Sanitize before display (XSS prevention)
- Use HTTPS only
- Implement rate limiting

**Don't:**

- Store sensitive data in localStorage
- Log sensitive information
- Trust client-side validation alone

### Server-Side (Cloud Functions)

**Do:**

- Validate auth tokens
- Check data ownership
- Limit resource usage
- Log security events

**Don't:**

- Expose admin credentials
- Trust client-submitted user IDs
- Allow unlimited file uploads

---

## Analytics Privacy

### What We Track (with consent)

```typescript
enum AnalyticsEvent {
  PAGE_VIEW = 'page_view',
  SOS_STARTED = 'sos_started',
  SOS_COMPLETED = 'sos_completed',
  MESSAGE_SENT = 'message_sent',
  // No PII, no message content
}
```

### What We DON'T Track

- Message content
- Voice recording content
- User identifiers
- Location
- Device IDs

### Opt-Out

Settings → Anonymous Analytics toggle disables all tracking.

---

## Incident Response (Plan)

1. **Detect:** Monitor for unusual activity
2. **Contain:** Disable affected services
3. **Assess:** Determine scope and impact
4. **Notify:** Inform affected users if required
5. **Remediate:** Fix vulnerability
6. **Review:** Post-incident analysis

---

## External Links

- [Firebase Security Documentation](https://firebase.google.com/docs/rules)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Apple App Privacy](https://developer.apple.com/app-store/app-privacy-details/)
- [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)

---

## See Also

- [Firebase Guide](../05-implementation/firebase.md) - Security rules
- [Profile Settings](../04-features/profile-settings.md) - Data management
- [Voice Chat](../04-features/voice-chat.md) - Audio data handling
