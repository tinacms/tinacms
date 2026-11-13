import { act, render, screen, waitFor } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import { toFieldAddress } from '../core/field/address';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import referenceFieldPlugin from '../plugins/fields/reference/reference-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  activateMessage,
  documentsMessage,
  readyMessage,
} from '../preview/protocol';
import { TinaProvider } from './index';
import {
  type PreviewConnectionOptions,
  usePreviewConnection,
} from './preview-connection';

const post: CollectionSchema = {
  name: 'post',
  path: 'content/posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.reference({ name: 'author', label: 'Author', collections: ['author'] }),
  ],
};
const author: CollectionSchema = {
  name: 'author',
  path: 'content/authors',
  format: 'md',
  fields: [t.string({ name: 'name', label: 'Name' })],
};
const global: CollectionSchema = {
  name: 'global',
  path: 'content/global',
  format: 'json',
  fields: [t.string({ name: 'siteName', label: 'Site name' })],
};

const A = 'content/posts/a.mdx';
const B = 'content/posts/b.mdx';
const AUTHOR = 'content/authors/jane.md';
const NAV = 'content/global/site.json';
const POST_REF = { collection: 'post', path: A };
const AUTHOR_REF = { collection: 'author', path: AUTHOR };

const documents: Record<string, TinaDocument> = {
  [A]: { title: 'A', author: AUTHOR },
  [B]: { title: 'B' },
  [AUTHOR]: { name: 'Jane' },
  [NAV]: { siteName: 'Site' },
};

const frame = () => {
  const contentWindow = { postMessage: vi.fn() };
  return {
    ref: {
      current: { contentWindow } as unknown as HTMLIFrameElement,
    } as RefObject<HTMLIFrameElement | null>,
    window: contentWindow,
    posted: (type: string) =>
      contentWindow.postMessage.mock.calls
        .map(([message]) => message)
        .filter((message) => message.type === type),
  };
};

const fromPage = (data: unknown, page: { postMessage: unknown }) => {
  const event = new MessageEvent('message', { data });
  Object.defineProperty(event, 'origin', { value: window.origin });
  Object.defineProperty(event, 'source', { value: page });
  act(() => {
    window.dispatchEvent(event);
  });
};

const register = (path: string) =>
  act(() => {
    useFormStore.getState().registerForm(toFormId(path), {
      ...Object.fromEntries(
        Object.entries(documents[path] ?? {}).map(([key, value]) => [
          toFieldAddress(key),
          value,
        ])
      ),
    });
  });

const get = vi.fn(async (_collection: string, path: string) =>
  documents[path] ? { path, document: documents[path] } : null
);

const contentPlugin = definePlugin({
  name: 'test:content:stub',
  provides: ['content'],
  client: async () => ({
    default: {
      slice: () => ({
        get,
        list: async () => [],
        update: async (_c: string, p: string, value: TinaDocument) => ({
          path: p,
          document: value,
        }),
      }),
    },
  }),
});

function Connection({
  iframeRef,
  options,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  options: PreviewConnectionOptions;
}) {
  usePreviewConnection(iframeRef, options);
  return <p>connected</p>;
}

const setup = async (options: PreviewConnectionOptions = {}) => {
  const page = frame();
  const onOpen = vi.fn();
  const onNothingToEdit = vi.fn();
  const merged = { onOpen, onNothingToEdit, ...options };
  const view = render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [stringFieldPlugin, referenceFieldPlugin, contentPlugin],
        schema: { collections: [post, author, global] },
      })}
    >
      <Connection iframeRef={page.ref} options={merged} />
    </TinaProvider>
  );
  await screen.findByText('connected');
  return { page, onOpen, onNothingToEdit, view, merged };
};

const URL_A = 'http://site.test/a';
const URL_B = 'http://site.test/b';

beforeEach(() => {
  act(() => {
    useFormStore.setState({ forms: {}, active: null, hovered: null });
  });
  get.mockClear();
});
afterEach(() => vi.restoreAllMocks());

