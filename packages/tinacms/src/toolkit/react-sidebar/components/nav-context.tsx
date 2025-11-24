import * as React from 'react';

interface NavContextValue {
  isOpen: boolean;
  toggleNav: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

const NavContext = React.createContext<NavContextValue | null>(null);

export function useNavContext() {
  const context = React.useContext(NavContext);
  if (!context) {
    throw new Error('useNavContext must be used within a NavProvider');
  }
  return context;
}

interface NavProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function NavProvider({
  children,
  defaultOpen = false,
}: NavProviderProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggleNav = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      isOpen,
      toggleNav,
      setIsOpen,
    }),
    [isOpen, toggleNav]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
