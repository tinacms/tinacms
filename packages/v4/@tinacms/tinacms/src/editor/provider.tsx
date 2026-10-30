import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { get, FormProvider as RhfFormProvider, useForm } from 'react-hook-form';
import type { ResolvedConfig } from '../config';
import { authSliceOf } from '../core/auth/slice';
import { toFieldAddress } from '../core/field/address';
import { createFieldRegistry } from '../core/field/registry';
import { fieldEqualityFor } from '../core/form/compare';
import {
  createFormHookRegistry,
  resolveFormHooks,
  runOnChange,
  serverHookNamesOf,
} from '../core/form/hooks';
import { ingestDocument } from '../core/form/ingest';
import {
  type PluginManifest,
  resolveClientSegments,
  type TinaStoreState,
} from '../core/plugin';
import { initializePlugins, validateCapabilityGraph } from '../core/resolve';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { createScreenRegistry } from '../core/screen/registry';
import { createGlobalNav } from '../core/slot/global-nav';
import { addressesWithValidators } from '../core/validation';
import { createValidatorRegistry } from '../core/validator/registry';
import { type DraftUserScope, removeDraft } from '../form/drafts';
import {
  type FieldErrors,
  type FormId,
  formStatus,
  isEdited,
  readFormStore,
  readOpeningScope,
  staleDraft,
  syncDrafts,
  toDocument,
  toFormId,
  toFormValues,
  useFormStatus,
  useFormStore,
} from '../form/form-store';
import { SELF_CONTAINED_VALIDATORS } from '../plugins/validators/core-validators.schema';
import { DEFAULT_RPC_URL } from '../rpc/proxy';
import { createTinaStore } from '../store/create-store';
import {
  FormScopeContext,
  type SaveHandler,
  type TinaRuntime,
  TinaRuntimeContext,
} from './context';
import { flattenFieldErrors, nestFieldErrors } from './field-errors';
import { useFormViewStore } from './form-view-state';
import { buildFormResolver } from './resolver';

export interface TinaProviderProps {
  config: ResolvedConfig;
  queryClient?: QueryClient;
  children: ReactNode;
}

const createDefaultQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

type BootedRuntime = Omit<TinaRuntime, 'schema' | 'rpcUrl'>;

const usePluginsKey = (plugins: PluginManifest[]): number => {
  const previous = useRef<PluginManifest[] | null>(null);
  const token = useRef(0);
  const unchanged =
    previous.current !== null &&
    previous.current.length === plugins.length &&
    previous.current.every(
      (plugin, index) => plugin.name === plugins[index].name
    );
  if (!unchanged) {
    previous.current = plugins;
    token.current += 1;
  }
  return token.current;
};

let lifecycleTurn: Promise<void> = Promise.resolve();

const draftUserOf = (state: TinaStoreState) => {
  const auth = authSliceOf(state);
  if (!auth) return undefined;
  return auth.status === 'signed-in' ? auth.user.id : null;
};

export function TinaProvider({
  config,
  queryClient,
  children,
}: TinaProviderProps) {
  const [ownQueryClient] = useState(createDefaultQueryClient);
  const activeQueryClient = queryClient ?? ownQueryClient;
  const [booted, setBooted] = useState<BootedRuntime | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const composedPlugins = config.plugins;
  const pluginsKey = usePluginsKey(composedPlugins);

  useEffect(() => {
    let mounted = true;
    let unsubscribeAuth: (() => void) | undefined;
    const boot = lifecycleTurn.then(async () => {
      validateCapabilityGraph(composedPlugins);
      const resolved = await resolveClientSegments(composedPlugins);
      const screens = createScreenRegistry(resolved, composedPlugins);
      const runtime: BootedRuntime = {
        registry: createFieldRegistry(resolved),
        validators: createValidatorRegistry(resolved),
        hooks: createFormHookRegistry(resolved),
        serverHooks: serverHookNamesOf(composedPlugins),
        store: createTinaStore(resolved),
        screens,
        globalNav: createGlobalNav(resolved, composedPlugins, screens),
      };
      const destroyPlugins = await initializePlugins(composedPlugins);
      if (mounted) {
        useFormStore
          .getState()
          .setUserId(draftUserOf(runtime.store.getState()));
        unsubscribeAuth = runtime.store.subscribe((state) =>
          useFormStore.getState().setUserId(draftUserOf(state))
        );
        setBooted(runtime);
      }
      return destroyPlugins;
    });
    lifecycleTurn = boot.then(
      () => undefined,
      () => undefined
    );
    boot.catch((cause) => {
      if (!mounted) return;
      if (cause instanceof Error) {
        setError(cause);
      } else {
        setError(new Error(String(cause)));
      }
    });
    return () => {
      mounted = false;
      unsubscribeAuth?.();
      const destroyBootedPlugins = async () => {
        const destroyPlugins = await boot.catch(() => null);
        await destroyPlugins?.();
      };
      const previousTurn = lifecycleTurn;
      lifecycleTurn = previousTurn.then(destroyBootedPlugins).catch((cause) => {
        console.error('[tinacms] plugin teardown failed:', cause);
      });
    };
  }, [pluginsKey]);

  useEffect(() => syncDrafts(), []);

  const runtime = useMemo(
    () =>
      booted
        ? {
            ...booted,
            schema: config.schema,
            rpcUrl: config.rpcUrl ?? DEFAULT_RPC_URL,
          }
        : null,
    [booted, config.schema, config.rpcUrl]
  );

  if (error) throw error;
  if (!runtime) return null;
  return (
    <QueryClientProvider client={activeQueryClient}>
      <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
    </QueryClientProvider>
  );
}

