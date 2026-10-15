import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useResize } from './use-resize';

interface FakeObserver {
  observed: Element[];
  disconnected: boolean;
  emit: (entry: ResizeObserverEntry) => void;
}

const observers: FakeObserver[] = [];
let realResizeObserver: typeof ResizeObserver | undefined;

/**
 * happy-dom never resizes an element, so a real `ResizeObserver` would never
 * call back. This stub is the only way to drive the callback.
 */
class StubResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    const record: FakeObserver = {
      observed: [],
      disconnected: false,
      emit: (entry) => callback([entry], this as unknown as ResizeObserver),
    };
    observers.push(record);
    this.record = record;
  }

  private record: FakeObserver;

  observe(element: Element) {
    this.record.observed.push(element);
  }

  unobserve() {}

  disconnect() {
    this.record.disconnected = true;
  }
}

beforeEach(() => {
  observers.length = 0;
  realResizeObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver =
    StubResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  if (realResizeObserver) {
    globalThis.ResizeObserver = realResizeObserver;
  }
});

const entryFor = (target: Element) =>
  ({ target, contentRect: { width: 500 } }) as unknown as ResizeObserverEntry;

const Watcher = ({
  onResize,
  attach = true,
}: {
  onResize: (entry: ResizeObserverEntry) => void;
  attach?: boolean;
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  useResize(ref, onResize);

  return <div ref={attach ? ref : undefined} />;
};

describe('useResize', () => {
  it('watches the element the ref points at', () => {
    render(<Watcher onResize={vi.fn()} />);

    expect(observers).toHaveLength(1);
    expect(observers[0].observed).toHaveLength(1);
  });

  it('reports each entry to the callback', () => {
    const onResize = vi.fn();
    render(<Watcher onResize={onResize} />);
    const target = observers[0].observed[0];

    observers[0].emit(entryFor(target));

    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledWith(entryFor(target));
  });

  /**
   * The toolbar measures itself with this hook. An observer that outlives its
   * element keeps the element alive, so every editor a form opens and closes
   * leaks one toolbar.
   */
  it('stops watching when the component unmounts', () => {
    const view = render(<Watcher onResize={vi.fn()} />);

    expect(observers[0].disconnected).toBe(false);

    view.unmount();

    expect(observers[0].disconnected).toBe(true);
  });

  it('watches nothing when the ref points at no element', () => {
    render(<Watcher onResize={vi.fn()} attach={false} />);

    expect(observers).toHaveLength(0);
  });
});
