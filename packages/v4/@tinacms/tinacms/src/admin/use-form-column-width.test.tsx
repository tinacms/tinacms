import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFormColumnWidth } from './use-form-column-width';

const STORAGE_KEY = 'tina-form-column-width';
const DEFAULT_WIDTH = 352;
const KEYBOARD_STEP = 16;
const MIN_PREVIEW_WIDTH = 400;
const WIDE_VIEWPORT = 1400;

// happy-dom has no pointer capture. The hook calls both methods during a drag,
// so the element needs them before a drag test can run.
Element.prototype.setPointerCapture = () => undefined;
Element.prototype.releasePointerCapture = () => undefined;

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true,
  });
};

const storedWidth = () => localStorage.getItem(STORAGE_KEY);

function Handle() {
  const { width, isResizing, handleProps } = useFormColumnWidth();
  return (
    <>
      <span data-testid='width'>{width}</span>
      <span data-testid='resizing'>{String(isResizing)}</span>
      <div {...handleProps} />
    </>
  );
}

const renderHandle = () => {
  render(<Handle />);
  return {
    handle: screen.getByRole('separator'),
    width: () => Number(screen.getByTestId('width').textContent),
    isResizing: () => screen.getByTestId('resizing').textContent === 'true',
  };
};

beforeEach(() => setViewportWidth(WIDE_VIEWPORT));
afterEach(() => vi.restoreAllMocks());

describe('useFormColumnWidth reading the stored width', () => {
  it('starts at the default width when storage holds nothing', () => {
    const { result } = renderHook(() => useFormColumnWidth());
    expect(result.current.width).toBe(DEFAULT_WIDTH);
  });

  it('restores a stored width on mount', () => {
    localStorage.setItem(STORAGE_KEY, '600');
    const { result } = renderHook(() => useFormColumnWidth());
    expect(result.current.width).toBe(600);
  });

  it('ignores a stored value that is not a number', () => {
    localStorage.setItem(STORAGE_KEY, 'abc');
    const { result } = renderHook(() => useFormColumnWidth());
    expect(result.current.width).toBe(DEFAULT_WIDTH);
  });

  it('ignores a stored width of zero or less', () => {
    localStorage.setItem(STORAGE_KEY, '-5');
    const { result } = renderHook(() => useFormColumnWidth());
    expect(result.current.width).toBe(DEFAULT_WIDTH);
  });

  it('uses the default width when storage denies a read', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('storage is not available');
    });
    const { result } = renderHook(() => useFormColumnWidth());
    expect(result.current.width).toBe(DEFAULT_WIDTH);
  });

  it('keeps the column usable when storage denies a write', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('the storage quota is full');
    });
    const { result } = renderHook(() => useFormColumnWidth());
    expect(result.current.width).toBe(DEFAULT_WIDTH);
  });
});

describe('useFormColumnWidth keyboard resize', () => {
  it('makes the column wider by one step on ArrowRight', () => {
    const { handle, width } = renderHandle();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(width()).toBe(DEFAULT_WIDTH + KEYBOARD_STEP);
  });

  it('makes the column narrower by one step on ArrowLeft', () => {
    localStorage.setItem(STORAGE_KEY, '600');
    const { handle, width } = renderHandle();
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(width()).toBe(600 - KEYBOARD_STEP);
  });

  it('holds the minimum width when ArrowLeft goes below it', () => {
    const { handle, width } = renderHandle();
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(width()).toBe(DEFAULT_WIDTH);
  });

  it('keeps the preview minimum width when ArrowRight goes past it', () => {
    localStorage.setItem(
      STORAGE_KEY,
      String(WIDE_VIEWPORT - MIN_PREVIEW_WIDTH)
    );
    const { handle, width } = renderHandle();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(width()).toBe(WIDE_VIEWPORT - MIN_PREVIEW_WIDTH);
  });

  it('returns to the default width on Home', () => {
    localStorage.setItem(STORAGE_KEY, '600');
    const { handle, width } = renderHandle();
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(width()).toBe(DEFAULT_WIDTH);
  });

  it('stops the browser default for a key it handles', () => {
    const { handle } = renderHandle();
    expect(fireEvent.keyDown(handle, { key: 'ArrowRight' })).toBe(false);
  });

  it('leaves a key it does not handle to the browser', () => {
    const { handle, width } = renderHandle();
    expect(fireEvent.keyDown(handle, { key: 'a' })).toBe(true);
    expect(width()).toBe(DEFAULT_WIDTH);
  });

  it('stores the width that the keyboard set', () => {
    const { handle } = renderHandle();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(storedWidth()).toBe(String(DEFAULT_WIDTH + KEYBOARD_STEP));
  });
});