const seedSignatureOf = (
  formId: FormId,
  userId: DraftUserScope,
  seedValues: TinaDocument
) =>
  JSON.stringify([
    formId,
    userId === undefined ? 'unscoped' : userId,
    seedValues,
  ]);

const readKeptSeed = (
  formId: FormId,
  ingested: TinaDocument,
  equal: ReturnType<typeof fieldEqualityFor>
) => {
  const scope = readOpeningScope(formId, toFormValues(ingested), equal);
  if (!scope) return { seed: null, errors: {} };
  return {
    seed: toDocument(scope.values),
    errors: nestFieldErrors(scope.errors),
  };
};

const syncSeededForm = (
  seededSignature: { current: string | null },
  formId: FormId,
  userId: DraftUserScope,
  ingested: TinaDocument,
  equal: ReturnType<typeof fieldEqualityFor>,
  seedValues: TinaDocument,
  keptSeed: TinaDocument | null,
  resetForm: (values: TinaDocument, options?: { keepErrors?: boolean }) => void,
  advanceSeedKey: (formId: FormId) => void
) => {
  useFormStore.getState().registerForm(formId, toFormValues(ingested), equal);
  const signature = seedSignatureOf(formId, userId, seedValues);
  if (seededSignature.current === null) {
    seededSignature.current = signature;
    return;
  }
  if (seededSignature.current !== signature) {
    seededSignature.current = signature;
    resetForm(seedValues, { keepErrors: seedValues === keptSeed });
    advanceSeedKey(formId);
  }
};

const discardFormEdits = (
  formId: FormId,
  resetForm: (values: TinaDocument) => void,
  advanceSeedKey: (formId: FormId) => void
) => {
  const store = readFormStore();
  const scope = store.forms[formId];
  if (!isEdited(scope)) return;
  const baseline = toDocument(scope.baseline);
  store.discardEdits(formId);
  resetForm(baseline);
  advanceSeedKey(formId);
};

const buildStaleDraftActions = (
  stale: ReturnType<typeof staleDraft>,
  formId: FormId,
  resetForm: (values: TinaDocument) => void,
  advanceSeedKey: (formId: FormId) => void,
  bumpDraftRevision: () => void
) => {
  if (!stale) return null;
  return {
    resume: () => {
      const store = readFormStore();
      store.resumeDraft(formId, {
        values: toFormValues(stale.values),
        baseline: toFormValues(stale.baseline),
      });
      const resumed = readFormStore().forms[formId];
      if (formStatus(resumed) !== 'dirty') {
        removeDraft(formId, readFormStore().userId);
      }
      resetForm(toDocument(resumed?.values ?? {}));
      advanceSeedKey(formId);
      bumpDraftRevision();
    },
    discard: () => {
      removeDraft(formId, readFormStore().userId);
      bumpDraftRevision();
    },
  };
};

