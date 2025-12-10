import toast from 'react-hot-toast';

/**
 * Toast utility that dismisses previous toasts before showing new ones
 * This prevents toast stacking when multiple actions happen in quick succession
 */

export const showToast = {
  /**
   * Show a success toast, dismissing any previous toasts first
   */
  success: (message: string) => {
    toast.dismiss(); // Dismiss all previous toasts
    return toast.success(message);
  },

  /**
   * Show an error toast, dismissing any previous toasts first
   */
  error: (message: string) => {
    toast.dismiss(); // Dismiss all previous toasts
    return toast.error(message);
  },

  /**
   * Show a loading toast (doesn't auto-dismiss previous as loading is typically dismissed manually)
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Dismiss all toasts
   */
  dismiss: () => {
    toast.dismiss();
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismissById: (id: string) => {
    toast.dismiss(id);
  },
};

export default showToast;
