import { afterEach, describe, expect, it, vi } from 'vitest';
import { type PreviewConnection, connectToEditor } from './connection';
import { activateMessage, readyMessage, valuesMessage } from './protocol';

// happy-dom's MessageEvent constructor doesn't reliably carry origin/source, so
// force them on — every test needs both for the guards under test.
const messageEvent = (data: unknown, origin: string, source: unknown) => {
  const event = new MessageEvent('message', { data });
  Object.defineProperty(event, 'origin', { value: origin });
  Object.defineProperty(event, 'source', { value: source });
  return event;
};

const fakeEditorWindow = () =>
  ({ postMessage: vi.fn() }) as unknown as Window & { postMessage: any };

describe('connectToEditor', () => {
  let connection: PreviewConnection | null = null;
  afterEach(() => {
    connection?.disconnect();
    connection = null;
  });

  it('announces readiness to the editor once listening', () => {
    const editor = fakeEditorWindow();
    connection = connectToEditor({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: window.origin,
      onValues: vi.fn(),
    });
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(),
      window.origin
    );
  });

  it('adopts values messages from the editor window at the allowed origin', () => {
    const editor = fakeEditorWindow();
    const onValues = vi.fn();
    connection = connectToEditor({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: window.origin,
      onValues,
    });
    window.dispatchEvent(
      messageEvent(valuesMessage({ title: 'Hello' }), window.origin, editor)
    );
    expect(onValues).toHaveBeenCalledWith({ title: 'Hello' });
  });

  it('ignores the wrong origin, the wrong source, and malformed data', () => {
    const editor = fakeEditorWindow();
    const onValues = vi.fn();
    connection = connectToEditor({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: window.origin,
      onValues,
    });
    window.dispatchEvent(
      messageEvent(valuesMessage({}), 'https://evil.example', editor)
    );
    window.dispatchEvent(
      messageEvent(valuesMessage({}), window.origin, { not: 'the editor' })
    );
    window.dispatchEvent(
      messageEvent({ type: 'tina:values' }, window.origin, editor)
    );
    expect(onValues).not.toHaveBeenCalled();
  });

  it('sends a click on a marked element up as an activate message', () => {
    const editor = fakeEditorWindow();
    connection = connectToEditor({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: window.origin,
      onValues: vi.fn(),
    });
    const marked = document.createElement('h1');
    marked.setAttribute('data-tina-field', 'title');
    const child = document.createElement('span');
    marked.appendChild(child);
    document.body.appendChild(marked);
    // Clicks bubble up from descendants of the marked element too (closest).
    child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(editor.postMessage).toHaveBeenCalledWith(
      activateMessage('title'),
      window.origin
    );
    marked.remove();
  });

  it('posts nothing for a click outside marked elements', () => {
    const editor = fakeEditorWindow();
    connection = connectToEditor({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: window.origin,
      onValues: vi.fn(),
    });
    editor.postMessage.mockClear();
    const unmarked = document.createElement('p');
    document.body.appendChild(unmarked);
    unmarked.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(editor.postMessage).not.toHaveBeenCalled();
    unmarked.remove();
  });

  it("rejects '*' as allowedOrigin at construction", () => {
    expect(() =>
      connectToEditor({
        previewWindow: window,
        editorWindow: fakeEditorWindow(),
        allowedOrigin: '*',
        onValues: vi.fn(),
      })
    ).toThrow('preview-allowed-origin-wildcard');
  });

  it('honors a custom allowedOrigin — the cross-origin opt-in', () => {
    const editor = fakeEditorWindow();
    const onValues = vi.fn();
    const editorOrigin = 'https://editor.example';
    connection = connectToEditor({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: editorOrigin,
      onValues,
    });
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(),
      editorOrigin
    );
    // The preview's own origin is no longer the allowed one.
    window.dispatchEvent(
      messageEvent(valuesMessage({ title: 'own' }), window.origin, editor)
    );
    expect(onValues).not.toHaveBeenCalled();
    window.dispatchEvent(
      messageEvent(valuesMessage({ title: 'cross' }), editorOrigin, editor)
    );
    expect(onValues).toHaveBeenCalledWith({ title: 'cross' });
  });

  it('disconnect removes both listeners', () => {
    const editor = fakeEditorWindow();
    const onValues = vi.fn();
    connection = connectToEditor({
      previewWindow: window,
      editorWindow: editor,
      allowedOrigin: window.origin,
      onValues,
    });
    connection.disconnect();
    connection = null;
    editor.postMessage.mockClear();
    window.dispatchEvent(
      messageEvent(valuesMessage({ title: 'late' }), window.origin, editor)
    );
    const marked = document.createElement('h1');
    marked.setAttribute('data-tina-field', 'title');
    document.body.appendChild(marked);
    marked.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onValues).not.toHaveBeenCalled();
    expect(editor.postMessage).not.toHaveBeenCalled();
    marked.remove();
  });
});
