import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type FC,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Dialog stack management context
 * Handles multiple dialogs with proper stacking and back button support
 * Adapted from cap2cal's DialogContext
 */

type BackHandler = () => boolean;

interface DialogContextValue {
  // Dialog stack management
  push: (dialog: ReactNode) => void;
  pop: () => void;
  replace: (dialog: ReactNode) => void;
  clear: () => void;

  // Back button handler registry
  registerBackHandler: (id: string, handler: BackHandler) => void;
  unregisterBackHandler: (id: string) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export const DialogProvider: FC<PropsWithChildren> = ({ children }) => {
  const [stack, setStack] = useState<ReactNode[]>([]);
  const backHandlersRef = useRef<Map<string, BackHandler>>(new Map());

  const push = useCallback((dialog: ReactNode) => {
    setStack((prevStack) => [...prevStack, dialog]);
  }, []);

  const pop = useCallback(() => {
    setStack((prevStack) => {
      if (prevStack.length === 0) return prevStack;
      return prevStack.slice(0, -1);
    });
  }, []);

  const replace = useCallback((dialog: ReactNode) => {
    setStack((prevStack) => {
      if (prevStack.length === 0) return [dialog];
      return [...prevStack.slice(0, -1), dialog];
    });
  }, []);

  const clear = useCallback(() => {
    setStack([]);
  }, []);

  const registerBackHandler = useCallback((id: string, handler: BackHandler) => {
    backHandlersRef.current.set(id, handler);
  }, []);

  const unregisterBackHandler = useCallback((id: string) => {
    backHandlersRef.current.delete(id);
  }, []);

  // Handle Android back button
  // Priority: registered handlers → dialog stack → default
  const handleBackButton = useCallback(() => {
    // Try registered handlers first (in reverse order of registration)
    const handlers = Array.from(backHandlersRef.current.entries()).reverse();
    for (const [, handler] of handlers) {
      if (handler()) {
        return true; // Handler consumed the event
      }
    }

    // If no handler consumed it, try popping from dialog stack
    if (stack.length > 0) {
      pop();
      return true;
    }

    return false; // Let system handle it
  }, [stack.length, pop]);

  const value: DialogContextValue = {
    push,
    pop,
    replace,
    clear,
    registerBackHandler,
    unregisterBackHandler,
  };

  return (
    <DialogContext.Provider value={value}>
      {children}

      {/* Render all dialogs in the stack using portals */}
      {/* Dialogs are responsible for their own styling (backdrop, glass container, etc.) */}
      {stack.length > 0 && createPortal(stack[stack.length - 1], document.body)}
    </DialogContext.Provider>
  );
};

// Custom hook to use the dialog context
export const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialogContext must be used within DialogProvider');
  }
  return context;
};

// Alias for convenience
export const useDialog = useDialogContext;
