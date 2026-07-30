import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// The form column width is a preference, not a constant: the rich-text toolbar
// sizes itself to the column. Lives in localStorage until the `ui` core slice
// lands — move it there then.
const DEFAULT_WIDTH = 352;
// The floor is the default: the width the rich-text e2e tests cover.
const MIN_WIDTH = DEFAULT_WIDTH;
// Stop before the column would squeeze the preview out.
const MIN_PREVIEW_WIDTH = 400;
const KEYBOARD_STEP = 16;
const STORAGE_KEY = 'tina-form-column-width';

// Storage throws when a browser blocks it; a width preference is not worth
// failing the shell over.
const readStoredWidth = (): number | null => {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  } catch {
    return null;
  }
};

const writeStoredWidth = (width: number) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(width));
  } catch {
  }
};

const clampWidth = (width: number) =>
  Math.max(MIN_WIDTH, Math.min(width, window.innerWidth - MIN_PREVIEW_WIDTH));

export interface FormColumnWidth {
  width: number;
  isResizing: boolean;
  handleProps: ComponentPropsWithoutRef<'div'>;
}

export const useFormColumnWidth = (): FormColumnWidth => {
  // Read after mount, not in the initializer: the admin renders on the server
  // too, and a disagreeing first render is a hydration mismatch.
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef<{ x: number; width: number } | null>(null);

  useEffect(() => {
    const stored = readStoredWidth();
    if (stored !== null) setWidth(clampWidth(stored));
  }, []);

  // A shrinking window can leave the column wider than the clamp allows.
  useEffect(() => {
    const onWindowResize = () => setWidth(clampWidth);
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  // Only the settled width: writing per pointermove hits storage every frame.
  useEffect(() => {
    if (isResizing) return;
    writeStoredWidth(width);
  }, [isResizing, width]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      // Without this the drag starts a text selection behind the handle.
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStart.current = { x: event.clientX, width };
      setIsResizing(true);
    },
    [width]
  );

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start) return;
    // From where the drag began, so the column does not jump by the offset
    // between the grab point and the edge.
    setWidth(clampWidth(start.width + (event.clientX - start.x)));
  }, []);

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    dragStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsResizing(false);
  }, []);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowLeft'
        ? -KEYBOARD_STEP
        : event.key === 'ArrowRight'
          ? KEYBOARD_STEP
          : 0;
    if (step === 0 && event.key !== 'Home') return;
    event.preventDefault();
    if (event.key === 'Home') setWidth(clampWidth(DEFAULT_WIDTH));
    else setWidth((current) => clampWidth(current + step));
  }, []);

  return {
    width,
    isResizing,
    handleProps: {
      role: 'separator',
      'aria-orientation': 'vertical',
      'aria-label': 'Resize the form column',
      'aria-valuenow': width,
      'aria-valuemin': MIN_WIDTH,
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
    },
  };
};
