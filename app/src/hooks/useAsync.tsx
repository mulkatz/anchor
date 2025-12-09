import { useCallback, useEffect, useState } from 'react';

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

/**
 * useAsync Hook
 * Handle async operations with loading/error states
 *
 * @param asyncFunction - Async function to execute
 * @param immediate - Execute immediately on mount (default: true)
 * @returns Object with data, loading, error, execute, and reset
 *
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   () => api.get('/users'),
 *   true
 * );
 *
 * if (loading) return <Loader />;
 * if (error) return <Error message={error.message} />;
 * return <UserList users={data} />;
 */
export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate = true
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setData(response);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // Only run on mount if immediate is true

  return { data, loading, error, execute, reset };
}
