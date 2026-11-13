import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { get } from 'react-hook-form';
import type { DocumentEntry } from '../core/content/contract';
import { type FieldAddress, toFieldAddress } from '../core/field/address';
import {
  type ReferenceTarget,
  collectReferences,
  resolveReferences,
} from '../core/form/references';
import { invariant } from '../core/invariant';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import {
  type FormValues,
  toDocument,
  toFormId,
  useFormStore,
} from '../form/form-store';
import {
  type Mark,
  isActivateMessage,
  isDocumentsMessage,
  isReadyMessage,
  outlineMessage,
  valuesMessage,
} from '../preview/protocol';
import {
  CONTENT_STALE_TIME,
  contentKeys,
  useCurrentBranch,
} from './content-queries';
import { fieldsAlong } from './form-view-state';
import { useOptionalContentSlice, useSchemaCollections } from './hooks';
import {
  type DocumentRef,
  type ReferenceStep,
  collectionOfPath,
  decidePlacement,
  findCrossing,
} from './preview-activate';
import { type Follower, createFollower } from './preview-follow';

export type { DocumentRef, ReferenceStep } from './preview-activate';

export interface PreviewConnectionOptions {
  targetOrigin?: string;
  /** The document the form shows, if any. */
  open?: DocumentRef | null;
  /** The reference step the form shows on top of `open`, if any. */
  step?: ReferenceStep | null;
  /** Whether the current route shows the preview. The connection only navigates while it does. */
  showsPreview?: boolean;
  /** Whether the route is Nothing to edit. */
  onPage?: boolean;
  /** Opens `target` as the form's document, with `step` as its way back. */
  onOpen?: (target: DocumentRef, step: ReferenceStep | null) => void;
  onNothingToEdit?: () => void;
}

interface Persistent {
  follower: Follower | null;
  warned: Set<string>;
  click: number;
  lastOutline: string | null;
  frame: number | null;
  /** The page has said ready, so it can tell which document each value is for. */
  heard: boolean;
}

type Deps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  targetOrigin: string;
  collections: CollectionSchema[];
  content: ReturnType<typeof useOptionalContentSlice>;
  queryClient: QueryClient;
  branch: string | undefined;
  options: PreviewConnectionOptions;
  persistent: Persistent;
};

const documentOf = (values: FormValues): TinaDocument => toDocument(values);

