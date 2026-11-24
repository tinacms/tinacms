import React from 'react';

export type LinkShortcut = {
  open: { current: (() => void) | null };
  pending: { current: boolean };
};

/** The toolbar owns the Cmd/Ctrl+K key. The Link button registers how to open its box while it is mounted. */
export const LinkShortcutContext = React.createContext<LinkShortcut | null>(
  null
);

export const useLinkShortcutRegistry = (): LinkShortcut =>
  React.useMemo(
    () => ({ open: { current: null }, pending: { current: false } }),
    []
  );
