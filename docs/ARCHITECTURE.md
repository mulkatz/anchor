# Architecture Overview

This document describes the high-level architecture of the Project Starter template.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (iOS/Android/Web)          │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Pages    │  │ Components │  │   Hooks    │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        │               │               │                │
│        └───────────────┴───────────────┘                │
│                        │                                │
│                        ▼                                │
│  ┌────────────────────────────────────────────┐        │
│  │            Services Layer                   │        │
│  │  (API, Analytics, Auth, Storage)           │        │
│  └────────────────────┬───────────────────────┘        │
│                       │                                │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐            ┌──────────────────┐
│  Firebase     │            │  Custom Backend  │
│  Functions    │            │  (Optional)      │
│               │            │                  │
│  - Auth       │            │  - REST APIs     │
│  - Firestore  │            │  - GraphQL       │
│  - Storage    │            │  - WebSockets    │
└───────────────┘            └──────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (`app/src/pages/` + `app/src/components/`)

**Responsibility:** Render UI, handle user interactions, display data

**Components:**

- **Pages** - Top-level route components (screens)
- **UI Components** - Reusable presentational components
- **Feature Components** - Smart components with business logic

**Rules:**

- Components should be pure and focused
- Business logic extracted into hooks
- I/O operations delegated to services
- Use TypeScript for prop types

**Example:**

```typescript
// ✅ Good - Pure presentation
export const UserProfile: FC<UserProfileProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <Avatar src={user.avatar} />
      <Text>{user.name}</Text>
      <Button onClick={onEdit}>Edit</Button>
    </Card>
  );
};

// ❌ Bad - Mixed concerns
export const UserProfile: FC = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Direct API call in component
    fetch('/api/user').then(r => r.json()).then(setUser);
  }, []);

  return <div>{user?.name}</div>;
};
```

### 2. Business Logic Layer (`app/src/hooks/`)

**Responsibility:** Encapsulate reusable business logic, state management

**Hooks:**

- Data fetching hooks (`useUserData`, `useProducts`)
- Stateful logic hooks (`useAuth`, `useCart`)
- Side effect hooks (`useAnalytics`, `useNotifications`)

**Rules:**

- One hook per feature/concern
- Return stable object structure
- Handle loading/error states
- Clean up side effects

**Example:**

```typescript
export const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await userService.getUser(userId);
        setUser(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const refetch = useCallback(() => {
    // Refetch logic
  }, [userId]);

  return { user, loading, error, refetch };
};
```

### 3. Service Layer (`app/src/services/`)

**Responsibility:** Encapsulate external integrations, platform APIs

**Services:**

- **API Service** - HTTP requests to backend
- **Analytics Service** - Event tracking
- **Auth Service** - Authentication operations
- **Storage Service** - Local/remote data persistence

**Rules:**

- One service per external system
- Abstract platform differences (iOS vs Android vs Web)
- Centralized error handling
- Return typed promises

**Example:**

```typescript
// api.service.ts
export const api = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Other HTTP methods...
};

// analytics.service.ts
export const analytics = {
  logEvent(eventName: string, params?: object) {
    if (isNativePlatform()) {
      // Use native analytics
      FirebaseAnalytics.logEvent({ name: eventName, params });
    } else {
      // Use web analytics
      gtag('event', eventName, params);
    }
  },
};
```

### 4. Data Layer (`app/src/db/` + `app/src/models/`)

**Responsibility:** Data persistence, type definitions

**Components:**

- **Database** (Dexie) - Offline-first local storage
- **Models** - TypeScript type definitions
- **Schemas** - Database table definitions

**Rules:**

- All data has type definitions
- Database operations are async
- Use hooks for reactive queries
- Implement data validation

**Example:**

```typescript
// models/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// db/db.ts
export const db = new Dexie('AppDatabase') as Dexie & {
  users: EntityTable<User, 'id'>;
};

db.version(1).stores({
  users: 'id, email, createdAt',
});

// Usage in component
const users = useLiveQuery(() => db.users.toArray());
```

## Data Flow

### Unidirectional Data Flow

```
User Action → Event Handler → Hook/Service → State Update → UI Re-render
```

**Example: Fetching User Data**

```typescript
// 1. User clicks "Load Profile"
<Button onClick={handleLoadProfile}>Load Profile</Button>

// 2. Event handler calls hook
const handleLoadProfile = () => {
  refetchUser();
};

// 3. Hook uses service
const { user, refetch: refetchUser } = useUserData(userId);

// 4. Service makes API call
const data = await api.get<User>('/users/123');

// 5. State updates
setUser(data);

// 6. Component re-renders with new data
return <UserCard user={user} />;
```

## State Management

### Local State (useState)

Use for:

- Component-specific UI state
- Form input values
- Toggle states

```typescript
const [isOpen, setIsOpen] = useState(false);
const [inputValue, setInputValue] = useState('');
```

