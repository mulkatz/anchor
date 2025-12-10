import { createContext, useContext, useState, type FC, type PropsWithChildren } from 'react';
import type { UserProfile, AppSettings } from '../models';

/**
 * Global application state context
 * Use this for app-wide state like user, theme, etc.
 */

interface AppContextValue {
  // Example: User state
  user: User | null;
  setUser: (user: User | null) => void;

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

interface User {
  id: string;
  name: string;
  email: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark for anxiety-buddy
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const value: AppContextValue = {
    user,
    setUser,
    theme,
    setTheme,
    isLoading,
    setIsLoading,
    userProfile,
    setUserProfile,
    settings,
    setSettings,
    updateSetting,
    version: '0.1.0',
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
