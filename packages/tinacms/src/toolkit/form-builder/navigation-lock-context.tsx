import * as React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigationLock } from './use-navigation-lock';
import { NavigationLockModal } from './navigation-lock-modal';

interface NavigationLockContextValue {
  /**
   * Set whether navigation should be blocked (e.g., when form has unsaved changes)
   */
  setShouldBlock: (shouldBlock: boolean) => void;
}

const NavigationLockContext = createContext<NavigationLockContextValue | null>(
  null
);

/**
 * Provider component that manages navigation blocking state at a high level
 * in the component tree. This prevents the issue where the navigation lock
 * hook gets unmounted when the user navigates away.
 */
export const NavigationLockProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [shouldBlock, setShouldBlockState] = useState(false);
  const navigationLock = useNavigationLock(shouldBlock);

  const setShouldBlock = useCallback((value: boolean) => {
    setShouldBlockState(value);
  }, []);

  return (
    <NavigationLockContext.Provider value={{ setShouldBlock }}>
      {navigationLock.isBlocked && (
        <NavigationLockModal
          onStay={navigationLock.reset}
          onLeave={navigationLock.proceed}
        />
      )}
      {children}
    </NavigationLockContext.Provider>
  );
};

/**
 * Hook to register a component as having unsaved changes that should
 * block navigation. Call with `true` when form is dirty, `false` when pristine.
 */
export function useNavigationBlocker(shouldBlock: boolean): void {
  const context = useContext(NavigationLockContext);

  React.useEffect(() => {
    if (context) {
      context.setShouldBlock(shouldBlock);
    }

    // Reset when component unmounts
    return () => {
      if (context) {
        context.setShouldBlock(false);
      }
    };
  }, [shouldBlock, context]);
}
