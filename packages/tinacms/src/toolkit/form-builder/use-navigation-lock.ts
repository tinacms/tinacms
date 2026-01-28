import { useCallback, useEffect, useRef, useState } from 'react';

export interface NavigationLockState {
  isBlocked: boolean;
  blockedUrl: string | null;
  proceed: () => void;
  reset: () => void;
}

/**
 * Hook to block navigation when there are unsaved changes.
 * Works with HashRouter by intercepting hashchange events.
 *
 * @param shouldBlock - Whether navigation should be blocked
 * @returns NavigationLockState object with isBlocked, blockedUrl, proceed, and reset
 */
export function useNavigationLock(shouldBlock: boolean): NavigationLockState {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const shouldBlockRef = useRef(shouldBlock);
  const currentHashRef = useRef(window.location.hash);
  const isNavigatingRef = useRef(false);
  const isBlockedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    shouldBlockRef.current = shouldBlock;
  }, [shouldBlock]);

  useEffect(() => {
    isBlockedRef.current = isBlocked;
  }, [isBlocked]);

  // Update currentHashRef when not blocking
  useEffect(() => {
    if (!isBlocked && !shouldBlock) {
      currentHashRef.current = window.location.hash;
    }
  }, [isBlocked, shouldBlock]);

  const proceed = useCallback(() => {
    if (blockedUrl) {
      isNavigatingRef.current = true;
      setIsBlocked(false);
      setBlockedUrl(null);
      // Navigate to the blocked URL
      const targetHash = blockedUrl.startsWith('#')
        ? blockedUrl.slice(1)
        : blockedUrl;
      window.location.hash = targetHash;
    }
  }, [blockedUrl]);

  const reset = useCallback(() => {
    setIsBlocked(false);
    setBlockedUrl(null);
  }, []);

  useEffect(() => {
    if (!shouldBlock) {
      currentHashRef.current = window.location.hash;
      return;
    }

    // Store the current hash when blocking becomes active
    currentHashRef.current = window.location.hash;

    const handleHashChange = () => {
      const newHash = window.location.hash;

      // Skip if we're intentionally navigating (user clicked "Leave")
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        currentHashRef.current = newHash;
        return;
      }

      // Skip if already showing the modal
      if (isBlockedRef.current) {
        // Restore original hash while modal is open
        window.history.replaceState(null, '', currentHashRef.current);
        return;
      }

      // Check if the hash actually changed
      if (newHash !== currentHashRef.current && shouldBlockRef.current) {
        // Store the destination and show modal
        setBlockedUrl(newHash);
        setIsBlocked(true);

        // Restore the original hash
        window.history.replaceState(null, '', currentHashRef.current);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [shouldBlock]);

  return {
    isBlocked,
    blockedUrl,
    proceed,
    reset,
  };
}
