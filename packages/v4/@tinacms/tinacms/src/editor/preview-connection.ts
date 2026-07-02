import { type RefObject, useEffect } from 'react';
import { toFieldAddress } from '../core/field/address';
import { type FormValues, toDocument, useFormStore } from '../form/form-store';
import {
  isActivateMessage,
  isReadyMessage,
  valuesMessage,
} from '../preview/protocol';
import { useActiveField, useFormId } from './hooks';

export interface PreviewConnectionOptions {
  // The preview iframe's origin. Defaults to the editor's own origin;
  // cross-origin embedding is an explicit opt-in, never '*'.
  targetOrigin?: string;
}

// The editor half of visual editing (the v4 slice of #6944): stream the hosted
// form's values into the preview iframe and set preview clicks active. The
// form-store — not RHF — is the wire source: the scope's `values` object is
// replaced immutably on every registerForm/setFieldValue and preserved by
// markSaved/setActive, so a reference compare posts exactly on value changes
// (registration included, which also covers a ready arriving before the form
// exists). Values messages are idempotent full-state, so there is no send
// queue — every ready is answered with the current values, which also covers
// an iframe reload. Must sit under FormProvider (useFormId's invariant says so
// otherwise).
export function usePreviewConnection(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  options?: PreviewConnectionOptions
): void {
  const formId = useFormId();
  const { setActive } = useActiveField();
  const targetOrigin = options?.targetOrigin ?? window.origin;

  useEffect(() => {
    const target = () => iframeRef.current?.contentWindow ?? null;
    const postValues = (values: FormValues) =>
      target()?.postMessage(valuesMessage(toDocument(values)), targetOrigin);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin || event.source !== target()) return;
      if (isReadyMessage(event.data)) {
        const scope = useFormStore.getState().forms[formId];
        if (scope) postValues(scope.values);
      } else if (isActivateMessage(event.data)) {
        setActive(toFieldAddress(event.data.address));
      }
    };
    window.addEventListener('message', onMessage);

    const unsubscribe = useFormStore.subscribe((state, previous) => {
      const values = state.forms[formId]?.values;
      if (values && values !== previous.forms[formId]?.values) {
        postValues(values);
      }
    });

    return () => {
      window.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, [iframeRef, formId, setActive, targetOrigin]);
}
