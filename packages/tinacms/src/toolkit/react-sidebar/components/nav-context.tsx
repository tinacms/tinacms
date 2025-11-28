import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface NavContextValue {
  menuIsOpen: boolean;
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
}

export const NavContext = createContext<NavContextValue | undefined>(undefined);

export const useNav = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
};

interface NavProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export const NavProvider: React.FC<NavProviderProps> = ({
  children,
  defaultOpen = false,
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(defaultOpen);

  const toggleMenu = () => setMenuIsOpen((prev) => !prev);
  const openMenu = () => setMenuIsOpen(true);
  const closeMenu = () => setMenuIsOpen(false);

  const value: NavContextValue = {
    menuIsOpen,
    toggleMenu,
    openMenu,
    closeMenu,
  };

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};
