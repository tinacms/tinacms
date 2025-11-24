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
  isOpen?: boolean;
  onToggle?: () => void;
}

export function NavProvider({
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
}: NavProviderProps) {
  const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen);

  // Use controlled state if provided, otherwise use internal state
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const toggleNav = React.useCallback(() => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  }, [onToggle]);

  const setIsOpen = React.useCallback(
    (value: boolean) => {
      if (controlledIsOpen === undefined) {
        setInternalIsOpen(value);
      }
    },
    [controlledIsOpen]
  );

  const value = React.useMemo(
    () => ({
      isOpen,
      toggleNav,
      setIsOpen,
    }),
    [isOpen, toggleNav, setIsOpen]
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
