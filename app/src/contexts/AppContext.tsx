import { createContext, useContext, useState, type FC, type PropsWithChildren } from 'react';

/**
 * Global application state context
 * Use this for app-wide state like user, theme, etc.
 */

interface AppContextValue {
  // Example: User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Example: Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;

  // Example: Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);

  const value: AppContextValue = {
    user,
    setUser,
    theme,
    setTheme,
    isLoading,
    setIsLoading,
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
