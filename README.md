# Project Starter

> Modern monorepo template for building cross-platform applications with React, TypeScript, Capacitor, and Firebase.

## Features

- **Mobile-First**: Build iOS, Android, and Web apps from a single codebase
- **Modern Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend Ready**: Firebase Functions with TypeScript
- **Developer Experience**: Hot reload, TypeScript, ESLint, Prettier
- **Production Ready**: Optimized builds, code splitting, source maps
- **Offline-First**: Dexie (IndexedDB) for local data storage
- **Internationalization**: i18next for multi-language support
- **Monorepo**: Organized workspace structure with npm workspaces

## Repository Structure

```
anxiety-buddy/
├── app/                      # Mobile app (React + Capacitor)
│   ├── src/                  # Application source code
│   │   ├── pages/            # Top-level screens
│   │   ├── components/       # UI components
│   │   │   ├── ui/           # Atomic, reusable components
│   │   │   └── features/     # Business logic components
│   │   ├── services/         # External integrations (API, etc.)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React Context providers
│   │   ├── models/           # TypeScript type definitions
│   │   ├── db/               # Dexie (IndexedDB) configuration
│   │   ├── utils/            # Pure helper functions
│   │   └── assets/           # Static resources
│   ├── public/               # Static assets
│   └── native/               # iOS & Android projects (generated)
│
├── backend/                  # Firebase Functions
│   ├── functions/            # Cloud Functions
│   │   └── src/              # Function source code
│   └── firebase.json         # Firebase configuration
│
├── web/                      # Optional separate web app
│   └── src/                  # Web-only source code
│
├── docs/                     # Documentation
└── tools/                    # Development utilities

```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- For iOS: Xcode 14+ (macOS only)
- For Android: Android Studio
- Firebase CLI: `npm install -g firebase-tools`

### Installation

```bash
# Clone or download this template
cd anxiety-buddy

# Install all dependencies
npm run install:all

# Or install individually
npm install              # Root dependencies
cd app && npm install    # App dependencies
cd ../backend/functions && npm install  # Backend dependencies
```

### Development

**Mobile App (Web Preview)**
```bash
npm run app:dev
# or
cd app && npm run dev
```
Visit http://localhost:9000

**iOS Development**
```bash
npm run app:build        # Build web assets
npm run app:sync         # Sync with native projects
npm run app:ios          # Open in iOS simulator
```

**Android Development**
```bash
npm run app:build        # Build web assets
npm run app:sync         # Sync with native projects
npm run app:android      # Open in Android simulator
```

**Backend (Firebase Functions)**
```bash
npm run backend:serve    # Start local emulator
# or
cd backend/functions && npm run serve
```

### Configuration

1. **Environment Variables**
   - Copy `app/.env.example` to `app/.env`
   - Add your Firebase and API credentials

2. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Update `backend/.firebaserc` with your project ID
   - Enable Firebase services (Authentication, Firestore, etc.)

3. **Capacitor Configuration**
   - Update `app/capacitor.config.ts`:
     - `appId`: Your unique app identifier (e.g., `com.yourcompany.yourapp`)
     - `appName`: Your app display name

## Development Workflow

### Adding a New Feature

1. **Define types**: Create interfaces in `app/src/models/`
2. **Add service layer**: External integrations in `app/src/services/`
3. **Create custom hook**: Business logic in `app/src/hooks/`
4. **Build UI components**: Add to `app/src/components/`
5. **Update translations**: Add strings to `app/src/assets/translations/`

### Project Scripts

```bash
# Mobile App
npm run app:dev          # Development server
npm run app:build        # Production build
npm run app:ios          # Run on iOS simulator
npm run app:android      # Run on Android emulator
npm run app:sync         # Sync with native projects

# Backend
npm run backend:serve    # Local emulator
npm run backend:deploy   # Deploy to Firebase

# Web (Optional)
npm run web:dev          # Development server
npm run web:build        # Production build

# Utilities
npm run format           # Format all code with Prettier
npm run lint             # Lint all workspaces
npm run clean            # Remove all node_modules and build outputs
```

## Technology Stack

### Frontend (Mobile App)

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Capacitor 7 | Native mobile runtime |
| Dexie | IndexedDB wrapper (offline storage) |
| i18next | Internationalization |
| React Router | Navigation (if needed) |
| Axios | HTTP client |

### Backend

| Technology | Purpose |
|------------|---------|
| Firebase Functions | Serverless compute |
| Firebase Admin SDK | Server-side Firebase |
| TypeScript | Type safety |

### Developer Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| npm workspaces | Monorepo management |

## Project Guidelines

### File Naming

- React components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Hooks: `camelCase.tsx` with `use` prefix (e.g., `useAuth.tsx`)
- Services: `camelCase.service.ts` (e.g., `api.service.ts`)
- Utils: `camelCase.ts` (e.g., `dateFormatter.ts`)
- Types: `PascalCase.ts` or `index.ts` (e.g., `User.ts` or `models/index.ts`)

### Code Style

- Use named exports (avoid default exports)
- Use TypeScript strictly (no `any` unless absolutely necessary)
- Keep components focused and small
- Extract reusable logic into custom hooks
- Use services for external integrations

### Component Architecture

**UI Components** (`components/ui/`)
- Atomic, single responsibility
- Presentational only
- Props-driven and reusable
- Example: `Button`, `Input`, `Card`

**Feature Components** (`components/features/`)
- Smart components with business logic
- Domain-specific
- Composed from UI components
- Example: `UserProfile`, `ProductList`, `CheckoutFlow`

## Deployment

### Mobile App

**iOS**
```bash
cd app
npm run build
npx cap sync ios
npx cap open ios
# In Xcode: Product → Archive → Distribute to App Store
```

**Android**
```bash
cd app
npm run build
npx cap sync android
npx cap open android
# In Android Studio: Build → Generate Signed Bundle/APK
```

### Backend (Firebase Functions)

```bash
cd backend
firebase deploy --only functions
```

## Customization

### Remove Features You Don't Need

**Don't need offline storage?**
- Remove Dexie dependencies from `app/package.json`
- Delete `app/src/db/`

**Don't need internationalization?**
- Remove i18next dependencies from `app/package.json`
- Delete `app/src/assets/translations/`

**Don't need a separate web app?**
- Delete the `web/` directory
- Remove `"web"` from root `package.json` workspaces

**Don't need Firebase Functions?**
- Delete the `backend/` directory

## Resources

- [React Documentation](https://react.dev)
- [Capacitor Documentation](https://capacitorjs.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

## Troubleshooting

**Build errors after installation**
- Run `npm run clean` and reinstall dependencies

**iOS simulator not launching**
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`

**Android build fails**
- Check Java version (JDK 17 recommended)
- Verify `ANDROID_HOME` environment variable is set

**Firebase emulator errors**
- Make sure Firebase CLI is installed: `npm install -g firebase-tools`
- Login to Firebase: `firebase login`

## License

This is a starter template - use it however you like! No attribution required.

---

**Happy Building!** 🚀
# anxiety-buddy
