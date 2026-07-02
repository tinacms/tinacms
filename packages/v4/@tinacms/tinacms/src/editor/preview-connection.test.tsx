import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type RefObject, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
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
import { Field, FormProvider, TinaProvider } from './index';
import { usePreviewConnection } from './preview-connection';

const collection: CollectionSchema = {
  name: 'post',
  fields: [t.string({ name: 'title', label: 'Title' })],
};
const path = 'content/posts/preview.mdx';
const formId = toFormId(path);

// Stands in for the iframe: usePreviewConnection only touches contentWindow.
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

// happy-dom's MessageEvent constructor doesn't reliably carry origin/source, so
// force them on (same helper shape as connection.test.ts).
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
    <TinaProvider plugins={[stringFieldPlugin]}>
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

  it('answers a ready that arrives before any form is registered with silence', () => {
    const iframe = fakeIframe();
    // No FormProvider content yet: drive the hook against an empty store.
    function Bare() {
      const ref = useRef<HTMLIFrameElement | null>(null);
      ref.current = iframe.ref.current;
      usePreviewConnection(ref);
      return null;
    }
    render(
      <TinaProvider plugins={[stringFieldPlugin]}>
        <FormProvider collection={collection} path={path}>
          <Bare />
        </FormProvider>
      </TinaProvider>
    );
    act(() => {
      useFormStore.setState({ forms: {}, active: null });
    });
    iframe.postMessage.mockClear();
    messageFromPreview(readyMessage(), iframe.ref.current?.contentWindow);
    expect(iframe.postMessage).not.toHaveBeenCalled();
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
