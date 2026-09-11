import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, type RefObject, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { asResolvedConfig } from '../config';
import type { ContentProvider } from '../core/content/contract';
import { toFieldAddress } from '../core/field/address';
import { definePlugin } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import referenceFieldPlugin from '../plugins/fields/reference/reference-field.plugin';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  activateMessage,
  readyMessage,
  valuesMessage,
} from '../preview/protocol';
import { LabelledFields } from '../test/labelled-fields';
import { FormScopeContext } from './context';
import { FormProvider, TinaProvider } from './index';
import { usePreviewConnection } from './preview-connection';

const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};
const path = 'content/posts/preview.mdx';
const formId = toFormId(path);

const fakeIframe = () => {
  const contentWindow = { postMessage: vi.fn() };
  return {
    ref: {
      current: { contentWindow } as unknown as HTMLIFrameElement,
    } as RefObject<HTMLIFrameElement | null>,
    postMessage: contentWindow.postMessage,
  };
};

function Connection({
  iframeRef,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
}) {
  usePreviewConnection(iframeRef);
  return null;
}

const messageFromPreview = (
  data: unknown,
  source: unknown,
  origin?: string
) => {
  const event = new MessageEvent('message', { data });
  Object.defineProperty(event, 'origin', {
    value: origin ?? window.origin,
  });
  Object.defineProperty(event, 'source', { value: source });
  act(() => {
    window.dispatchEvent(event);
  });
};

const renderConnected = (iframeRef: RefObject<HTMLIFrameElement | null>) =>
  render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [stringFieldPlugin],
        schema: NO_COLLECTIONS,
      })}
    >
      <FormProvider
        collection={collection}
        path={path}
        document={{ title: 'Hello' }}
      >
        <LabelledFields />
        <Connection iframeRef={iframeRef} />
      </FormProvider>
    </TinaProvider>
  );

const REFERENCED_PATH = 'content/pages/deleted.mdx';

const referenceCollection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [
    t.string({ name: 'title', label: 'Title' }),
    t.reference({ name: 'page', label: 'Page', collections: ['page'] }),
  ],
};

const pageCollection: CollectionSchema = {
  name: 'page',
  path: 'content/pages',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};

const renderWithReference = (
  iframeRef: RefObject<HTMLIFrameElement | null>,
  get: ContentProvider['get']
) => {
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
  return render(
    <TinaProvider
      config={asResolvedConfig({
        plugins: [stringFieldPlugin, referenceFieldPlugin, contentPlugin],
        schema: { collections: [referenceCollection, pageCollection] },
      })}
    >
      <FormProvider
        collection={referenceCollection}
        path={path}
        document={{ title: 'Hello', page: REFERENCED_PATH }}
      >
        <LabelledFields />
        <Connection iframeRef={iframeRef} />
      </FormProvider>
    </TinaProvider>
  );
};

describe('usePreviewConnection reference resolution', () => {
  it('posts once per edit when a reference points at a document that is gone', async () => {
    const get = vi.fn(async () => null);
    const iframe = fakeIframe();
    renderWithReference(iframe.ref, get);
    const input = await screen.findByLabelText('Title');
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    iframe.postMessage.mockClear();

    await userEvent.type(input, '!');
    await waitFor(() => expect(iframe.postMessage).toHaveBeenCalled());

    // `content.get` answers null for a document that is gone. Reading the
    // cached document rather than the cache entry treats that null as a miss,
    // so every edit re-enters the fetch and posts a second time.
    expect(iframe.postMessage).toHaveBeenCalledTimes(1);
  });

  it('keeps the path when the document is gone', async () => {
    const iframe = fakeIframe();
    renderWithReference(iframe.ref, async () => null);
    await screen.findByLabelText('Title');

    await waitFor(() =>
      expect(iframe.postMessage).toHaveBeenCalledWith(
        valuesMessage({ title: 'Hello', page: REFERENCED_PATH }),
        window.origin
      )
    );
  });

  it('swaps the path for the document it points at', async () => {
    const iframe = fakeIframe();
    renderWithReference(iframe.ref, async () => ({
      path: REFERENCED_PATH,
      document: { title: 'Deleted Page' },
    }));
    await screen.findByLabelText('Title');

    await waitFor(() =>
      expect(iframe.postMessage).toHaveBeenCalledWith(
        valuesMessage({ title: 'Hello', page: { title: 'Deleted Page' } }),
        window.origin
      )
    );
  });
});