function createHandlers(deps: Deps) {
  const {
    iframeRef,
    targetOrigin,
    collections,
    content,
    queryClient,
    branch,
    options,
    persistent,
  } = deps;
  const open = options.open ?? null;
  const step = options.step ?? null;
  const showing = options.showsPreview ?? true;
  const target = () => iframeRef.current?.contentWindow ?? null;
  const post = (message: unknown) => {
    if (persistent.heard) target()?.postMessage(message, targetOrigin);
  };
  const forms = () => useFormStore.getState().forms;
  const follower = () => persistent.follower as Follower;

  const collectionFor = (path: string): CollectionSchema | undefined => {
    const named =
      open?.path === path
        ? open.collection
        : step?.from.path === path
          ? step.from.collection
          : undefined;
    return (
      collections.find((collection) => collection.name === named) ??
      collectionOfPath(path, collections)
    );
  };

  const warnOnce = (key: string, message: string) => {
    if (persistent.warned.has(key)) return;
    persistent.warned.add(key);
    console.warn(message);
  };

  const cachedDocument = ({ collection, path }: ReferenceTarget) =>
    queryClient.getQueryData<DocumentEntry | null>(
      contentKeys.document(collection, path, branch)
    )?.document;

  // A referenced document's live form wins over its saved copy.
  const resolveReference = (reference: ReferenceTarget) => {
    const live = forms()[toFormId(reference.path)];
    return live ? documentOf(live.values) : cachedDocument(reference);
  };

  const resolved = (
    collection: CollectionSchema,
    values: FormValues
  ): TinaDocument =>
    resolveReferences(
      documentOf(values),
      collection.fields,
      collections,
      resolveReference
    );

  const warmReferences = (collection: CollectionSchema, values: FormValues) => {
    if (!content) return;
    for (const reference of collectReferences(
      documentOf(values),
      collection.fields,
      collections
    )) {
      const key = contentKeys.document(
        reference.collection,
        reference.path,
        branch
      );
      // Test the cache entry, not the document: a null is a cached answer.
      if (queryClient.getQueryState(key)) continue;
      queryClient
        .fetchQuery({
          queryKey: key,
          queryFn: () => content.get(reference.collection, reference.path),
          staleTime: CONTENT_STALE_TIME,
        })
        .then(publishAll)
        .catch((cause: unknown) => {
          let reason: string;
          if (cause instanceof Error) {
            reason = cause.message;
          } else {
            reason = String(cause);
          }
          console.warn(
            `Tina could not read "${reference.path}" from the "${reference.collection}" collection, so the preview keeps its path. ${reason}`
          );
        });
    }
  };

  const publish = (path: string, documentName: string | undefined) => {
    const collection = collectionFor(path);
    const scope = forms()[toFormId(path)];
    if (!(collection && scope)) return;
    post(valuesMessage(resolved(collection, scope.values), documentName));
    warmReferences(collection, scope.values);
  };

  // The document an older page, which declares nothing, is fed.
  const fed = (): DocumentRef | null => (step ? step.from : open);

  // The forms whose values the page shows: what it declares or is fed, and the
  // documents those reference.
  const shownPaths = (): Set<string> => {
    const declared = follower().declared();
    const paths = declared.length
      ? declared.map((d) => d.path)
      : fed()
        ? [(fed() as DocumentRef).path]
        : [];
    const shown = new Set(paths);
    for (const path of paths) {
      const collection = collectionFor(path);
      const values = forms()[toFormId(path)]?.values;
      if (!(collection && values)) continue;
      for (const reference of collectReferences(
        documentOf(values),
        collection.fields,
        collections
      )) {
        shown.add(reference.path);
      }
    }
    return shown;
  };

  const shownFormChanged = (
    next: ReturnType<typeof forms>,
    before: ReturnType<typeof forms>
  ) => {
    const changed = Object.keys({ ...next, ...before }).filter(
      (key) => next[toFormId(key)]?.values !== before[toFormId(key)]?.values
    );
    if (changed.length === 0) return false;
    const shown = shownPaths();
    return changed.some((key) => shown.has(key));
  };

  function publishAll() {
    const declared = follower().declared();
    if (declared.length > 0) {
      for (const { path } of declared) publish(path, path);
      return;
    }
    const feed = fed();
    if (feed) publish(feed.path, undefined);
  }

  const markFor = (
    entry: { formId: string; address: FieldAddress } | null
  ): (Mark & { name: string }) | null => {
    if (!entry) return null;
    const path = String(entry.formId);
    const declared = follower().declared();
    const crossing = step && open?.path === path ? step.prefix : undefined;
    let mark: Mark | null = null;
    if (declared.length > 0) {
      if (declared.some((d) => d.path === path)) {
        mark = { address: entry.address, document: path };
      } else if (
        crossing &&
        step &&
        declared.some((d) => d.path === step.from.path)
      ) {
        mark = {
          address: `${crossing}.${entry.address}`,
          document: step.from.path,
        };
      }
    } else if (fed()?.path === path) {
      mark = { address: entry.address };
    } else if (crossing) {
      mark = { address: `${crossing}.${entry.address}` };
    }
    if (!mark) return null;
    const collection = collectionFor(path);
    const values = forms()[toFormId(path)]?.values;
    const label =
      collection && values
        ? fieldsAlong(entry.address, collection.fields, (address) =>
            get(values, address)
          ).at(-1)?.label
        : undefined;
    return {
      ...mark,
      name: label ?? entry.address.split('.').at(-1) ?? entry.address,
    };
  };

  const outline = () => {
    const { active, hovered } = useFormStore.getState();
    const activeMark = markFor(active);
    const hoveredMark = markFor(hovered);
    return outlineMessage(
      hoveredMark && {
        address: hoveredMark.address,
        document: hoveredMark.document,
      },
      activeMark
    );
  };

  const sendOutline = (force: boolean) => {
    const message = outline();
    const serialised = JSON.stringify(message);
    if (!force && serialised === persistent.lastOutline) return;
    persistent.lastOutline = serialised;
    post(message);
  };

  const scheduleOutline = () => {
    if (persistent.frame !== null) return;
    persistent.frame = requestAnimationFrame(() => {
      persistent.frame = null;
      sendOutline(false);
    });
  };

  const fetchDocument = async (ref: DocumentRef): Promise<boolean> => {
    const key = contentKeys.document(ref.collection, ref.path, branch);
    let entry: DocumentEntry | null | undefined;
    if (content) {
      try {
        entry = await queryClient.fetchQuery({
          queryKey: key,
          queryFn: () => content.get(ref.collection, ref.path),
          staleTime: CONTENT_STALE_TIME,
        });
      } catch (cause) {
        let reason: string;
        if (cause instanceof Error) {
          reason = cause.message;
        } else {
          reason = String(cause);
        }
        warnOnce(
          ref.path,
          `Tina could not read "${ref.path}" from the "${ref.collection}" collection, so the form stays where it is. ${reason}`
        );
        return false;
      }
    }
    if (!entry) {
      warnOnce(
        ref.path,
        `Tina found no document at "${ref.path}", so the form stays where it is.`
      );
      return false;
    }
    return true;
  };

  // True at once when the form or the cache holds the document, so a click does
  // not wait on a read it does not need.
  const ensureDocument = (ref: DocumentRef): true | Promise<boolean> => {
    if (forms()[toFormId(ref.path)]) return true;
    const cached = queryClient.getQueryData<DocumentEntry | null>(
      contentKeys.document(ref.collection, ref.path, branch)
    );
    if (cached) return true;
    return fetchDocument(ref);
  };

  const refOf = (path: string): DocumentRef | null => {
    const collection = collectionFor(path);
    if (!collection) {
      warnOnce(
        path,
        `No collection owns "${path}", so the preview cannot open it.`
      );
      return null;
    }
    return { collection: collection.name, path };
  };

  const followOpen = async (path: string) => {
    if (open?.path === path && !step) return;
    const ref = refOf(path);
    if (!ref) return;
    const ready = ensureDocument(ref);
    if (ready !== true && !(await ready)) return;
    options.onOpen?.(ref, null);
  };

  const valuesOf = (ref: DocumentRef): Record<string, unknown> | undefined =>
    forms()[toFormId(ref.path)]?.values ?? cachedDocument(ref);

  const activate = async (
    address: string,
    documentName: string | undefined
  ) => {
    if (!showing) return;
    const token = ++persistent.click;
    const main = follower().main();
    const clickedPath = documentName ?? main ?? fed()?.path;
    if (!clickedPath) return;
    const clicked = refOf(clickedPath);
    if (!clicked) return;
    const clickedReady = ensureDocument(clicked);
    if (clickedReady !== true && !(await clickedReady)) return;
    if (token !== persistent.click) return;
    const collection = collectionFor(clicked.path);
    const values = valuesOf(clicked);
    if (!(collection && values)) return;
    const crossing = findCrossing(
      address,
      collection.fields,
      (path) => get(values, path),
      collections
    );
    const targetRef = crossing
      ? { collection: crossing.target.collection, path: crossing.target.path }
      : clicked;
    const targetAddress = crossing ? crossing.rest : address;
    const placement = decidePlacement({
      target: targetRef,
      clicked,
      crossing,
      open,
      base: step ? step.from : open,
      main,
    });
    if (placement.kind === 'open') {
      const targetReady = ensureDocument(placement.target);
      if (targetReady !== true && !(await targetReady)) return;
      if (token !== persistent.click) return;
      options.onOpen?.(placement.target, placement.step);
    }
    useFormStore
      .getState()
      .setActive(
        toFormId(
          placement.kind === 'open' ? placement.target.path : targetRef.path
        ),
        toFieldAddress(targetAddress)
      );
  };

  return {
    onMessage: (event: MessageEvent) => {
      const source = target();
      if (!source || event.origin !== targetOrigin || event.source !== source) {
        return;
      }
      const data: unknown = event.data;
      if (isReadyMessage(data) || isDocumentsMessage(data)) {
        persistent.heard = true;
        const ready = isReadyMessage(data);
        if (!ready || data.documents !== undefined) {
          follower().update(data.documents ?? [], data.url, {
            showing,
            onPage: options.onPage ?? false,
          });
        }
        publishAll();
        if (ready) sendOutline(true);
      } else if (isActivateMessage(data)) {
        void activate(data.address, data.document);
      }
    },
    onStore: (
      state: ReturnType<typeof useFormStore.getState>,
      previous: ReturnType<typeof useFormStore.getState>
    ) => {
      if (shownFormChanged(state.forms, previous.forms)) publishAll();
      if (
        state.active !== previous.active ||
        state.hovered !== previous.hovered
      ) {
        scheduleOutline();
      }
    },
    resync: () => {
      publishAll();
      scheduleOutline();
    },
    followOpen,
    publishAll,
  };
}

