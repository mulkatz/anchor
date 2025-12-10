# Troubleshooting

**Read this when:** Debugging issues, investigating bugs, common problems

---

## Haptics Not Working

### Symptom

No vibration feedback when tapping buttons or triggering SOS.

### Causes & Solutions

**1. Using Simulator/Emulator**

- Simulators don't support haptics
- **Solution:** Test on real device

**2. Haptics Disabled in Settings**

- Check Settings → Therapeutic Haptics toggle
- **Solution:** Enable haptics

**3. Device Doesn't Support Haptics**

- Old devices (pre-iPhone 7, pre-Android 8)
- **Solution:** Use newer device

**4. Plugin Not Installed**

```bash
cd app
npm list @capacitor/haptics
# If not listed:
npm install @capacitor/haptics
npx cap sync
```

**5. iOS Specific**

- Check Silent Mode isn't blocking haptics
- System Settings → Sounds & Haptics → Enable haptic feedback

---

## Animations Janky/Stuttering

### Symptom

Animations drop frames, feel choppy.

### Causes & Solutions

**1. Animating Wrong Properties**

- ❌ Don't animate: `width`, `height`, `top`, `left`, `margin`
- ✅ Do animate: `transform`, `opacity`

```tsx
// BAD
<div style={{ width: isOpen ? '300px' : '0' }} />

// GOOD
<div style={{ transform: isOpen ? 'scaleX(1)' : 'scaleX(0)' }} />
```

**2. Too Much Backdrop Blur**

- Backdrop blur is GPU-intensive
- **Solution:** Use `backdrop-blur-glass` (12px), not heavy values

**3. Missing GPU Acceleration**

```tsx
// Add to animated elements
<div className="will-change-transform">
```

**4. Chrome DevTools Check**

1. Open DevTools → Performance tab
2. Record interaction
3. Look for red frames (dropped)
4. Check for Layout/Paint operations

---

## Safe Areas Not Working

### Symptom

Content overlaps notch or home indicator.

### Causes & Solutions

**1. Plugin Not Installed**

```bash
npm list tailwindcss-safe-area
# If not listed:
npm install tailwindcss-safe-area
```

**2. Tailwind Config Missing**

```typescript
// tailwind.config.ts
export default {
  plugins: [require('tailwindcss-safe-area')],
};
```

**3. Not Using Safe Area Classes**

```tsx
// Add to page containers
<div className="pt-safe pb-safe">
```

**4. Testing Wrong Device**

- Use iPhone X or newer (has notch)
- Or enable safe areas in simulator

---

## Voice Recording Fails

### Symptom

Microphone doesn't start, or recording is empty.

### Causes & Solutions

**1. Permission Denied**

- User denied microphone permission
- **Solution:** Guide to Settings → Privacy → Microphone

**2. iOS Info.plist Missing**

```xml
<!-- app/native/ios/App/App/Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>Anxiety Buddy uses your microphone for voice messages</string>
```

**3. Android Manifest Missing**

```xml
<!-- app/native/android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

**4. Web Browser Issues**

- Some browsers require HTTPS for microphone
- **Solution:** Use localhost (allowed) or deploy with HTTPS

---

## Transcription Fails

### Symptom

Voice messages stuck on "Transcribing..." forever.

### Causes & Solutions

**1. Cloud Function Not Deployed**

```bash
cd backend
firebase deploy --only functions
```

**2. Speech-to-Text API Not Enabled**

- GCP Console → APIs → Enable Speech-to-Text API

**3. Service Account Missing Permissions**

- Add "Cloud Speech Client" role to Cloud Functions service account

**4. Audio Format Issue**

- Check Cloud Function logs:

```bash
firebase functions:log
```

**5. Network Error**

- Check user's internet connection
- Message will show `transcriptionStatus: 'failed'`

---

## Firebase Permission Denied

### Symptom

Firestore writes fail with "permission-denied" error.

### Causes & Solutions

**1. User Not Authenticated**

```typescript
// Check auth state
import { getAuth } from 'firebase/auth';
const user = getAuth().currentUser;
console.log('User:', user?.uid);
```

**2. Security Rules Too Strict**

```javascript
// Check firestore.rules
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null
                     && request.auth.uid == userId;
}
```

**3. Rules Not Deployed**

```bash
firebase deploy --only firestore:rules
```

**4. Wrong Collection Path**

- Ensure path matches rules exactly
- `users/{userId}/conversations/{conversationId}/messages/{messageId}`

---

## Build Failures

### "Module not found"

```bash
# Clear cache and reinstall
rm -rf node_modules
rm -rf app/node_modules
npm install
cd app && npm install
```

### iOS Build Fails

**1. Pod Install**

```bash
cd app/native/ios
pod install --repo-update
```

**2. Xcode Version**

- Ensure Xcode 15+
- Update Command Line Tools

**3. Clean Build**

- Xcode → Product → Clean Build Folder

### Android Build Fails

**1. Gradle Clean**

```bash
cd app/native/android
./gradlew clean
```

**2. SDK Version**

- Check `minSdkVersion` in `build.gradle`
- Should be 22+

**3. Clear Gradle Cache**

```bash
rm -rf ~/.gradle/caches/
```

---

## Hot Reload Not Working

### Symptom

Changes don't appear in browser/simulator.

### Causes & Solutions

**1. Dev Server Not Running**

```bash
cd app && npm run dev
```

**2. Wrong URL**

- Browser: `http://localhost:5173`
- Capacitor: Check `capacitor.config.ts` server URL

**3. Caching Issue**

- Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Clear browser cache

**4. File Not in Watch Path**

- Check file is in `/app/src/`
- Files outside src/ aren't watched

---

## i18n Issues

### Missing Translations (Shows Key)

**Symptom:** Screen shows `profile.title` instead of "Profile"

**Causes & Solutions:**

**1. Key Not in Translation File**

- Check `/app/src/assets/translations/en-US.json`
- Add missing key

**2. i18n Not Initialized**

```typescript
// main.tsx
import { initI18n } from './utils/i18n';
initI18n();
```

**3. Wrong Namespace**

- Check key path matches JSON structure

### German Text Missing

**Symptom:** German shows English fallback

**Solution:**

- Add key to `/app/src/assets/translations/de-DE.json`
- See [i18n Guide](../05-implementation/i18n-guide.md)

---

## Memory Issues

### App Crashes/Freezes

**1. Memory Leak**

- Check for missing cleanup in useEffect

```typescript
useEffect(() => {
  const unsubscribe = subscribe();
  return () => unsubscribe(); // CLEANUP!
}, []);
```

**2. Too Many Re-renders**

- Use React DevTools Profiler
- Memoize expensive components

**3. Large Images**

- Compress images before use
- Use appropriate sizes

---

## Getting Help

### Debug Information

When reporting issues, include:

- Device model and OS version
- App version
- Steps to reproduce
- Console logs (if available)
- Screenshots/screen recording

### Logs

**Browser Console:**

- Right-click → Inspect → Console tab

**iOS Logs:**

- Xcode → Window → Devices and Simulators → View Device Logs

**Android Logs:**

```bash
adb logcat | grep -i "anxiety"
```

**Firebase Functions:**

```bash
firebase functions:log
```

---

## See Also

- [Getting Started](getting-started.md) - Setup issues
- [Testing](testing.md) - Testing checklists
- [Tech Stack](../03-architecture/tech-stack.md) - Dependencies
