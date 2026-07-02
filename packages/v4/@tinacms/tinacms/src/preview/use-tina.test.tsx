import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readyMessage, valuesMessage } from './protocol';
import { useTina } from './use-tina';

// Embedded-path scaffolding: happy-dom's window.parent === window (the
// standalone default), so embedding is simulated by swapping window.parent for
// a fake editor window and restoring it after each test.
const realParent = window.parent;
afterEach(() => {
  Object.defineProperty(window, 'parent', {
    value: realParent,
    configurable: true,
  });
});

const embedInEditor = () => {
  const editor = { postMessage: vi.fn() } as unknown as Window & {
    postMessage: any;
  };
  Object.defineProperty(window, 'parent', {
    value: editor,
    configurable: true,
  });
  return editor;
};

const valuesFromEditor = (editor: Window, values: Record<string, unknown>) => {
  const event = new MessageEvent('message', { data: valuesMessage(values) });
  Object.defineProperty(event, 'origin', { value: window.origin });
  Object.defineProperty(event, 'source', { value: editor });
  act(() => {
    window.dispatchEvent(event);
  });
};

describe('useTina standalone', () => {
  it('passes props data through untouched and never signals editing', () => {
    const listenerSpy = vi.spyOn(window, 'addEventListener');
    const { result, rerender } = renderHook(({ data }) => useTina({ data }), {
      initialProps: { data: { title: 'Static' } },
    });
    expect(result.current).toEqual({
      data: { title: 'Static' },
      isEditing: false,
    });
    rerender({ data: { title: 'Regenerated' } });
    expect(result.current.data).toEqual({ title: 'Regenerated' });
    // Inert outside the editor: no message listener, no ready beacon.
    expect(listenerSpy).not.toHaveBeenCalledWith('message', expect.anything());
    listenerSpy.mockRestore();
  });
});

describe('useTina embedded in the editor', () => {
  it('announces readiness on mount', () => {
    const editor = embedInEditor();
    renderHook(() => useTina({ data: { title: 'Static' } }));
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(),
      window.origin
    );
  });

  it('adopts streamed values and flips isEditing', () => {
    const editor = embedInEditor();
    const { result } = renderHook(() => useTina({ data: { title: 'Static' } }));
    expect(result.current.isEditing).toBe(false);
    valuesFromEditor(editor, { title: 'Edited live' });
    expect(result.current).toEqual({
      data: { title: 'Edited live' },
      isEditing: true,
    });
  });

  it('streamed values win over a later data prop change', () => {
    const editor = embedInEditor();
    const { result, rerender } = renderHook(({ data }) => useTina({ data }), {
      initialProps: { data: { title: 'Static' } },
    });
    valuesFromEditor(editor, { title: 'Edited live' });
    rerender({ data: { title: 'Regenerated' } });
    expect(result.current.data).toEqual({ title: 'Edited live' });
  });

  it('disconnects on unmount', () => {
    const editor = embedInEditor();
    const { unmount } = renderHook(() =>
      useTina({ data: { title: 'Static' } })
    );
    unmount();
    editor.postMessage.mockClear();
    const marked = document.createElement('h1');
    marked.setAttribute('data-tina-field', 'title');
    document.body.appendChild(marked);
    marked.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(editor.postMessage).not.toHaveBeenCalled();
    marked.remove();
  });
});
