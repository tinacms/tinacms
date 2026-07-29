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
import { toFieldAddress } from '../core/field/address';
import type { CollectionSchema } from '../core/schema/types';
import { toFormId, useFormStore } from '../form/form-store';
import { t } from '../index';
import stringFieldPlugin from '../plugins/fields/string/string-field.plugin';
import {
  activateMessage,
  readyMessage,
  valuesMessage,
} from '../preview/protocol';
import { FormScopeContext } from './context';
import { Field, FormProvider, TinaProvider } from './index';
import { usePreviewConnection } from './preview-connection';

// These tests render a runtime directly, and not a configured app. They therefore pass
// TinaProvider the resolved shape, and do not call defineConfig.
const NO_COLLECTIONS = { collections: [] };

const collection: CollectionSchema = {
  name: 'post',
  format: 'mdx',
  fields: [t.string({ name: 'title', label: 'Title' })],
};
const path = 'content/posts/preview.mdx';
const formId = toFormId(path);

// This stands in for the iframe. usePreviewConnection reads contentWindow only.
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

// The MessageEvent constructor of happy-dom does not always carry the origin and the
// source, so this sets them. connection.test.ts uses the same helper.
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
        <Field address='title' />
        <Connection iframeRef={iframeRef} />
      </FormProvider>
    </TinaProvider>
  );

describe('usePreviewConnection', () => {
  it('answers the ready handshake with the registered document', async () => {
    const iframe = fakeIframe();
    renderConnected(iframe.ref);
    await screen.findByLabelText('title');
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
    const input = await screen.findByLabelText('title');
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
    const input = await screen.findByLabelText('title');
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
    const input = await screen.findByLabelText('title');
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
    await screen.findByLabelText('title');
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
    // There is no <Field> here. This drives the hook against a store that is empty
    // after the mount.
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
    // TinaProvider mounts its children after the plugins resolve, so wait for that.
    await screen.findByText('bare');
    act(() => {
      useFormStore.setState({ forms: {}, active: null });
    });
    iframe.postMessage.mockClear();
    messageFromPreview(readyMessage(), iframe.ref.current?.contentWindow);
    expect(iframe.postMessage).not.toHaveBeenCalled();

    // The recovery. The registration fires the post from the subscription, so the
    // early ready message needs no answer.
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
          <Field address='title' />
          <Connection iframeRef={iframe.ref} />
        </FormProvider>
      </TinaProvider>
    );
    const { rerender } = render(tree(path));
    await screen.findByLabelText('title');
    iframe.postMessage.mockClear();

    // The iframe stays across the change, so there is no new ready message. The
    // store also does nothing when an edited scope registers again. The post at
    // connect time is therefore the only way to move the preview. The waitFor call
    // also flushes the validation that the provider runs when it adopts the kept
    // edits, which keeps act quiet.
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
    // A FormScopeContext alone is enough. The invariant throws in the body of the
    // hook, before an effect needs the runtime.
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
    await screen.findByLabelText('title');
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
