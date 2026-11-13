import { act, render, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { destroyPreviewBridge } from '../../preview/bridge';
import {
  documentsMessage,
  readyMessage,
  valuesMessage,
} from '../../preview/protocol';
import { useTina } from './use-tina';

const realParent = window.parent;
const flush = () => act(async () => {});

afterEach(() => {
  destroyPreviewBridge(window);
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

const valuesFromEditor = (
  editor: Window,
  values: Record<string, unknown>,
  document?: string
) => {
  const event = new MessageEvent('message', {
    data: valuesMessage(values, document),
  });
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
    expect(result.current).toMatchObject({
      data: { title: 'Static' },
      isEditing: false,
    });
    rerender({ data: { title: 'Regenerated' } });
    expect(result.current.data).toEqual({ title: 'Regenerated' });
    expect(listenerSpy).not.toHaveBeenCalledWith('message', expect.anything());
    listenerSpy.mockRestore();
  });
});

describe('useTina embedded in the editor', () => {
  it('announces readiness on mount', async () => {
    const editor = embedInEditor();
    renderHook(() => useTina({ data: { title: 'Static' } }));
    await flush();
    expect(editor.postMessage).toHaveBeenCalledWith(
      readyMessage(undefined, window.location.href),
      window.origin
    );
  });

  it('adopts streamed values and flips isEditing', () => {
    const editor = embedInEditor();
    const { result } = renderHook(() => useTina({ data: { title: 'Static' } }));
    expect(result.current.isEditing).toBe(false);
    valuesFromEditor(editor, { title: 'Edited live' });
    expect(result.current).toMatchObject({
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

  it('stops taking values on unmount', async () => {
    const editor = embedInEditor();
    const { result, unmount } = renderHook(() =>
      useTina({ data: { title: 'Static' } })
    );
    unmount();
    valuesFromEditor(editor, { title: 'Late' });
    expect(result.current.data).toEqual({ title: 'Static' });
  });
});

describe('useTina with a declared document', () => {
  it('takes values for its document and for none, and ignores another document', () => {
    const editor = embedInEditor();
    const { result } = renderHook(() =>
      useTina({ data: { title: 'Static' }, document: 'a.md' })
    );
    valuesFromEditor(editor, { title: 'B' }, 'b.md');
    expect(result.current.isEditing).toBe(false);
    valuesFromEditor(editor, { title: 'A' }, 'a.md');
    expect(result.current.data).toEqual({ title: 'A' });
    valuesFromEditor(editor, { title: 'Old admin' });
    expect(result.current.data).toEqual({ title: 'Old admin' });
  });

  it('two hooks mounted together send one ready listing both', async () => {
    const editor = embedInEditor();
    renderHook(() => {
      useTina({ data: {}, document: 'a.md' });
      useTina({ data: {}, document: 'nav.json', shared: true });
    });
    await flush();
    const readies = editor.postMessage.mock.calls.filter(
      ([message]: [{ type: string }]) => message.type === 'tina:ready'
    );
    expect(readies).toHaveLength(1);
    expect(readies[0][0]).toEqual(
      readyMessage(
        [{ path: 'a.md' }, { path: 'nav.json', shared: true }],
        window.location.href
      )
    );
  });

  it('sends one documents message with the rest when a hook unmounts, and nothing extra under strict mode', async () => {
    const editor = embedInEditor();
    const Second = () => {
      useTina({ data: {}, document: 'b.md' });
      return null;
    };
    const First = ({ both }: { both: boolean }) => {
      useTina({ data: {}, document: 'a.md' });
      return both ? <Second /> : null;
    };
    const { rerender } = render(<First both />, { reactStrictMode: true });
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(1);
    editor.postMessage.mockClear();
    rerender(<First both={false} />);
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(1);
    expect(editor.postMessage).toHaveBeenCalledWith(
      documentsMessage([{ path: 'a.md' }], window.location.href),
      window.origin
    );
  });

  it('drops streamed values at once when the document changes without a remount', async () => {
    const editor = embedInEditor();
    const { result, rerender } = renderHook(
      ({ document, data }) => useTina({ data, document }),
      { initialProps: { document: 'a.md', data: { title: 'A static' } } }
    );
    await flush();
    valuesFromEditor(editor, { title: 'A streamed' }, 'a.md');
    expect(result.current.data).toEqual({ title: 'A streamed' });
    editor.postMessage.mockClear();

    rerender({ document: 'b.md', data: { title: 'B static' } });
    expect(result.current.data).toEqual({ title: 'B static' });
    expect(result.current.isEditing).toBe(false);
    await flush();
    expect(editor.postMessage).toHaveBeenCalledTimes(1);
    expect(editor.postMessage).toHaveBeenCalledWith(
      documentsMessage([{ path: 'b.md' }], window.location.href),
      window.origin
    );
    valuesFromEditor(editor, { title: 'A late' }, 'a.md');
    expect(result.current.data).toEqual({ title: 'B static' });
    valuesFromEditor(editor, { title: 'B streamed' }, 'b.md');
    expect(result.current.data).toEqual({ title: 'B streamed' });
  });

  it('returns a tinaField bound to the hook document', () => {
    embedInEditor();
    const { result } = renderHook(() =>
      useTina({ data: {}, document: 'a.md' })
    );
    expect(result.current.tinaField('title')).toEqual({
      'data-tina-field': 'title',
      'data-tina-document': 'a.md',
    });
    const { result: bare } = renderHook(() => useTina({ data: {} }));
    expect(bare.current.tinaField('title')).toEqual({
      'data-tina-field': 'title',
    });
  });

  it('a second hook with another allowedOrigin fails naming both', () => {
    embedInEditor();
    renderHook(() =>
      useTina({ data: {}, allowedOrigin: 'https://one.example' })
    );
    expect(() =>
      renderHook(() =>
        useTina({ data: {}, allowedOrigin: 'https://two.example' })
      )
    ).toThrow(/two\.example.*one\.example/);
  });
});

describe('useTina on a live site', () => {
  it('adds no click or pointer listener and no overlay outside a frame', () => {
    const documentSpy = vi.spyOn(document, 'addEventListener');
    const windowSpy = vi.spyOn(window, 'addEventListener');
    const childrenBefore = document.body.children.length;
    renderHook(() => useTina({ data: {}, document: 'a.md' }));
    expect(documentSpy).not.toHaveBeenCalled();
    expect(windowSpy).not.toHaveBeenCalledWith(
      'click',
      expect.anything(),
      true
    );
    expect(document.body.children.length).toBe(childrenBefore + 1);
    documentSpy.mockRestore();
    windowSpy.mockRestore();
  });

  it('leaves a marked link alone in a frame whose parent never answers', async () => {
    const editor = embedInEditor();
    renderHook(() => useTina({ data: {} }));
    await flush();
    editor.postMessage.mockClear();
    const link = document.createElement('a');
    link.href = '/next';
    link.setAttribute('data-tina-field', 'title');
    document.body.append(link);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(editor.postMessage).not.toHaveBeenCalled();
    link.remove();
  });
});
