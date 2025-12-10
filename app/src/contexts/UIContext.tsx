import {
  createContext,
  useContext,
  useState,
  useCallback,
  type FC,
  type PropsWithChildren,
} from 'react';

/**
 * UI Context for storing UI measurements and state
 * Stores navbar dimensions, scroll positions, etc.
 * Adapted from cap2cal's approach to bottom navigation measurements
 */

interface UIContextValue {
  // Navbar measurements
  navbarHeight: number;
  navbarBottom: number;
  setNavbarDimensions: (height: number, bottom: number) => void;

  // Scroll state (optional, for future use)
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: FC<PropsWithChildren> = ({ children }) => {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [navbarBottom, setNavbarBottom] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const setNavbarDimensions = useCallback((height: number, bottom: number) => {
    setNavbarHeight(height);
    setNavbarBottom(bottom);
  }, []);

  const value: UIContextValue = {
    navbarHeight,
    navbarBottom,
    setNavbarDimensions,
    isScrolled,
    setIsScrolled,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// Custom hook to use the UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};