type Handlers = ReturnType<typeof createHandlers>;

/**
 * Connects the preview frame to the form store. It lives with the frame, which
 * outlives any one document, so it reads forms from the store and takes the
 * routing it cannot see as options.
 */
export function usePreviewConnection(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  options: PreviewConnectionOptions = {}
): void {
  const targetOrigin = options.targetOrigin ?? window.origin;
  invariant(
    targetOrigin !== '*',
    'preview-target-origin-wildcard',
    "targetOrigin must name the preview's origin — never '*'."
  );
  const collections = useSchemaCollections();
  const content = useOptionalContentSlice();
  const queryClient = useQueryClient();
  const branch = useCurrentBranch();

  const persistent = useRef<Persistent>({
    follower: null,
    warned: new Set(),
    click: 0,
    lastOutline: null,
    frame: null,
    heard: false,
  }).current;

  const handlers = useRef<Handlers | null>(null);
  handlers.current = createHandlers({
    iframeRef,
    targetOrigin,
    collections,
    content,
    queryClient,
    branch,
    options,
    persistent,
  });
  persistent.follower ??= createFollower({
    open: (path) => void handlers.current?.followOpen(path),
    nothingToEdit: () => options.onNothingToEdit?.(),
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) =>
      handlers.current?.onMessage(event);
    window.addEventListener('message', onMessage);
    const unsubscribe = useFormStore.subscribe((state, previous) =>
      handlers.current?.onStore(state, previous)
    );
    return () => {
      window.removeEventListener('message', onMessage);
      unsubscribe();
      persistent.follower?.dispose();
      if (persistent.frame !== null) cancelAnimationFrame(persistent.frame);
      persistent.frame = null;
    };
  }, [persistent]);

  const showing = options.showsPreview ?? true;
  useLayoutEffect(() => {
    persistent.follower?.setShowing(showing);
  }, [persistent, showing]);

  const openPath = options.open?.path;
  const stepFrom = options.step?.from.path;
  const stepPrefix = options.step?.prefix;
  useEffect(() => {
    handlers.current?.resync();
  }, [openPath, stepFrom, stepPrefix, collections, branch]);
}
