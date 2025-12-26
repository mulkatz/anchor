import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 * Critical for app stability and crash recovery
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // TODO: Send to crash reporting service (Sentry/Crashlytics)
    // crashReporting.captureException(error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-void-blue px-6 text-center">
          <div className="mb-6 rounded-full bg-warm-ember/20 p-4">
            <AlertTriangle size={48} className="text-warm-ember" />
          </div>

          <h1 className="mb-2 text-2xl font-light text-mist-white">Something went wrong</h1>

          <p className="mb-8 max-w-sm text-mist-white/60">
            The app encountered an unexpected error. Please try again.
          </p>

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-full bg-biolum-cyan/20 px-6 py-3 text-biolum-cyan transition-all duration-300 hover:bg-biolum-cyan/30 active:scale-95"
          >
            <RefreshCw size={20} />
            <span>Try Again</span>
          </button>

          {/* Show error details in development */}
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 max-w-md rounded-lg bg-void-blue/50 p-4 text-left">
              <p className="mb-2 text-sm font-medium text-warm-ember">Error Details (Dev Only):</p>
              <pre className="overflow-auto text-xs text-mist-white/40">
                {this.state.error.message}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
