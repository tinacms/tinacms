import React from 'react';

/** Provided by the More tools panel. A tool inside it draws as a menu row and calls `onRun` to close the panel. */
export const ToolRowContext = React.createContext<{ onRun: () => void } | null>(
  null
);
