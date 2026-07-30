import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const DEFAULT_WIDTH = 352;
const MIN_WIDTH = DEFAULT_WIDTH;
const MIN_PREVIEW_WIDTH = 400;
const KEYBOARD_STEP = 16;
const STORAGE_KEY = 'tina-form-column-width';

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
  } catch {}
};

const clampWidth = (width: number) =>
  Math.max(MIN_WIDTH, Math.min(width, window.innerWidth - MIN_PREVIEW_WIDTH));

export interface FormColumnWidth {
  width: number;
  isResizing: boolean;
  handleProps: ComponentPropsWithoutRef<'div'>;
}

export const useFormColumnWidth = (): FormColumnWidth => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef<{ x: number; width: number } | null>(null);

  useEffect(() => {
    const stored = readStoredWidth();
    if (stored !== null) setWidth(clampWidth(stored));
  }, []);

  useEffect(() => {
    const onWindowResize = () => setWidth(clampWidth);
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  useEffect(() => {
    if (isResizing) return;
    writeStoredWidth(width);
  }, [isResizing, width]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
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
