const PIN_KEY = 'tina.errorPane.pinned';

/** Whether the editor pinned the error summary pane open. Read at the moment of use. */
export const readPinned = (): boolean => {
  try {
    return localStorage.getItem(PIN_KEY) === 'true';
  } catch {
    return false;
  }
};

export const writePinned = (pinned: boolean) => {
  try {
    localStorage.setItem(PIN_KEY, String(pinned));
  } catch {
    // Storage can be blocked; the pin then lasts for the session only.
  }
};
