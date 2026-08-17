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
 * @param queryFn - stable callback (wrap in useCallback) that calls client.queries.xxx(...)
 *
 * Callers should stabilise queryFn with useCallback so that React's
 * exhaustive-deps lint rule can verify captured variables:
 *
 *   const queryFn = useCallback(
 *     () => client.queries.post({ relativePath: `${filepath}.md` }),
 *     [filepath]
 *   );
 *   const result = useTinaQuery(queryFn);
 */
export function useTinaQuery<T>(
  queryFn: () => Promise<{
    data: T;
    query: string;
    variables: Record<string, unknown>;
  }>
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
          setResult((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [queryFn]);

  return result;
}
