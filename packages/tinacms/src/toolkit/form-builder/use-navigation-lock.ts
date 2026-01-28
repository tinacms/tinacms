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
  const isRestoringRef = useRef(false);

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
      // Navigate to the blocked URL using history.back() since we restored forward
      window.history.back();
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

    const handleNavigation = () => {
      // Skip if we're restoring after blocking
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        return;
      }

      // Skip if we're intentionally navigating (user clicked "Leave")
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        currentHashRef.current = window.location.hash;
        return;
      }

      // Skip if already showing the modal
      if (isBlockedRef.current) {
        return;
      }

      const newHash = window.location.hash;

      // Check if the hash actually changed
      if (newHash !== currentHashRef.current && shouldBlockRef.current) {
        // Store the destination and show modal
        setBlockedUrl(newHash);
        setIsBlocked(true);

        // Go forward to restore the original page
        // This works because back button creates a forward entry
        isRestoringRef.current = true;
        window.history.go(1);
      }
    };

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [shouldBlock]);

  return {
    isBlocked,
    blockedUrl,
    proceed,
    reset,
  };
}
