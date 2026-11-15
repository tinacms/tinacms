import { createContext } from 'react';

/** What the shell gives the Media pane: its Close target and the maximise state the shell lays out. */
export interface MediaPaneShell {
  maximised: boolean;
  toggleMaximise: () => void;
  close: () => void;
}

export const MediaPaneShellContext = createContext<MediaPaneShell | undefined>(
  undefined
);