### Context State (React Context)

Use for:

- App-wide configuration
- User authentication state
- Theme preferences

```typescript
// contexts/AppContext.tsx
export const AppContext = createContext<AppContextValue>({});

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  const value = { user, setUser, theme, setTheme };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Usage
const { user, theme } = useContext(AppContext);
```

### Persistent State (Dexie/LocalStorage)

Use for:

- Offline data storage
- User preferences
- Cached API responses

```typescript
// Dexie (structured data)
await db.users.put(user);
const user = await db.users.get(userId);

// LocalStorage (simple key-value)
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');
```

## Mobile Architecture (Capacitor)

### Platform Abstraction

```typescript
// utils/platform.ts
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isWeb = () => !Capacitor.isNativePlatform();

// Usage
if (isNativePlatform()) {
  // Use native plugin
  const result = await Camera.getPhoto();
} else {
  // Use web API
  const result = await navigator.mediaDevices.getUserMedia();
}
```

### Plugin Usage Pattern

```typescript
// hooks/useCamera.tsx
export const useCamera = () => {
  const takePhoto = async () => {
    if (!isNativePlatform()) {
      throw new Error('Camera not available on web');
    }

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });

    return photo;
  };

  return { takePhoto };
};
```

## Backend Architecture (Firebase)

### Cloud Functions Structure

```typescript
// backend/functions/src/index.ts

// HTTP Function (public endpoint)
export const publicApi = functions.https.onRequest((req, res) => {
  // Handle HTTP request
  res.json({ data: 'response' });
});

// Callable Function (client SDK)
export const privateApi = functions.https.onCall(async (data, context) => {
  // Check auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required');
  }

  // Your logic
  return { result: 'data' };
});

// Firestore Trigger
export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    // React to new user creation
    const userData = snap.data();
    // Send welcome email, etc.
  });

// Scheduled Function
export const dailyCleanup = functions.pubsub.schedule('0 0 * * *').onRun(async () => {
  // Daily maintenance tasks
});
```

## Performance Considerations

### Code Splitting

```typescript
// Lazy load routes
const ProfileScreen = React.lazy(() => import('./pages/ProfileScreen'));

// Use with Suspense
<Suspense fallback={<Loader />}>
  <ProfileScreen />
</Suspense>
```

### Memoization

```typescript
// Expensive computation
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// Callback stability
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### Virtual Scrolling

```typescript
// For long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```

## Security Architecture

### Authentication Flow

```
1. User enters credentials
2. App sends to Firebase Auth
3. Firebase returns auth token
4. App stores token securely
5. Token included in API requests
6. Backend validates token
7. Backend returns protected data
```

### Security Rules

**Firestore Rules Example:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public read, authenticated write
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Error Handling

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to crash reporting service
    logger.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Service Error Handling

```typescript
// services/api.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }

    if (error.response?.status >= 500) {
      // Show error message
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  }
);
```

## Testing Strategy (Recommended)

### Unit Tests

- **Target:** Utils, hooks, services
- **Tool:** Jest + React Testing Library
- **Coverage:** 60%+

### Integration Tests

- **Target:** API integration, database operations
- **Tool:** Jest
- **Coverage:** Critical paths

### E2E Tests

- **Target:** User flows
- **Tool:** Playwright or Detox
- **Coverage:** Happy paths + error cases

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  App Store (iOS)       Google Play (Android)            │
│       ▲                        ▲                        │
│       │                        │                        │
│       └────────────────────────┘                        │
│                   │                                     │
│                   ▼                                     │
│          Capacitor Native App                           │
│                   │                                     │
│                   ▼                                     │
│          Built Web Assets (dist/)                       │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Firebase Hosting (Optional web version)                │
│                   ▲                                     │
│                   │                                     │
│                   │                                     │
│          Firebase Functions (Backend)                   │
│                   ▲                                     │
│                   │                                     │
│         Firestore/Storage/Auth                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

| Decision                     | Rationale                                                    |
| ---------------------------- | ------------------------------------------------------------ |
| React over Vue/Angular       | Largest ecosystem, best mobile support                       |
| Capacitor over React Native  | Web-first, easier to learn, better for teams with web skills |
| Vite over CRA                | 10-100x faster builds, better DX                             |
| Context over Redux           | Simpler for most apps, less boilerplate                      |
| Dexie over raw IndexedDB     | Better API, TypeScript support, reactive hooks               |
| Firebase over custom backend | Faster time to market, scales automatically                  |
| TypeScript everywhere        | Type safety prevents bugs, better IDE support                |
| Monorepo structure           | Shared code, consistent tooling, easier refactoring          |

---

This architecture is designed to:

- ✅ Scale from MVP to production
- ✅ Maintain developer productivity
- ✅ Support offline-first mobile apps
- ✅ Enable fast iteration cycles
- ✅ Keep complexity manageable
