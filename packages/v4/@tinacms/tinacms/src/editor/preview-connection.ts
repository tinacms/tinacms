import { type RefObject, useEffect } from 'react';
import { toFieldAddress } from '../core/field/address';
import { invariant } from '../core/invariant';
import { type FormValues, toDocument, useFormStore } from '../form/form-store';
import {
  isActivateMessage,
  isReadyMessage,
  valuesMessage,
} from '../preview/protocol';
import { useFormId } from './hooks';

export interface PreviewConnectionOptions {
  // The origin of the preview iframe. It defaults to the origin of the editor. A
  // cross-origin embed is an explicit choice, and is never '*'.
  targetOrigin?: string;
}

// The editor half of visual editing (the v4 part of #6944). It streams the values of
// the hosted form into the preview iframe, and it activates the field that a preview
// click names. The form store is the source for the wire, and RHF is not. The store
// replaces the `values` object at each registerForm and setFieldValue, and keeps it at
// each markSaved and setActive. A reference compare therefore posts on a value change
// alone. That includes the registration, which also covers a ready message that arrives
// before the form exists. A values message carries the whole state, so a second message
// does no harm and there is no send queue. Every ready message gets the current values,
// which covers a reload of the iframe. A new connection posts the current scope, which
// covers a move to a form that was already edited. This hook must sit under a
// FormProvider, and the invariant in useFormId reports it otherwise.
export function usePreviewConnection(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  options?: PreviewConnectionOptions
): void {
  const formId = useFormId();
  const targetOrigin = options?.targetOrigin ?? window.origin;
  // This check runs at construction. A '*' origin would stream the values of the
  // document to any window that embeds the editor.
  invariant(
    targetOrigin !== '*',
    'preview-target-origin-wildcard',
    "targetOrigin must name the preview's origin — never '*'."
  );

  useEffect(() => {
    const target = () => iframeRef.current?.contentWindow ?? null;
    const postValues = (values: FormValues) =>
      target()?.postMessage(valuesMessage(toDocument(values)), targetOrigin);

    const onMessage = (event: MessageEvent) => {
      // The null check is necessary. With no iframe mounted, target() returns null,
      // which would equal the null source of a stray message from the same origin.
      const source = target();
      if (!source || event.origin !== targetOrigin || event.source !== source)
        return;
      if (isReadyMessage(event.data)) {
        const scope = useFormStore.getState().forms[formId];
        if (scope) postValues(scope.values);
      } else if (isActivateMessage(event.data)) {
        // The store directly, and not useActiveField. This hook writes the active
        // field and never reads it, so subscribing would re-render the pane that
        // holds the iframe on every activation for a value it does not use.
        useFormStore
          .getState()
          .setActive(formId, toFieldAddress(event.data.address));
      }
    };
    window.addEventListener('message', onMessage);

    const unsubscribe = useFormStore.subscribe((state, previous) => {
      const values = state.forms[formId]?.values;
      if (values && values !== previous.forms[formId]?.values) {
        postValues(values);
      }
    });

    const scope = useFormStore.getState().forms[formId];
    if (scope) postValues(scope.values);

    return () => {
      window.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, [iframeRef, formId, targetOrigin]);
}
