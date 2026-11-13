import { afterEach, describe, expect, it, vi } from 'vitest';
import { destroyPreviewBridge } from './bridge';
import { readyMessage, valuesMessage } from './protocol';
import { createPreviewStore } from './store';

const fakeEditor = () =>
  ({ postMessage: vi.fn() }) as unknown as Window & { postMessage: any };

const flush = () => Promise.resolve().then(() => Promise.resolve());

afterEach(() => destroyPreviewBridge(window));

const streamValues = (
  editor: Window,
  values: Record<string, unknown>,
  document?: string
) => {
  const event = new MessageEvent('message', {
    data: valuesMessage(values, document),
  });
  Object.defineProperty(event, 'origin', { value: window.origin });
  Object.defineProperty(event, 'source', { value: editor });
  window.dispatchEvent(event);
};

describe('a preview outside the editor', () => {
  it('connects to nothing', () => {
    const listenerSpy = vi.spyOn(window, 'addEventListener');
    const documentSpy = vi.spyOn(document, 'addEventListener');
    const store = createPreviewStore({
      previewWindow: window,
      editorWindow: window,
    });
    const unsubscribe = store.subscribe(vi.fn());

    expect(listenerSpy).not.toHaveBeenCalled();
    expect(documentSpy).not.toHaveBeenCalled();
    expect(document.body.children).toHaveLength(0);
    expect(store.getSnapshot()).toBeNull();
    expect(() => unsubscribe()).not.toThrow();
    listenerSpy.mockRestore();
    documentSpy.mockRestore();
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

  it('announces readiness when the first subscriber arrives', async () => {
    const { editor, store } = embedded();
    expect(editor.postMessage).not.toHaveBeenCalled();
    store.subscribe(vi.fn());
    await flush();
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(undefined, window.location.href),
      window.origin
    );
  });

  it('takes values for its own document and none for another', () => {
    const editor = fakeEditor();
    const store = createPreviewStore({
      previewWindow: window,
      editorWindow: editor,
      document: 'a.md',
    });
    store.subscribe(vi.fn());
    streamValues(editor, { title: 'other' }, 'b.md');
    expect(store.getSnapshot()).toBeNull();
    streamValues(editor, { title: 'mine' }, 'a.md');
    expect(store.getSnapshot()).toEqual({ title: 'mine' });
  });

  it('declares its document with the bridge only while subscribed', async () => {
    const editor = fakeEditor();
    const store = createPreviewStore({
      previewWindow: window,
      editorWindow: editor,
      document: 'a.md',
      shared: true,
    });
    const unsubscribe = store.subscribe(vi.fn());
    await flush();
    expect(editor.postMessage).toHaveBeenLastCalledWith(
      readyMessage([{ path: 'a.md', shared: true }], window.location.href),
      window.origin
    );
    unsubscribe();
    await flush();
    expect(editor.postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'tina:documents', documents: [] }),
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

  it('shares one connection across subscribers', async () => {
    const { editor, store } = embedded();
    const first = vi.fn();
    const second = vi.fn();
    store.subscribe(first);
    store.subscribe(second);
    await flush();

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
