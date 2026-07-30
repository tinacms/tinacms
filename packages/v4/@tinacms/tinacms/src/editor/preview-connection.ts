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
  targetOrigin?: string;
}

export function usePreviewConnection(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  options?: PreviewConnectionOptions
): void {
  const formId = useFormId();
  const targetOrigin = options?.targetOrigin ?? window.origin;
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
      const source = target();
      if (!source || event.origin !== targetOrigin || event.source !== source)
        return;
      if (isReadyMessage(event.data)) {
        const scope = useFormStore.getState().forms[formId];
        if (scope) postValues(scope.values);
      } else if (isActivateMessage(event.data)) {
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