const mirrorFormStateToStore = (
  formId: FormId,
  values: TinaDocument,
  errors: Record<string, unknown> | undefined,
  name: string | undefined
) => {
  const store = useFormStore.getState();
  if (name !== undefined) {
    // The store's live-values mirror is flat, one entry per top-level
    // field. A nested field name collapses to its top-level address.
    const topLevel = name.split('.')[0];
    store.setFieldValue(formId, toFieldAddress(topLevel), values[topLevel]);
  }
  const flat = flattenFieldErrors(errors ?? {});
  const mirrored: FieldErrors = {};
  for (const [address, messages] of Object.entries(flat)) {
    mirrored[toFieldAddress(address)] = messages;
  }
  store.setFieldErrors(formId, mirrored);
};

const notifyWatchedFieldChange = (
  name: string | undefined,
  values: TinaDocument,
  formHooks: ReturnType<typeof resolveFormHooks>,
  formId: FormId,
  path: string,
  collection: CollectionSchema,
  trigger: (names: string[]) => Promise<boolean>
) => {
  if (name === undefined) return;
  runOnChange(
    formHooks,
    { address: toFieldAddress(name), value: get(values, name) },
    { formId, path, collection }
  );
  const dependents = addressesWithValidators(
    collection.fields,
    values,
    SELF_CONTAINED_VALIDATORS
  );
  if (dependents.length > 0) void trigger(dependents);
};

const resolveSeedValues = (
  keepsIncoming: boolean,
  keptSeed: TinaDocument | null,
  ingested: TinaDocument
): TinaDocument => {
  if (!keepsIncoming || keptSeed === null) return ingested;
  return keptSeed;
};

function useDocumentIngestion(
  path: string,
  document: TinaDocument | undefined,
  collection: CollectionSchema,
  registry: ReturnType<typeof createFieldRegistry>,
  hooks: ReturnType<typeof createFormHookRegistry>
) {
  const formHooks = useMemo(
    () => resolveFormHooks(hooks, collection.hooks ?? []),
    [hooks, collection]
  );
  const transformContext = useMemo(
    () => ({ documentPath: path, registry }),
    [path, registry]
  );
  const ingested = useMemo(
    () => ingestDocument(document, collection.fields, transformContext),
    [document, collection, transformContext]
  );
  const equal = useMemo(
    () => fieldEqualityFor(collection.fields, transformContext),
    [collection, transformContext]
  );
  return { formHooks, ingested, equal };
}

function useSeededFormSync(
  formId: FormId,
  userId: DraftUserScope,
  ingested: TinaDocument,
  equal: ReturnType<typeof fieldEqualityFor>,
  seedValues: TinaDocument,
  keptSeed: TinaDocument | null,
  resetForm: (values: TinaDocument, options?: { keepErrors?: boolean }) => void
) {
  const reseeds = useRef(0);
  const [seedKey, setSeedKey] = useState(() => `${formId}#${reseeds.current}`);
  const advanceSeedKey = useCallback((seededFormId: FormId) => {
    reseeds.current += 1;
    setSeedKey(`${seededFormId}#${reseeds.current}`);
  }, []);

  const seededSignature = useRef<string | null>(null);
  useEffect(() => {
    syncSeededForm(
      seededSignature,
      formId,
      userId,
      ingested,
      equal,
      seedValues,
      keptSeed,
      resetForm,
      advanceSeedKey
    );
  }, [
    formId,
    userId,
    ingested,
    seedValues,
    keptSeed,
    resetForm,
    equal,
    advanceSeedKey,
  ]);

  const view = useFormViewStore(formId);
  const discardEdits = useCallback(() => {
    const { closeLevelsAbove, resetReveal } = view.getState();
    closeLevelsAbove(0);
    resetReveal();
    discardFormEdits(formId, resetForm, advanceSeedKey);
  }, [formId, resetForm, advanceSeedKey, view]);

  return { seedKey, advanceSeedKey, discardEdits, view };
}

function useFormMethodSubscriptions(
  formId: FormId,
  path: string,
  collection: CollectionSchema,
  formHooks: ReturnType<typeof resolveFormHooks>,
  methods: ReturnType<typeof useForm<TinaDocument>>
) {
  useEffect(() => {
    const unsubscribe = methods.subscribe({
      formState: { values: true, errors: true },
      callback: ({ values, errors, name }) =>
        mirrorFormStateToStore(formId, values, errors, name),
    });
    return () => unsubscribe();
  }, [formId, methods]);

  // react-hook-form applies the resolver's result to the changed field only,
  // so a field-level rule that reads a sibling would keep a stale error after
  // the sibling changes. Re-validate the fields that carry validators, and
  // only those, so an untouched `required` field stays quiet. `watch` fires on
  // value changes alone, not on the state `trigger` emits, so this cannot loop.
  useEffect(() => {
    const { unsubscribe } = methods.watch((values, { name }) =>
      notifyWatchedFieldChange(
        name,
        values,
        formHooks,
        formId,
        path,
        collection,
        methods.trigger
      )
    );
    return () => unsubscribe();
  }, [methods, collection, formHooks, formId, path]);
}

