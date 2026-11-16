import { useEffect, useRef, useState } from 'react';

const RETRY_DELAYS_MS = [500, 1000, 2000];

const withRetry = (url: string, attempt: number): string =>
  attempt === 0
    ? url
    : `${url}${url.includes('?') ? '&' : '?'}retry=${attempt}`;

export const PREVIEW_SIZE = { width: 400, height: 400 };

export function useImagePreview(
  path: string | null,
  resolveUrl: (path: string, size: typeof PREVIEW_SIZE) => string,
  resetKey?: number
) {
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [failure, setFailure] = useState<{
    path: string;
    count: number;
  } | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => () => clearTimeout(retryTimer.current), []);

  useEffect(() => {
    clearTimeout(retryTimer.current);
    setFailure(null);
  }, [resetKey]);

  const failures = path !== null && failure?.path === path ? failure.count : 0;
  const src =
    path === null ? null : withRetry(resolveUrl(path, PREVIEW_SIZE), failures);

  const onError = () => {
    if (path === null) return;
    const next = { path, count: failures + 1 };
    const delay = RETRY_DELAYS_MS[failures];
    if (delay === undefined) {
      setFailure(next);
    } else {
      retryTimer.current = setTimeout(() => setFailure(next), delay);
    }
  };

  return {
    src,
    loaded: src !== null && loadedSrc === src,
    missing: failures > RETRY_DELAYS_MS.length,
    onLoad: () => setLoadedSrc(src),
    onError,
  };
}