describe('declared pages', () => {
  it('posts each declared document that has a form, named by its path', async () => {
    register(A);
    register(NAV);
    const { page } = await setup({ open: POST_REF });
    fromPage(
      readyMessage(
        [{ path: A }, { path: NAV, shared: true }, { path: B }],
        URL_A
      ),
      page.window
    );
    const values = page.posted('tina:values');
    expect(values.map((message) => message.document).sort()).toEqual([NAV, A]);
    expect(values.find((message) => message.document === NAV).values).toEqual({
      siteName: 'Site',
    });
  });

  it('replies to every ready with the values and the outline, even when nothing changed', async () => {
    register(A);
    const { page } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    expect(page.posted('tina:outline')).toHaveLength(2);
    expect(page.posted('tina:values')).toHaveLength(2);
  });

  it('shows an author edit on the post page while the author is open', async () => {
    register(A);
    register(AUTHOR);
    const { page } = await setup({
      open: AUTHOR_REF,
      step: { from: POST_REF, prefix: 'author' },
    });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    page.window.postMessage.mockClear();
    act(() => {
      useFormStore
        .getState()
        .setFieldValue(toFormId(AUTHOR), toFieldAddress('name'), 'Janet');
    });
    const latest = page.posted('tina:values').at(-1);
    expect(latest.document).toBe(A);
    expect(latest.values.author).toEqual({ name: 'Janet' });
  });

  it('posts the document a step came from to a page that declares nothing', async () => {
    register(A);
    register(AUTHOR);
    const { page } = await setup({
      open: AUTHOR_REF,
      step: { from: POST_REF, prefix: 'author' },
    });
    fromPage(readyMessage(), page.window);
    const latest = page.posted('tina:values').at(-1);
    expect(latest.document).toBeUndefined();
    expect(latest.values.title).toBe('A');
  });
});

