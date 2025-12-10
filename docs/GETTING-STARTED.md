# Getting Started

Complete guide to set up and run your project from this starter template.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Git** for version control

### For Mobile Development

**iOS (macOS only)**

- Xcode 14 or higher
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`

**Android**

- Android Studio
- JDK 17 (recommended)
- Android SDK (API level 33+)
- Set `ANDROID_HOME` environment variable

### For Backend Development

- **Firebase CLI**: `npm install -g firebase-tools`
- Firebase account (free tier available)

## Installation

### 1. Clone or Download Template

```bash
# If using git
git clone <your-repo-url>
cd anxiety-buddy

# Or download and extract the ZIP
```

### 2. Install Dependencies

**Option A: Install everything at once**

```bash
npm run install:all
```

**Option B: Install individually**

```bash
# Root dependencies
npm install

# Mobile app
cd app && npm install

# Backend functions
cd backend/functions && npm install

# Web (optional)
cd web && npm install
```

### 3. Configure Environment

#### Mobile App Environment

```bash
# Copy example environment file
cd app
cp .env.example .env
```

Edit `app/.env` and add your configuration:

```env
VITE_API_URL=https://your-api-endpoint.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Update `backend/.firebaserc`:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

#### Capacitor Configuration

Update `app/capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'cx.franz.anxietybuddy', // Your unique bundle ID
  appName: 'Anxiety Buddy', // Your app display name
  webDir: 'dist',
};
```

## Running the Project

### Web Development (Fastest for UI work)

```bash
cd app
npm run dev
```

Visit http://localhost:9000

**Note:** Some Capacitor plugins won't work in the browser. Use native simulators for full testing.

### iOS Development

```bash
cd app

# Build web assets
npm run build

# Sync with iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode:

1. Select a simulator (e.g., iPhone 15 Pro)
2. Click Run (▶️) or press Cmd+R

**For live reload during development:**

1. Find your computer's local IP: `ifconfig` (look for en0)
2. Update `app/capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.XXX:9000',
     cleartext: true,
   }
   ```
3. Run `npm run dev` in the app directory
4. Run the app from Xcode

### Android Development

```bash
cd app

# Build web assets
npm run build

# Sync with Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:

1. Select a device/emulator
2. Click Run (▶️) or press Ctrl+R (Cmd+R on Mac)

**For live reload:** Same process as iOS (update capacitor.config.ts)

### Backend Development (Firebase Functions)

```bash
cd backend

# Start Firebase emulator
firebase emulators:start
```

Access Firebase Emulator UI at http://localhost:4000

Available emulators:

- Functions: http://localhost:5001
- Firestore: http://localhost:8080

## Project Structure Overview

```
app/src/
├── pages/          # Top-level screens
├── components/     # UI components
│   ├── ui/         # Reusable UI elements
│   └── features/   # Feature-specific components
├── services/       # API, analytics, etc.
├── hooks/          # Custom React hooks
├── contexts/       # Global state
├── models/         # TypeScript types
├── db/             # Database (Dexie)
├── utils/          # Helper functions
└── assets/         # Static resources
```

## Development Workflow

### 1. Create a New Feature

Example: Add a user profile screen

**Step 1: Define types**

```typescript
// app/src/models/index.ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
```

**Step 2: Create the page**

```typescript
// app/src/pages/ProfileScreen.tsx
import { FC } from 'react';

export const ProfileScreen: FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
    </div>
  );
};
```

**Step 3: Add navigation**

```typescript
// app/src/pages/App.tsx
import { ProfileScreen } from './ProfileScreen';

// Add to your routing logic
```

### 2. Add an API Endpoint

**Step 1: Define backend function**

```typescript
// backend/functions/src/index.ts
export const getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const userId = context.auth.uid;
  // Fetch and return user data

  return { success: true, data: userProfile };
});
```

**Step 2: Deploy or test locally**

```bash
# Local testing
cd backend && firebase emulators:start

# Deploy to Firebase
cd backend && firebase deploy --only functions
```

**Step 3: Call from app**

```typescript
// app/src/services/api.ts
export const userService = {
  async getProfile(): Promise<UserProfile> {
    const result = await api.get('/profile');
    return result.data;
  },
};
```

### 3. Add a Custom Hook

```typescript
// app/src/hooks/useUserProfile.tsx
import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import type { UserProfile } from '../models';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
};
```

**Use in component**

```typescript
const { profile, loading, error } = useUserProfile();
```

## Testing Your App

### Manual Testing Checklist

- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Test web version in browser
- [ ] Test offline functionality
- [ ] Test all user flows
- [ ] Test error states

### Automated Testing (To be added)

This starter doesn't include tests yet, but you can add:

- Jest + React Testing Library (unit tests)
- Playwright or Detox (E2E tests)

## Building for Production

### Mobile App

**iOS**

```bash
cd app
npm run build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select "Any iOS Device (arm64)"
# 2. Product → Archive
# 3. Distribute App → App Store Connect
```

**Android**

```bash
cd app
npm run build
npx cap sync android
npx cap open android

# In Android Studio:
# 1. Build → Generate Signed Bundle / APK
# 2. Select "Android App Bundle"
# 3. Follow the wizard to sign and build
```

### Backend

```bash
cd backend
firebase deploy --only functions
```

## Troubleshooting

### Common Issues

**Issue: `npm install` fails**

- Solution: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure you're using Node.js 18+: `node --version`

**Issue: iOS build fails**

- Solution: Run `pod install` in `app/native/ios/App`
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`

**Issue: Android build fails**

- Solution: Check Java version: `java -version` (should be 17)
- Verify `ANDROID_HOME` is set: `echo $ANDROID_HOME`
- Clean build: In Android Studio → Build → Clean Project

**Issue: Capacitor sync errors**

- Solution: Delete `native` folder and run `npx cap add ios` and `npx cap add android`

**Issue: Firebase emulator won't start**

- Solution: Check if ports are in use: `lsof -i :5001`
- Install Java JDK if missing (required for emulators)

**Issue: Environment variables not working**

- Solution: Restart dev server after changing `.env`
- Ensure variables start with `VITE_` prefix
- Check `vite-env.d.ts` has correct type definitions

## Next Steps

1. **Customize branding**
   - Update app name, colors, icons
   - Add your logo and splash screens

2. **Set up analytics**
   - Add Firebase Analytics
   - Implement event tracking

3. **Add authentication**
   - Set up Firebase Auth
   - Implement login/signup flows

4. **Deploy backend**
   - Configure Firebase project
   - Deploy functions

5. **Add tests**
   - Set up Jest
   - Write unit and E2E tests

6. **Prepare for launch**
   - Create App Store listing
   - Create Google Play listing
   - Prepare marketing materials

## Resources

- [React Documentation](https://react.dev)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide)

## Getting Help

- Check the [main README](../README.md)
- Review [CLAUDE.md](../CLAUDE.md) for architecture details
- Search existing issues on GitHub
- Ask on Stack Overflow with relevant tags

---

Happy coding! 🚀
