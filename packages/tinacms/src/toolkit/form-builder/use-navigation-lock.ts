import { useCallback, useEffect, useRef, useState } from 'react';

export interface NavigationLockState {
  isBlocked: boolean;
  blockedUrl: string | null;
  proceed: () => void;
  reset: () => void;
}

/**
 * Hook to block navigation when there are unsaved changes.
 * Works with HashRouter by intercepting hash changes and popstate events.
 *
 * @param shouldBlock - Whether navigation should be blocked
 * @returns NavigationLockState object with isBlocked, blockedUrl, proceed, and reset
 */
export function useNavigationLock(shouldBlock: boolean): NavigationLockState {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);
  const shouldBlockRef = useRef(shouldBlock);
  const currentHashRef = useRef(window.location.hash);
  const isRestoringRef = useRef(false);

  // Keep ref in sync with prop
  useEffect(() => {
    shouldBlockRef.current = shouldBlock;
    currentHashRef.current = window.location.hash;
  }, [shouldBlock]);

  const proceed = useCallback(() => {
    if (blockedUrl) {
      isRestoringRef.current = true;
      window.location.hash = blockedUrl;
      setIsBlocked(false);
      setBlockedUrl(null);
    }
  }, [blockedUrl]);

  const reset = useCallback(() => {
    setIsBlocked(false);
    setBlockedUrl(null);
  }, []);

  useEffect(() => {
    if (!shouldBlock) {
      return;
    }

    const handleHashChange = (event: HashChangeEvent) => {
      // Skip if we're restoring to the blocked URL
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        currentHashRef.current = window.location.hash;
        return;
      }

      // Block the navigation
      if (shouldBlockRef.current && !isBlocked) {
        event.preventDefault();
        const newHash = window.location.hash;

        // Restore the previous hash
        window.history.replaceState(null, '', currentHashRef.current);

        // Store the blocked URL and show modal
        setBlockedUrl(newHash);
        setIsBlocked(true);
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      // Skip if we're restoring to the blocked URL
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        currentHashRef.current = window.location.hash;
        return;
      }

      // Block browser back/forward navigation
      if (shouldBlockRef.current && !isBlocked) {
        const newHash = window.location.hash;

        // Push the current state back to prevent navigation
        window.history.pushState(null, '', currentHashRef.current);

        // Store the blocked URL and show modal
        setBlockedUrl(newHash);
        setIsBlocked(true);
      }
    };

    // Add a history entry to catch back button presses
    window.history.pushState(null, '', window.location.href);

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock, isBlocked]);

  return {
    isBlocked,
    blockedUrl,
    proceed,
    reset,
  };
}