describe('following the page', () => {
  it('does not move the form in the first visit, and a click then opens the page’s document', async () => {
    register(B);
    const { page, onOpen } = await setup({
      open: { collection: 'post', path: B },
    });
    fromPage(readyMessage([{ path: NAV, shared: true }], URL_A), page.window);
    fromPage(
      documentsMessage([{ path: NAV, shared: true }, { path: A }], URL_A),
      page.window
    );
    expect(onOpen).not.toHaveBeenCalled();
    register(A);
    fromPage(activateMessage('title'), page.window);
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(POST_REF, null);
    expect(useFormStore.getState().active).toEqual({
      formId: toFormId(A),
      address: 'title',
    });
  });

  it('opens the document of a followed page', async () => {
    register(A);
    const { page, onOpen } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(readyMessage([{ path: B }], URL_B), page.window);
    await waitFor(() =>
      expect(onOpen).toHaveBeenCalledExactlyOnceWith(
        { collection: 'post', path: B },
        null
      )
    );
  });

  it('leaves the form and warns once for a missing document and for a path no collection owns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    register(A);
    const { page, onOpen } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(
      readyMessage([{ path: 'content/posts/gone.mdx' }], URL_B),
      page.window
    );
    await waitFor(() => expect(warn).toHaveBeenCalledTimes(1));
    fromPage(
      documentsMessage([{ path: 'elsewhere/x.md' }], URL_B),
      page.window
    );
    fromPage(
      documentsMessage([{ path: 'elsewhere/x.md' }], URL_B),
      page.window
    );
    await waitFor(() => expect(warn).toHaveBeenCalledTimes(2));
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('shows Nothing to edit for a followed page that declares only a shared document', async () => {
    register(A);
    const { page, onNothingToEdit } = await setup({ open: POST_REF });
    vi.useFakeTimers();
    try {
      fromPage(readyMessage([{ path: A }], URL_A), page.window);
      fromPage(readyMessage([{ path: NAV, shared: true }], URL_B), page.window);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onNothingToEdit).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('never navigates while the preview is hidden', async () => {
    register(A);
    const { page, onOpen } = await setup({
      open: POST_REF,
      showsPreview: false,
    });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(readyMessage([{ path: B }], URL_B), page.window);
    fromPage(activateMessage('title', B), page.window);
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('clicks on a declared page', () => {
  it('opens the author as a reference step from the post, with the field active', async () => {
    register(A);
    register(AUTHOR);
    const { page, onOpen } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(activateMessage('author.name'), page.window);
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(AUTHOR_REF, {
      from: POST_REF,
      prefix: 'author',
    });
    expect(useFormStore.getState().active).toEqual({
      formId: toFormId(AUTHOR),
      address: 'name',
    });
  });

  it('sets the field when the click is in the document the form shows, and goes back for the document a step came from', async () => {
    register(A);
    register(AUTHOR);
    const { page, onOpen } = await setup({
      open: AUTHOR_REF,
      step: { from: POST_REF, prefix: 'author' },
    });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(activateMessage('author.name'), page.window);
    expect(onOpen).not.toHaveBeenCalled();
    expect(useFormStore.getState().active?.formId).toBe(toFormId(AUTHOR));
    fromPage(activateMessage('title'), page.window);
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(POST_REF, null);
    expect(useFormStore.getState().active).toEqual({
      formId: toFormId(A),
      address: 'title',
    });
  });

  it('opens a shared document as a reference step from the open document', async () => {
    register(A);
    register(NAV);
    const { page, onOpen } = await setup({ open: POST_REF });
    fromPage(
      readyMessage([{ path: NAV, shared: true }, { path: A }], URL_A),
      page.window
    );
    fromPage(activateMessage('siteName', NAV), page.window);
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(
      { collection: 'global', path: NAV },
      { from: POST_REF }
    );
  });

  it('on Collections, opens the page’s document with no step back, and the author as a step from the post', async () => {
    register(A);
    register(AUTHOR);
    const { page, onOpen } = await setup({ open: null });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(activateMessage('title'), page.window);
    expect(onOpen).toHaveBeenLastCalledWith(POST_REF, null);
    fromPage(activateMessage('author.name'), page.window);
    expect(onOpen).toHaveBeenLastCalledWith(AUTHOR_REF, {
      from: POST_REF,
      prefix: 'author',
    });
  });

  it('on Collections, ignores a click from a page that declares nothing', async () => {
    register(A);
    const { page, onOpen } = await setup({ open: null });
    fromPage(readyMessage(), page.window);
    fromPage(activateMessage('title'), page.window);
    expect(onOpen).not.toHaveBeenCalled();
    expect(useFormStore.getState().active).toBeNull();
  });

  it('leaves the form and warns once for a reference whose document is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const missing = 'content/authors/gone.md';
    act(() => {
      useFormStore.getState().registerForm(toFormId(A), {
        [toFieldAddress('title')]: 'A',
        [toFieldAddress('author')]: missing,
      });
    });
    const { page, onOpen } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    fromPage(activateMessage('author.name'), page.window);
    await waitFor(() => expect(warn).toHaveBeenCalledTimes(1));
    fromPage(activateMessage('author.name'), page.window);
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(warn).toHaveBeenCalledTimes(1);
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('outline', () => {
  const outlines = (page: ReturnType<typeof frame>) =>
    page.posted('tina:outline');

  it('names the active field with the label the trail uses, on its declared document', async () => {
    register(A);
    const { page } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    page.window.postMessage.mockClear();
    act(() => {
      useFormStore.getState().setActive(toFormId(A), toFieldAddress('title'));
    });
    await waitFor(() => expect(outlines(page)).toHaveLength(1));
    expect(outlines(page)[0]).toMatchObject({
      active: { address: 'title', document: A, name: 'Title' },
      hovered: null,
    });
  });

  it('maps a field of a step’s document onto the reference it came through', async () => {
    register(A);
    register(AUTHOR);
    const { page } = await setup({
      open: AUTHOR_REF,
      step: { from: POST_REF, prefix: 'author' },
    });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    page.window.postMessage.mockClear();
    act(() => {
      useFormStore
        .getState()
        .setActive(toFormId(AUTHOR), toFieldAddress('name'));
      useFormStore
        .getState()
        .setHovered(toFormId(AUTHOR), toFieldAddress('name'));
    });
    await waitFor(() => expect(outlines(page)).toHaveLength(1));
    expect(outlines(page)[0]).toMatchObject({
      active: { address: 'author.name', document: A, name: 'Name' },
      hovered: { address: 'author.name', document: A },
    });
  });

  it('sends no document to an older page', async () => {
    register(A);
    const { page } = await setup({ open: POST_REF });
    fromPage(readyMessage(), page.window);
    page.window.postMessage.mockClear();
    act(() => {
      useFormStore.getState().setHovered(toFormId(A), toFieldAddress('title'));
    });
    await waitFor(() => expect(outlines(page)).toHaveLength(1));
    expect(outlines(page)[0].hovered).toEqual({ address: 'title' });
  });

  it('posts at most one outline per frame however many fields the pointer crosses', async () => {
    register(A);
    const { page } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), page.window);
    page.window.postMessage.mockClear();
    act(() => {
      for (const address of ['title', 'author', 'title', 'author', 'title']) {
        useFormStore
          .getState()
          .setHovered(toFormId(A), toFieldAddress(address));
      }
    });
    await waitFor(() => expect(outlines(page)).toHaveLength(1));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(outlines(page)).toHaveLength(1);
  });

  it('ignores a message from the wrong window or origin', async () => {
    register(A);
    const { page, onOpen } = await setup({ open: POST_REF });
    fromPage(readyMessage([{ path: A }], URL_A), { postMessage: vi.fn() });
    expect(page.window.postMessage).not.toHaveBeenCalled();
    const event = new MessageEvent('message', {
      data: activateMessage('title'),
    });
    Object.defineProperty(event, 'origin', { value: 'https://evil.example' });
    Object.defineProperty(event, 'source', { value: page.window });
    act(() => {
      window.dispatchEvent(event);
    });
    expect(onOpen).not.toHaveBeenCalled();
    expect(useFormStore.getState().active).toBeNull();
  });
});
