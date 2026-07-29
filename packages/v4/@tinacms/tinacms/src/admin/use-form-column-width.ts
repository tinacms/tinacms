import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// The form column opens narrow, because a form that grows with the window is hard to
// read. Narrow is the right default, but it is the wrong ceiling: the rich-text toolbar
// sizes itself to the column, and at the default width it has room for six tools and
// puts the rest behind a menu. An editor working in prose wants those tools. So the
// width is a preference, not a constant, and the drag survives a reload.
//
// The preference lives in localStorage rather than the store. The `ui` core slice, which
// is where it belongs, is still empty — move this there when that slice lands.
const DEFAULT_WIDTH = 352;
// The floor is the default. That is the width the rich-text e2e tests cover, so the
// editor is known to work at it; anything narrower is untested. Dragging widens.
const MIN_WIDTH = DEFAULT_WIDTH;
// The preview is the point of the pane beside it, so the column stops before it would
// squeeze the preview out.
const MIN_PREVIEW_WIDTH = 400;
const KEYBOARD_STEP = 16;
const STORAGE_KEY = 'tina-form-column-width';

// Storage throws when a browser blocks it (private windows, disabled cookies). A width
// preference is not worth failing the shell over, so both directions swallow it.
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
    // Ignored, see above.
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
  // The stored width is read after mount, and not in the initializer. The admin renders
  // on the server too, where there is no localStorage, and a first client render that
  // disagreed with the server markup would be a hydration mismatch on the style attribute.
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef<{ x: number; width: number } | null>(null);

  useEffect(() => {
    const stored = readStoredWidth();
    if (stored !== null) setWidth(clampWidth(stored));
  }, []);

  // A window that shrinks can leave the column wider than the clamp allows, which would
  // push the preview out of view until the next drag.
  useEffect(() => {
    const onWindowResize = () => setWidth(clampWidth);
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  // Only the settled width is stored. Writing on each pointermove would hit storage
  // synchronously on every frame of a drag.
  useEffect(() => {
    if (isResizing) return;
    writeStoredWidth(width);
  }, [isResizing, width]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      // Without this the drag starts a text selection in the form behind the handle.
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
    // Measured from where the drag began, not from the pointer position, so the column
    // does not jump by the offset between the grab point and the edge.
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