describe('usePreviewConnection', () => {
  it('answers the ready handshake with the registered document', async () => {
    const iframe = fakeIframe();
    renderConnected(iframe.ref);
    await screen.findByLabelText('Title');
    iframe.postMessage.mockClear();

    messageFromPreview(readyMessage(), iframe.ref.current?.contentWindow);
    expect(iframe.postMessage).toHaveBeenCalledWith(
      valuesMessage({ title: 'Hello' }),
      window.origin
    );
  });

  it('reposts on every edit — the store chokepoint carries changes to the wire', async () => {
    const iframe = fakeIframe();
    renderConnected(iframe.ref);
    const input = await screen.findByLabelText('Title');
    iframe.postMessage.mockClear();

    await userEvent.type(input, '!');
    expect(iframe.postMessage).toHaveBeenCalledWith(
      valuesMessage({ title: 'Hello!' }),
      window.origin
    );
  });

  it('does not repost on markSaved — the values reference is preserved', async () => {
    const iframe = fakeIframe();
    renderConnected(iframe.ref);
    const input = await screen.findByLabelText('Title');
    await userEvent.type(input, '!');
    iframe.postMessage.mockClear();

    act(() => {
      useFormStore.getState().markSaved(formId);
    });
    expect(iframe.postMessage).not.toHaveBeenCalled();
  });

  it('sets a preview activate message active and focuses the field', async () => {
    const iframe = fakeIframe();
    renderConnected(iframe.ref);
    const input = await screen.findByLabelText('Title');
    expect(input).not.toHaveFocus();

    messageFromPreview(
      activateMessage('title'),
      iframe.ref.current?.contentWindow
    );
    expect(useFormStore.getState().active).toEqual({
      formId,
      address: 'title',
    });
    expect(input).toHaveFocus();
  });

  it('ignores the wrong origin, the wrong source, and malformed data', async () => {
    const iframe = fakeIframe();
    renderConnected(iframe.ref);
    await screen.findByLabelText('Title');
    iframe.postMessage.mockClear();

    messageFromPreview(
      readyMessage(),
      iframe.ref.current?.contentWindow,
      'https://evil.example'
    );
    messageFromPreview(readyMessage(), { not: 'the iframe' });
    messageFromPreview(
      { type: 'tina:activate' },
      iframe.ref.current?.contentWindow
    );
    expect(iframe.postMessage).not.toHaveBeenCalled();
    expect(useFormStore.getState().active).toBeNull();
  });

  it('a ready before any form registers is silent until registration answers it', async () => {
    const iframe = fakeIframe();
    function Bare() {
      const ref = useRef<HTMLIFrameElement | null>(null);
      ref.current = iframe.ref.current;
      usePreviewConnection(ref);
      return <div>bare</div>;
    }
    render(
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider collection={collection} path={path}>
          <Bare />
        </FormProvider>
      </TinaProvider>
    );
    await screen.findByText('bare');
    act(() => {
      useFormStore.setState({ forms: {}, active: null });
    });
    iframe.postMessage.mockClear();
    messageFromPreview(readyMessage(), iframe.ref.current?.contentWindow);
    expect(iframe.postMessage).not.toHaveBeenCalled();

    act(() => {
      useFormStore
        .getState()
        .registerForm(formId, { [toFieldAddress('title')]: 'Late doc' });
    });
    expect(iframe.postMessage).toHaveBeenCalledWith(
      valuesMessage({ title: 'Late doc' }),
      window.origin
    );
  });

  it('streams an already-edited form on switch — no ready, no edit needed', async () => {
    const otherPath = 'content/posts/other.mdx';
    const otherFormId = toFormId(otherPath);
    act(() => {
      useFormStore
        .getState()
        .registerForm(otherFormId, { [toFieldAddress('title')]: 'Other' });
      useFormStore
        .getState()
        .setFieldValue(otherFormId, toFieldAddress('title'), 'Other edited');
    });
    const iframe = fakeIframe();
    const tree = (documentPath: string) => (
      <TinaProvider
        config={asResolvedConfig({
          plugins: [stringFieldPlugin],
          schema: NO_COLLECTIONS,
        })}
      >
        <FormProvider
          collection={collection}
          path={documentPath}
          document={{ title: 'Hello' }}
        >
          <LabelledFields />
          <Connection iframeRef={iframe.ref} />
        </FormProvider>
      </TinaProvider>
    );
    const { rerender } = render(tree(path));
    await screen.findByLabelText('Title');
    iframe.postMessage.mockClear();

    rerender(tree(otherPath));
    await waitFor(() =>
      expect(iframe.postMessage).toHaveBeenCalledWith(
        valuesMessage({ title: 'Other edited' }),
        window.origin
      )
    );
  });

  it("rejects '*' as targetOrigin at construction", () => {
    const iframe = fakeIframe();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FormScopeContext
        value={{
          formId,
          path,
          collection,
          onSave: null,
          seedKey: path,
          discardEdits: () => {},
        }}
      >
        {children}
      </FormScopeContext>
    );
    expect(() =>
      renderHook(
        () => usePreviewConnection(iframe.ref, { targetOrigin: '*' }),
        { wrapper }
      )
    ).toThrow('preview-target-origin-wildcard');
  });

  it('goes silent after unmount', async () => {
    const iframe = fakeIframe();
    const { unmount } = renderConnected(iframe.ref);
    await screen.findByLabelText('Title');
    unmount();
    iframe.postMessage.mockClear();

    messageFromPreview(readyMessage(), iframe.ref.current?.contentWindow);
    act(() => {
      useFormStore
        .getState()
        .setFieldValue(formId, toFieldAddress('title'), 'late');
    });
    expect(iframe.postMessage).not.toHaveBeenCalled();
  });
});
