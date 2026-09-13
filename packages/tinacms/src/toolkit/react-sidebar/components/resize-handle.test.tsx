import { cleanup, fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ResizeOverlay } from '../../components/resize-overlay';
import { ResizeHandle } from './resize-handle';
import { SidebarContext } from './sidebar';

beforeAll(() => {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/* Mirrors how TinaUI wires the handle and the overlay to one resizing flag */
const Harness = ({ displayState = 'open' }: { displayState?: string }) => {
  const [resizingSidebar, setResizingSidebar] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(440);

  return (
    <SidebarContext.Provider
      value={{
        resizingSidebar,
        setResizingSidebar,
        sidebarWidth,
        setSidebarWidth,
        displayState,
      }}
    >
      <ResizeHandle />
      <ResizeOverlay isResizing={resizingSidebar} />
    </SidebarContext.Provider>
  );
};

describe('ResizeHandle', () => {
  it('captures the pointer and shows the overlay on a primary-button press', () => {
    const app = render(<Harness />);

    expect(app.queryByTestId('resize-overlay')).toBeNull();

    fireEvent.pointerDown(app.getByTestId('resize-handle'), {
      button: 0,
      pointerId: 1,
    });

    expect(Element.prototype.setPointerCapture).toHaveBeenCalledWith(1);
    expect(app.queryByTestId('resize-overlay')).not.toBeNull();
  });

  it('ignores non-primary buttons, so a right-click cannot strand the overlay', () => {
    const app = render(<Harness />);

    fireEvent.pointerDown(app.getByTestId('resize-handle'), {
      button: 2,
      pointerId: 1,
    });

    expect(Element.prototype.setPointerCapture).not.toHaveBeenCalled();
    expect(app.queryByTestId('resize-overlay')).toBeNull();
  });

  it('ends the resize when pointer capture is lost', () => {
    const app = render(<Harness />);
    const handle = app.getByTestId('resize-handle');

    fireEvent.pointerDown(handle, { button: 0, pointerId: 1 });
    expect(app.queryByTestId('resize-overlay')).not.toBeNull();

    fireEvent.lostPointerCapture(handle, { pointerId: 1 });

    expect(app.queryByTestId('resize-overlay')).toBeNull();
  });

  /* onLostPointerCapture never reaches React if the handle unmounts mid-drag */
  it('ends the resize on a window pointerup even if capture is never lost', () => {
    const app = render(<Harness />);

    fireEvent.pointerDown(app.getByTestId('resize-handle'), {
      button: 0,
      pointerId: 1,
    });
    expect(app.queryByTestId('resize-overlay')).not.toBeNull();

    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(app.queryByTestId('resize-overlay')).toBeNull();
  });

  it('ends the resize when the pointer is cancelled', () => {
    const app = render(<Harness />);

    fireEvent.pointerDown(app.getByTestId('resize-handle'), {
      button: 0,
      pointerId: 1,
    });
    expect(app.queryByTestId('resize-overlay')).not.toBeNull();

    fireEvent.pointerCancel(window, { pointerId: 1 });

    expect(app.queryByTestId('resize-overlay')).toBeNull();
  });

  it('is not rendered while the sidebar is fullscreen', () => {
    const app = render(<Harness displayState='fullscreen' />);

    expect(app.queryByTestId('resize-handle')).toBeNull();
  });
});
