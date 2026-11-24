import { useCallback, useState } from 'react';
import type { PreviewDevice } from '@tinacms/ui/components/preview-frame';

const STORAGE_KEY = 'tina-preview-device';

const readStored = (): PreviewDevice => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'tablet' || stored === 'phone' ? stored : 'fit';
  } catch {
    // A browser with storage blocked starts at Fit.
    return 'fit';
  }
};

/** The editor's device size for the preview, kept in this browser. */
export function usePreviewDevice(): [
  PreviewDevice,
  (device: PreviewDevice) => void,
] {
  const [device, setDevice] = useState(readStored);
  const choose = useCallback((next: PreviewDevice) => {
    setDevice(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A browser with storage blocked keeps the choice for this visit only.
    }
  }, []);
  return [device, choose];
}
