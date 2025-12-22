import { useEffect, useCallback } from 'react';
import { useDialog } from '../contexts/DialogContext';
import { UpdateDialog } from '../components/features/dialogs/UpdateDialog';

/**
 * useUpdateDialog - Exposes update dialog triggers on window object
 *
 * Attaches helper functions to window for testing/triggering update dialogs:
 * - window.showUpdateRequired() - Shows force update dialog (no dismiss)
 * - window.showUpdateAvailable() - Shows optional update dialog (can dismiss)
 *
 * These can be called from Firebase Remote Config handlers or for testing.
 */
export function useUpdateDialog() {
  const { push, pop } = useDialog();

  const showUpdateRequired = useCallback(() => {
    push(<UpdateDialog type="required" onClose={pop} />);
  }, [push, pop]);

  const showUpdateAvailable = useCallback(() => {
    push(<UpdateDialog type="available" onClose={pop} />);
  }, [push, pop]);

  // Attach to window object for external access
  useEffect(() => {
    // Extend window type
    const win = window as Window & {
      showUpdateRequired?: () => void;
      showUpdateAvailable?: () => void;
    };

    win.showUpdateRequired = showUpdateRequired;
    win.showUpdateAvailable = showUpdateAvailable;

    // Log availability for debugging
    console.log('[UpdateDialog] Helper functions attached to window:');
    console.log('  - window.showUpdateRequired()');
    console.log('  - window.showUpdateAvailable()');

    // Cleanup on unmount
    return () => {
      delete win.showUpdateRequired;
      delete win.showUpdateAvailable;
    };
  }, [showUpdateRequired, showUpdateAvailable]);

  return {
    showUpdateRequired,
    showUpdateAvailable,
  };
}
