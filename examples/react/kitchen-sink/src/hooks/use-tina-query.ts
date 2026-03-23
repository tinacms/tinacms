import { useState, useEffect } from 'react';

interface TinaQueryResult<T> {
  data: T | null;
  query: string;
  variables: Record<string, unknown>;
  loading: boolean;
  error: Error | null;
}

/**
 * Client-side data fetching hook that replaces Next.js server components.
 * Calls the TinaCMS generated client query and returns the result.
 *
 * @param queryFn - async function that calls client.queries.xxx(...)
 * @param deps - dependency array for re-fetching (e.g., route params)
 */
export function useTinaQuery<T>(
  queryFn: () => Promise<{ data: T; query: string; variables: Record<string, unknown> }>,
  deps: unknown[] = []
): TinaQueryResult<T> {
  const [result, setResult] = useState<TinaQueryResult<T>>({
    data: null,
    query: '',
    variables: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setResult((prev) => ({ ...prev, loading: true, error: null }));

    queryFn()
      .then((res) => {
        if (!cancelled) {
          setResult({
            data: res.data,
            query: res.query,
            variables: res.variables as Record<string, unknown>,
            loading: false,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            data: null,
            query: '',
            variables: {},
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return result;
}
