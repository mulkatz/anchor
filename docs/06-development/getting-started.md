# Getting Started

**Read this when:** First time setup, running the app, build issues, deployment

---

## Prerequisites

- **Node.js:** 18+ (LTS recommended)
- **npm:** 9+ (comes with Node.js)
- **Xcode:** 15+ (for iOS development)
- **Android Studio:** Latest (for Android development)
- **Firebase CLI:** `npm install -g firebase-tools`

---

## Installation

### Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd anxiety-buddy

# Install dependencies
npm install

# Install app dependencies
cd app && npm install

# Install backend dependencies
cd ../backend/functions && npm install
```

---

## Starting the App

### Development (Web)

```bash
# Terminal 1: Start dev server
cd app && npm run dev
```

Open http://localhost:5173 in browser.

### iOS Simulator

```bash
# Terminal 1: Dev server (keep running)
cd app && npm run dev

# Terminal 2: Run iOS
cd app && npm run ios
```

Or manually:

```bash
cd app
npm run build
npx cap sync ios
npx cap open ios
# Run from Xcode
```

### Android Emulator

```bash
# Terminal 1: Dev server (keep running)
cd app && npm run dev

# Terminal 2: Run Android
cd app && npm run android
```

Or manually:

```bash
cd app
npm run build
npx cap sync android
npx cap open android
# Run from Android Studio
```

---

## Development Workflow

### Standard Flow

1. **Make changes** in `/app/src/`
2. **Hot reload** automatically updates browser/simulator
3. **Test** changes
4. **Commit** when feature complete

### Native Feature Testing

For features requiring native APIs (Haptics, Camera, etc.):

```bash
cd app
npm run build           # Build production bundle
npx cap sync            # Sync to native projects
npx cap run ios         # Run on iOS device/simulator
npx cap run android     # Run on Android device/emulator
```

---

## Before Committing

### Code Quality

```bash
# Format code
npm run format

# Lint check
npm run lint

# Build check
npm run build
```

### i18n Check

Ensure all strings are translated:

```bash
# Check for hardcoded strings (manual)
grep -r '"[A-Z]' app/src/components --include="*.tsx" | grep -v "import\|export\|const"
```

**See:** [i18n Guide](../05-implementation/i18n-guide.md)

---

## Building for Production

### Web Build

```bash
cd app
npm run build
# Output in app/dist/
```

### iOS Build

```bash
cd app
npm run build
npx cap sync ios
npx cap open ios
# Archive in Xcode → Product → Archive
```

### Android Build

```bash
cd app
npm run build
npx cap sync android
npx cap open android
# Build in Android Studio → Build → Generate Signed Bundle
```

---

## Deploying Backend

### Firebase Functions

```bash
cd backend
firebase deploy --only functions
```

### Security Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### All Firebase

```bash
firebase deploy
```

---

## Project Scripts

### App (`/app/package.json`)

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run ios`     | Build and run iOS        |
| `npm run android` | Build and run Android    |
| `npm run lint`    | ESLint check             |
| `npm run format`  | Prettier format          |

### Backend (`/backend/functions/package.json`)

| Script           | Description           |
| ---------------- | --------------------- |
| `npm run build`  | Compile TypeScript    |
| `npm run serve`  | Run functions locally |
| `npm run deploy` | Deploy to Firebase    |

---

## Environment Variables

### App Environment

Create `/app/.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Note:** These are safe to commit (Firebase config is public).

---

## Troubleshooting

### "Module not found"

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### iOS Build Fails

```bash
cd app/native/ios
pod install
```

### Android Build Fails

```bash
cd app/native/android
./gradlew clean
```

### Capacitor Sync Issues

```bash
npx cap sync --force
```

**See:** [Troubleshooting Guide](troubleshooting.md)

---

## See Also

- [Project Structure](../03-architecture/project-structure.md) - Folder organization
- [Tech Stack](../03-architecture/tech-stack.md) - Dependencies
- [Testing](testing.md) - Testing strategy
- [Troubleshooting](troubleshooting.md) - Common issues