export interface FormProviderProps {
  collection: CollectionSchema;
  path: string;
  document?: TinaDocument;
  onSave?: SaveHandler;
  children: ReactNode;
}

export function FormProvider({
  collection,
  path,
  document,
  onSave,
  children,
}: FormProviderProps) {
  const runtime = use(TinaRuntimeContext);
  if (!runtime) {
    throw new Error('FormProvider must be used within a TinaProvider');
  }
  const { registry, validators, hooks } = runtime;

  const formId = toFormId(path);
  const userId = useFormStore((state) => state.userId);
  const { formHooks, ingested, equal } = useDocumentIngestion(
    path,
    document,
    collection,
    registry,
    hooks
  );
  // What a fresh form instance adopts from the store. It samples the store one time,
  // because RHF replaces its full error state each time the `errors` option changes
  // identity — a rebuild on each document would overwrite the live errors of the user.
  const kept = useMemo(
    () => readKeptSeed(formId, ingested, equal),
    [formId, userId]
  );
  // Whether the scope still keeps its values against the document of this render. A
  // clean scope stops keeping them when another writer changes the file, so the test
  // must follow the document, not only the form id.
  const keepsIncoming = useMemo(
    () => readOpeningScope(formId, toFormValues(ingested), equal) !== undefined,
    [formId, userId, ingested, equal]
  );
  const seedValues = resolveSeedValues(keepsIncoming, kept.seed, ingested);
  const resolver = buildFormResolver(collection, registry, validators);
  const methods = useForm<TinaDocument>({
    defaultValues: seedValues,
    errors: kept.errors,
    resolver,
    mode: 'onChange',
    shouldFocusError: false,
  });

  const { seedKey, advanceSeedKey, discardEdits, view } = useSeededFormSync(
    formId,
    userId,
    ingested,
    equal,
    seedValues,
    kept.seed,
    methods.reset
  );

  const [draftRevision, setDraftRevision] = useState(0);
  const status = useFormStatus(formId);
  const stale = useMemo(
    () => staleDraft(formId, toFormValues(ingested), equal),
    [formId, userId, ingested, equal, draftRevision, status]
  );
  const staleDraftActions = useMemo(
    () =>
      buildStaleDraftActions(stale, formId, methods.reset, advanceSeedKey, () =>
        setDraftRevision((revision) => revision + 1)
      ),
    [stale, formId, methods, advanceSeedKey]
  );

  useFormMethodSubscriptions(formId, path, collection, formHooks, methods);

  const [fieldReseeds, setFieldReseeds] = useState(0);
  const reseedFields = useCallback(
    () => setFieldReseeds((count) => count + 1),
    []
  );
  const fieldSeedKey = `${seedKey}~${fieldReseeds}`;
  useEffect(() => {
    view.getState().closeLevelsAbove(0);
  }, [fieldSeedKey, view]);
  const [failure, setFailure] = useState<{
    formId: FormId;
    message: string;
  } | null>(null);
  const saveFailure = failure?.formId === formId ? failure.message : null;
  const setSaveFailure = useCallback(
    (message: string | null) =>
      setFailure(message === null ? null : { formId, message }),
    [formId]
  );

  const formScope = useMemo(
    () => ({
      formId,
      path,
      collection,
      onSave: onSave ?? null,
      seedKey,
      fieldSeedKey,
      reseedFields,
      saveFailure,
      setSaveFailure,
      view,
      discardEdits,
      hooks: formHooks,
      staleDraft: staleDraftActions,
    }),
    [
      formId,
      path,
      collection,
      onSave,
      seedKey,
      fieldSeedKey,
      reseedFields,
      saveFailure,
      setSaveFailure,
      view,
      discardEdits,
      formHooks,
      staleDraftActions,
    ]
  );

  return (
    <FormScopeContext value={formScope}>
      <RhfFormProvider {...methods}>
        <>{children}</>
      </RhfFormProvider>
    </FormScopeContext>
  );
}
