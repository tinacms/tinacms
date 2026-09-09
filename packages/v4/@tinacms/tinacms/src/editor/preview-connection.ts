import { useQueryClient } from '@tanstack/react-query';
import { type RefObject, useEffect } from 'react';
import type { DocumentEntry } from '../core/content/contract';
import { toFieldAddress } from '../core/field/address';
import { collectReferences, resolveReferences } from '../core/form/references';
import { invariant } from '../core/invariant';
import { type FormValues, toDocument, useFormStore } from '../form/form-store';
import {
  isActivateMessage,
  isReadyMessage,
  valuesMessage,
} from '../preview/protocol';
import { CONTENT_STALE_TIME, contentKeys } from './content-queries';
import {
  useFormCollection,
  useFormId,
  useOptionalContentSlice,
  useSchemaCollections,
} from './hooks';

export interface PreviewConnectionOptions {
  targetOrigin?: string;
}

export function usePreviewConnection(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  options?: PreviewConnectionOptions
): void {
  const targetOrigin = options?.targetOrigin ?? window.origin;
  invariant(
    targetOrigin !== '*',
    'preview-target-origin-wildcard',
    "targetOrigin must name the preview's origin — never '*'."
  );

  const formId = useFormId();
  const { fields } = useFormCollection();
  const collections = useSchemaCollections();
  const content = useOptionalContentSlice();
  const queryClient = useQueryClient();

  useEffect(() => {
    const target = () => iframeRef.current?.contentWindow ?? null;

    const cachedDocument = (collection: string, path: string) =>
      queryClient.getQueryData<DocumentEntry | null>(
        contentKeys.document(collection, path)
      )?.document;

    // Posting stays synchronous, so it only ever reads the cache
    const postValues = (values: FormValues) => {
      const document = resolveReferences(
        toDocument(values),
        fields,
        collections,
        ({ collection, path }) => cachedDocument(collection, path)
      );
      target()?.postMessage(valuesMessage(document), targetOrigin);
    };

    const repost = () => {
      const scope = useFormStore.getState().forms[formId];
      if (scope) postValues(scope.values);
    };

    const warmReferences = (values: FormValues) => {
      if (!content) return;
      for (const { collection, path } of collectReferences(
        toDocument(values),
        fields,
        collections
      )) {
        if (cachedDocument(collection, path)) continue;
        queryClient
          .fetchQuery({
            queryKey: contentKeys.document(collection, path),
            queryFn: () => content.get(collection, path),
            staleTime: CONTENT_STALE_TIME,
          })
          .then(repost)
          .catch(() => {});
      }
    };

    const publish = (values: FormValues) => {
      postValues(values);
      warmReferences(values);
    };

    const onMessage = (event: MessageEvent) => {
      const source = target();
      if (!source || event.origin !== targetOrigin || event.source !== source)
        return;
      if (isReadyMessage(event.data)) {
        const scope = useFormStore.getState().forms[formId];
        if (scope) publish(scope.values);
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
        publish(values);
      }
    });

    const scope = useFormStore.getState().forms[formId];
    if (scope) publish(scope.values);

    return () => {
      window.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, [
    iframeRef,
    formId,
    targetOrigin,
    fields,
    collections,
    content,
    queryClient,
  ]);
}