describe('useFormColumnWidth pointer drag', () => {
  it('makes the column wider by the pointer distance', () => {
    const { handle, width } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 160, pointerId: 1 });
    expect(width()).toBe(DEFAULT_WIDTH + 60);
  });

  it('makes the column narrower when the pointer moves left', () => {
    localStorage.setItem(STORAGE_KEY, '600');
    const { handle, width } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 200, pointerId: 1 });
    expect(width()).toBe(500);
  });

  it('keeps the preview minimum width when the drag goes past it', () => {
    const { handle, width } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 5000, pointerId: 1 });
    expect(width()).toBe(WIDE_VIEWPORT - MIN_PREVIEW_WIDTH);
  });

  it('reports a drag in progress until the pointer lifts', () => {
    const { handle, isResizing } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    expect(isResizing()).toBe(true);
    fireEvent.pointerUp(handle, { clientX: 100, pointerId: 1 });
    expect(isResizing()).toBe(false);
  });

  it('holds the stored width until the drag ends', () => {
    const { handle } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 160, pointerId: 1 });
    expect(storedWidth()).toBe(String(DEFAULT_WIDTH));
  });

  it('stores the width when the drag ends', () => {
    const { handle } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 160, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 160, pointerId: 1 });
    expect(storedWidth()).toBe(String(DEFAULT_WIDTH + 60));
  });

  it('ends the drag when the pointer is cancelled', () => {
    const { handle, isResizing } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerCancel(handle, { clientX: 100, pointerId: 1 });
    expect(isResizing()).toBe(false);
  });

  // React catches an error that an event handler throws and reports it. The
  // width alone cannot show the difference, because a handler that throws also
  // leaves the width alone.
  it('ignores a pointer move that no drag started', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { handle, width } = renderHandle();
    fireEvent.pointerMove(handle, { clientX: 900, pointerId: 1 });
    expect(width()).toBe(DEFAULT_WIDTH);
    expect(reported).not.toHaveBeenCalled();
  });

  it('ignores a pointer move after the drag ended', () => {
    const { handle, width } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 160, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 160, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 900, pointerId: 1 });
    expect(width()).toBe(DEFAULT_WIDTH + 60);
  });

  // A release without a capture throws in a browser. happy-dom cannot show
  // that, so the test watches the call instead of the effect.
  it('releases no pointer capture when no drag started', () => {
    const release = vi.spyOn(Element.prototype, 'releasePointerCapture');
    const { handle, isResizing } = renderHandle();
    fireEvent.pointerUp(handle, { clientX: 900, pointerId: 1 });
    expect(release).not.toHaveBeenCalled();
    expect(isResizing()).toBe(false);
  });

  it('captures the pointer for the length of the drag', () => {
    const capture = vi.spyOn(Element.prototype, 'setPointerCapture');
    const { handle } = renderHandle();
    fireEvent.pointerDown(handle, { clientX: 100, pointerId: 7 });
    expect(capture).toHaveBeenCalledWith(7);
  });
});

describe('useFormColumnWidth window resize', () => {
  it('makes the column narrower when the window leaves too little room', () => {
    localStorage.setItem(STORAGE_KEY, '900');
    const { width } = renderHandle();
    setViewportWidth(1000);
    fireEvent(window, new Event('resize'));
    expect(width()).toBe(1000 - MIN_PREVIEW_WIDTH);
  });

  it('stops listening to the window after unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useFormColumnWidth());
    unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});

describe('useFormColumnWidth handle', () => {
  it('names the handle as a vertical separator', () => {
    const { handle } = renderHandle();
    expect(handle).toHaveAccessibleName('Resize the form column');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('reports the current width to assistive technology', () => {
    const { handle } = renderHandle();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle).toHaveAttribute(
      'aria-valuenow',
      String(DEFAULT_WIDTH + KEYBOARD_STEP)
    );
  });

  it('takes keyboard focus', () => {
    const { handle } = renderHandle();
    expect(handle).toHaveAttribute('tabindex', '0');
  });
});

describe('useFormColumnWidth stored width survival', () => {
  it('keeps a stored width that the window is momentarily too narrow to show', () => {
    setViewportWidth(700);
    localStorage.setItem(STORAGE_KEY, '600');
    renderHook(() => useFormColumnWidth());
    expect(storedWidth()).toBe('600');
  });

  it('never writes the default width over a stored width', () => {
    localStorage.setItem(STORAGE_KEY, '600');
    const writes: string[] = [];
    const write = window.localStorage.setItem.bind(window.localStorage);
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(
      (key: string, value: string) => {
        writes.push(value);
        write(key, value);
      }
    );
    renderHook(() => useFormColumnWidth());
    expect(writes).not.toContain(String(DEFAULT_WIDTH));
  });
});
