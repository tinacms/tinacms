import { describe, expect, it, vi } from 'vitest';
import { readyMessage, valuesMessage } from './protocol';
import { createPreviewStore } from './store';

const fakeEditor = () =>
  ({ postMessage: vi.fn() }) as unknown as Window & { postMessage: any };

const streamValues = (editor: Window, values: Record<string, unknown>) => {
  const event = new MessageEvent('message', { data: valuesMessage(values) });
  Object.defineProperty(event, 'origin', { value: window.origin });
  Object.defineProperty(event, 'source', { value: editor });
  window.dispatchEvent(event);
};

describe('a preview outside the editor', () => {
  it('connects to nothing', () => {
    const listenerSpy = vi.spyOn(window, 'addEventListener');
    const store = createPreviewStore({
      previewWindow: window,
      editorWindow: window,
    });
    const unsubscribe = store.subscribe(vi.fn());

    expect(listenerSpy).not.toHaveBeenCalledWith('message', expect.anything());
    expect(store.getSnapshot()).toBeNull();
    expect(() => unsubscribe()).not.toThrow();
    listenerSpy.mockRestore();
  });
});

describe('a preview embedded in the editor', () => {
  const embedded = () => {
    const editor = fakeEditor();
    const store = createPreviewStore({
      previewWindow: window,
      editorWindow: editor,
    });
    return { editor, store };
  };

  it('has streamed nothing until the editor says otherwise', () => {
    const { store } = embedded();
    expect(store.getSnapshot()).toBeNull();
    expect(store.getServerSnapshot()).toBeNull();
  });

  it('announces readiness when the first subscriber arrives', () => {
    const { editor, store } = embedded();
    expect(editor.postMessage).not.toHaveBeenCalled();
    store.subscribe(vi.fn());
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(),
      window.origin
    );
  });

  it('adopts a streamed document and tells its subscribers', () => {
    const { editor, store } = embedded();
    const onChange = vi.fn();
    store.subscribe(onChange);

    streamValues(editor, { title: 'Edited live' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toEqual({ title: 'Edited live' });
  });

  it('holds the snapshot steady between messages', () => {
    const { editor, store } = embedded();
    store.subscribe(vi.fn());
    streamValues(editor, { title: 'Edited live' });
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('shares one connection across subscribers', () => {
    const { editor, store } = embedded();
    const first = vi.fn();
    const second = vi.fn();
    store.subscribe(first);
    store.subscribe(second);

    expect(editor.postMessage).toHaveBeenCalledTimes(1);
    streamValues(editor, { title: 'Edited live' });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('keeps listening while any subscriber remains', () => {
    const { editor, store } = embedded();
    const staying = vi.fn();
    const leaving = vi.fn();
    store.subscribe(staying);
    const unsubscribe = store.subscribe(leaving);

    unsubscribe();
    streamValues(editor, { title: 'Edited live' });

    expect(staying).toHaveBeenCalledTimes(1);
    expect(leaving).not.toHaveBeenCalled();
  });

  it('disconnects when the last subscriber leaves', () => {
    const { editor, store } = embedded();
    const onChange = vi.fn();
    const unsubscribe = store.subscribe(onChange);

    unsubscribe();
    streamValues(editor, { title: 'Edited live' });

    expect(onChange).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBeNull();
  });
});
