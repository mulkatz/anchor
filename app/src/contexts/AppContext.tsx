import {
  createContext,
  useContext,
  useState,
  useEffect,
  type FC,
  type PropsWithChildren,
} from 'react';
import { onAuthStateChanged, signInAnonymously, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase.service';
import type { UserProfile, AppSettings } from '../models';

/**
 * Global application state context
 * Use this for app-wide state like user, theme, etc.
 */

interface AppContextValue {
  // Firebase auth user (reactive)
  firebaseUser: FirebaseUser | null;
  userId: string | null;
  isAuthLoading: boolean;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;

  // App settings
  settings: AppSettings | null;
  setSettings: (settings: AppSettings | null) => void;
  updateSetting: (key: keyof AppSettings, value: any) => void;

  // App version
  version: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark for anxiety-buddy
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Track Firebase auth state with onAuthStateChanged
  useEffect(() => {
    let isSubscribed = true;
    let hasAttemptedSignIn = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isSubscribed) return;

      setFirebaseUser(user);

      // If no user and we haven't attempted sign-in yet, sign in anonymously
      if (!user && !hasAttemptedSignIn) {
        hasAttemptedSignIn = true;
        try {
          console.log('[Auth] Attempting anonymous sign-in...');
          const result = await signInAnonymously(auth);
          console.log('[Auth] Anonymous sign-in successful:', result.user.uid);
        } catch (error: unknown) {
          console.error('[Auth] Anonymous sign-in failed:', error);

          // Log specific error codes for troubleshooting
          const firebaseError = error as { code?: string };
          if (firebaseError?.code === 'auth/configuration-not-found') {
            console.error('Anonymous authentication is not enabled in Firebase Console');
          } else if (firebaseError?.code === 'auth/unauthorized-domain') {
            console.error('Domain not authorized in Firebase Console');
          }
        }
      }

      setIsAuthLoading(false);
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const value: AppContextValue = {
    firebaseUser,
    userId: firebaseUser?.uid || null,
    isAuthLoading,
    theme,
    setTheme,
    isLoading,
    setIsLoading,
    userProfile,
    setUserProfile,
    settings,
    setSettings,
    updateSetting,
    version: '0.7.0',
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
