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
import {
  type FieldValues,
  FormProvider as RhfFormProvider,
  set,
  useForm,
} from 'react-hook-form';
import type { ResolvedConfig } from '../config';
import { toFieldAddress } from '../core/field/address';
import { createFieldRegistry } from '../core/field/registry';
import { fieldEqualityFor } from '../core/form/compare';
import { ingestDocument } from '../core/form/ingest';
import { type PluginManifest, resolveClientSegments } from '../core/plugin';
import { initializePlugins, validateCapabilityGraph } from '../core/resolve';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import { createScreenRegistry } from '../core/screen/registry';
import {
  type FieldErrors,
  type FormId,
  isEdited,
  keepsValues,
  readFormStore,
  toDocument,
  toFormId,
  toFormValues,
  useFormStore,
} from '../form/form-store';
import { createTinaStore } from '../store/create-store';
import {
  FormScopeContext,
  type SaveHandler,
  type TinaRuntime,
  TinaRuntimeContext,
} from './context';
import { flattenFieldErrors, toFieldErrorEntry } from './field-errors';
import { buildFormResolver } from './resolver';

export interface TinaProviderProps {
  config: ResolvedConfig;
  queryClient?: QueryClient;
  children: ReactNode;
}

const createDefaultQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

type BootedRuntime = Omit<TinaRuntime, 'schema'>;

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
    const boot = lifecycleTurn.then(async () => {
      validateCapabilityGraph(composedPlugins);
      const resolved = await resolveClientSegments(composedPlugins);
      const runtime: BootedRuntime = {
        registry: createFieldRegistry(resolved),
        store: createTinaStore(resolved),
        screens: createScreenRegistry(resolved),
      };
      const destroyPlugins = await initializePlugins(composedPlugins);
      if (mounted) setBooted(runtime);
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

  const runtime = useMemo(
    () => (booted ? { ...booted, schema: config.schema } : null),
    [booted, config.schema]
  );

  if (error) throw error;
  if (!runtime) return null;
  return (
    <QueryClientProvider client={activeQueryClient}>
      <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
    </QueryClientProvider>
  );
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
  const { registry } = runtime;

  const formId = toFormId(path);
  const transformContext = useMemo(
    () => ({ documentPath: path, registry }),
    [path, registry]
  );
  const ingested = useMemo(
    () =>
      ingestDocument(document, collection.fields, registry, transformContext),
    [document, collection, registry, transformContext]
  );
  const equal = useMemo(
    () => fieldEqualityFor(collection.fields, registry, transformContext),
    [collection, registry, transformContext]
  );
  // What a fresh form instance adopts from the store. It samples the store one time,
  // because RHF replaces its full error state each time the `errors` option changes
  // identity — a rebuild on each document would overwrite the live errors of the user.
  const kept = useMemo(() => {
    const scope = readFormStore().forms[formId];
    if (!keepsValues(scope, toFormValues(ingested)))
      return { seed: null, errors: {} };
    const errors: FieldValues = {};
    for (const [address, messages] of Object.entries(scope.errors)) {
      if (messages?.length) set(errors, address, toFieldErrorEntry(messages));
    }
    return { seed: toDocument(scope.values), errors };
  }, [formId]);
  // Whether the scope still keeps its values against the document of this render. A
  // clean scope stops keeping them when another writer changes the file, so the test
  // must follow the document, not only the form id.
  const keepsIncoming = useMemo(
    () => keepsValues(readFormStore().forms[formId], toFormValues(ingested)),
    [formId, ingested]
  );
  const seedValues = keepsIncoming ? (kept.seed ?? ingested) : ingested;
  const resolver = buildFormResolver(collection, registry);
  const methods = useForm<TinaDocument>({
    defaultValues: seedValues,
    errors: kept.errors,
    resolver,
    mode: 'onChange',
    shouldFocusError: false,
  });

  const reseeds = useRef(0);
  const [seedKey, setSeedKey] = useState(() => `${formId}#${reseeds.current}`);
  const advanceSeedKey = useCallback((seededFormId: FormId) => {
    reseeds.current += 1;
    setSeedKey(`${seededFormId}#${reseeds.current}`);
  }, []);

  const seededSignature = useRef<string | null>(null);
  useEffect(() => {
    useFormStore
      .getState()
      .registerForm(formId, toFormValues(seedValues), equal);
    const signature = JSON.stringify([formId, seedValues]);
    if (seededSignature.current === null) {
      seededSignature.current = signature;
      return;
    }
    if (seededSignature.current !== signature) {
      seededSignature.current = signature;
      methods.reset(seedValues, { keepErrors: seedValues === kept.seed });
      advanceSeedKey(formId);
    }
  }, [formId, seedValues, kept, methods, equal, advanceSeedKey]);

  const discardEdits = useCallback(() => {
    const store = readFormStore();
    const scope = store.forms[formId];
    if (!isEdited(scope)) return;
    const baseline = toDocument(scope.baseline);
    store.discardEdits(formId);
    methods.reset(baseline);
    advanceSeedKey(formId);
  }, [formId, methods, advanceSeedKey]);

  useEffect(() => {
    const unsubscribe = methods.subscribe({
      formState: { values: true, errors: true },
      callback: ({ values, errors, name }) => {
        const store = useFormStore.getState();
        if (name !== undefined) {
          // The store's live-values mirror is flat, one entry per top-level
          // field (`toFormValues`/`toDocument`). A nested field name (an
          // array item's own field) collapses to its top-level address here,
          // and re-reads that field's whole current value.
          const topLevel = name.split('.')[0];
          store.setFieldValue(
            formId,
            toFieldAddress(topLevel),
            values[topLevel]
          );
        }
        const flat: Record<string, string[]> = {};
        flattenFieldErrors(errors ?? {}, '', flat);
        const mirrored: FieldErrors = {};
        for (const [field, messages] of Object.entries(flat)) {
          mirrored[toFieldAddress(field)] = messages;
        }
        store.setFieldErrors(formId, mirrored);
      },
    });
    return () => unsubscribe();
  }, [formId, methods]);

  const formScope = useMemo(
    () => ({
      formId,
      path,
      collection,
      onSave: onSave ?? null,
      seedKey,
      discardEdits,
    }),
    [formId, path, collection, onSave, seedKey, discardEdits]
  );

  return (
    <FormScopeContext value={formScope}>
      <RhfFormProvider {...methods}>
        <>{children}</>
      </RhfFormProvider>
    </FormScopeContext>
  );
}
