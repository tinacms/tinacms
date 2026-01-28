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
  const isNavigatingRef = useRef(false);
  const isBlockedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    shouldBlockRef.current = shouldBlock;
    // Only update currentHashRef when not blocked, to preserve the original location
    if (!isBlockedRef.current) {
      currentHashRef.current = window.location.hash;
    }
  }, [shouldBlock]);

  useEffect(() => {
    isBlockedRef.current = isBlocked;
  }, [isBlocked]);

  const proceed = useCallback(() => {
    if (blockedUrl) {
      isNavigatingRef.current = true;
      setIsBlocked(false);
      setBlockedUrl(null);
      // Navigate to the blocked URL
      window.location.hash = blockedUrl.startsWith('#')
        ? blockedUrl.slice(1)
        : blockedUrl;
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

    const handleBeforeNavigate = (newHash: string) => {
      // Skip if we're intentionally navigating (user clicked "Leave")
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        currentHashRef.current = newHash;
        return false;
      }

      // Skip if already showing the modal
      if (isBlockedRef.current) {
        return false;
      }

      // Block the navigation
      if (shouldBlockRef.current) {
        // Store the destination and show modal
        setBlockedUrl(newHash);
        setIsBlocked(true);
        return true; // Indicate we should block
      }

      return false;
    };

    const handleHashChange = () => {
      const newHash = window.location.hash;

      // If the hash changed and we should block, restore it
      if (
        newHash !== currentHashRef.current &&
        handleBeforeNavigate(newHash)
      ) {
        // Restore the original hash without triggering another hashchange
        window.history.replaceState(null, '', currentHashRef.current);
      } else if (!isBlockedRef.current && !isNavigatingRef.current) {
        // Normal navigation, update the current hash
        currentHashRef.current = newHash;
      }
    };

    const handlePopState = () => {
      const newHash = window.location.hash;

      // If navigating to a different hash and we should block
      if (
        newHash !== currentHashRef.current &&
        handleBeforeNavigate(newHash)
      ) {
        // Push state to go back to the original location
        window.history.pushState(null, '', currentHashRef.current);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [shouldBlock]);

  return {
    isBlocked,
    blockedUrl,
    proceed,
    reset,
  };
}
