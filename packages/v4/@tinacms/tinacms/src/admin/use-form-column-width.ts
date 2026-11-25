import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const KEYBOARD_STEP = 16;

/** One resizable column: where its width is stored and the range it may take. */
export interface ColumnSpec {
  storageKey: string;
  defaultWidth: number;
  minWidth: number;
  /** The widest the column may be in a window of this width. */
  maxWidthFor: (viewportWidth: number) => number;
}

const MIN_PREVIEW_WIDTH = 400;
const DESKTOP_DEFAULT = 352;

/** The form column on a desktop: 352px up, leaving the preview 400px. */
export const DESKTOP_FORM_COLUMN: ColumnSpec = {
  storageKey: 'tina-form-column-width',
  defaultWidth: DESKTOP_DEFAULT,
  minWidth: DESKTOP_DEFAULT,
  maxWidthFor: (viewport) =>
    Math.max(DESKTOP_DEFAULT, viewport - MIN_PREVIEW_WIDTH),
};

/** The form column on a tablet: 360px to start, 320px to 480px. */
export const TABLET_FORM_COLUMN: ColumnSpec = {
  storageKey: 'tina-form-column-width-tablet',
  defaultWidth: 360,
  minWidth: 320,
  maxWidthFor: () => 480,
};

/** The Collections column beside a document: 440px to start, 320px to 480px. */
export const NAVIGATOR_COLUMN: ColumnSpec = {
  storageKey: 'tina-navigator-column-width',
  defaultWidth: 440,
  minWidth: 320,
  maxWidthFor: () => 480,
};

const readStoredWidth = (key: string): number | null => {
  try {
    const stored = Number(window.localStorage.getItem(key));
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  } catch {
    return null;
  }
};

const writeStoredWidth = (key: string, width: number) => {
  try {
    window.localStorage.setItem(key, String(width));
  } catch {}
};

const clampWidth = (spec: ColumnSpec, width: number, viewportWidth: number) =>
  Math.min(
    Math.max(spec.minWidth, width),
    Math.max(spec.minWidth, spec.maxWidthFor(viewportWidth))
  );

export interface FormColumnWidth {
  width: number;
  isResizing: boolean;
  handleProps: ComponentPropsWithoutRef<'div'>;
}

export const useColumnWidth = (
  spec: ColumnSpec = DESKTOP_FORM_COLUMN
): FormColumnWidth => {
  // Storage holds the width the editor chose, and never the clamped width. A
  // narrow window clamps the column for display only. If the clamp went to
  // storage, a narrow window would destroy the choice, and a wide window
  // could not give it back. Each storage key keeps its own choice, so a tablet
  // width never changes the desktop width.
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const chosenWidth =
    chosen[spec.storageKey] ??
    readStoredWidth(spec.storageKey) ??
    spec.defaultWidth;
  const setChosenWidth = useCallback(
    (width: number) =>
      setChosen((current) => ({ ...current, [spec.storageKey]: width })),
    [spec.storageKey]
  );
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef<{ x: number; width: number } | null>(null);

  const width = clampWidth(spec, chosenWidth, viewportWidth);
  const maxWidth = Math.max(spec.minWidth, spec.maxWidthFor(viewportWidth));

  useEffect(() => {
    const onWindowResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  useEffect(() => {
    if (isResizing) return;
    writeStoredWidth(spec.storageKey, chosenWidth);
  }, [isResizing, chosenWidth, spec.storageKey]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStart.current = { x: event.clientX, width };
      setIsResizing(true);
    },
    [width]
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const start = dragStart.current;
      if (!start) return;
      setChosenWidth(
        clampWidth(spec, start.width + (event.clientX - start.x), viewportWidth)
      );
    },
    [viewportWidth, spec, setChosenWidth]
  );

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    dragStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsResizing(false);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const step =
        event.key === 'ArrowLeft'
          ? -KEYBOARD_STEP
          : event.key === 'ArrowRight'
            ? KEYBOARD_STEP
            : 0;
      if (step === 0 && event.key !== 'Home') return;
      event.preventDefault();
      if (event.key === 'Home') setChosenWidth(spec.defaultWidth);
      else setChosenWidth(clampWidth(spec, width + step, viewportWidth));
    },
    [width, viewportWidth, spec, setChosenWidth]
  );

  return {
    width,
    isResizing,
    handleProps: {
      role: 'separator',
      'aria-orientation': 'vertical',
      'aria-label': 'Resize the form column',
      'aria-valuenow': width,
      'aria-valuemin': spec.minWidth,
      'aria-valuemax': maxWidth,
      tabIndex: 0,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onKeyDown,
    },
  };
};

/** The form column's width at desktop. */
export const useFormColumnWidth = (): FormColumnWidth =>
  useColumnWidth(DESKTOP_FORM_COLUMN);
