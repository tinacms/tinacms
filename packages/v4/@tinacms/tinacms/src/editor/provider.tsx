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
import { FormProvider as RhfFormProvider, useForm } from 'react-hook-form';
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
import {
  type FieldErrorEntry,
  fieldErrorMessages,
  toFieldErrorEntry,
} from './field-errors';
import { buildFormResolver } from './resolver';

export interface TinaProviderProps {
  /**
   * The output of defineConfig. It already holds the composed plugin list, with the
   * built-ins folded in and the graph validated. This provider only imports and mounts.
   * A test that is not a configured app can pass the object directly.
   */
  config: ResolvedConfig;
  /**
   * The cache for the content reads (content-queries.ts). One is created if none is
   * passed, so a host needs no setup. Pass one to share the cache with the surrounding
   * app, or to control the retry and staleness policy in a test.
   *
   * A nested QueryClientProvider is supported, so an app with its own client keeps it.
   * The client here shadows that one for the editor's queries only. A passed client
   * must come from the same @tanstack/react-query install, or its context is a
   * different one.
   */
  queryClient?: QueryClient;
  children: ReactNode;
}

/**
 * The editor's default cache policy. It retries once. A content read crosses a dev
 * server that restarts, and one retry covers that without sitting on a real failure.
 */
const createDefaultQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

/**
 * The result of the async boot. The tree sees this result and the schema. The schema
 * needs no boot.
 */
type BootedRuntime = Omit<TinaRuntime, 'schema'>;

/**
 * A boot token that changes when the plugin set does: the names, in order.
 *
 * The names are compared member by member, and not by array reference. A config object
 * that is rebuilt on each render holds an equal plugin set, and must not boot again.
 * They are not compared by identity either. A host that calls defineConfig inside a
 * component mints a new manifest for every plugin on every render, so an identity check
 * makes the token climb for ever, and each setBooted schedules the next destroy and
 * init.
 *
 * The cost is a config swapped at runtime for one that keeps every plugin name and
 * changes a plugin's config. `localContentPlugin({ url })` puts that config on the
 * instance. The boot does not run again, and the manifests and client segments of the
 * first config stay. Build the config once, outside the component, and remount the
 * provider to change it.
 */
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

/**
 * This puts the plugin lifecycle of all provider instances into one sequence. It covers
 * the mount, unmount, and remount of StrictMode, and a change of the plugin key. The
 * onInit of the next boot waits for the teardown of the last instance, so an onDestroy
 * never runs after the onInit that follows it.
 *
 * It is module level because the manifests are module singletons, so their lifecycle is
 * global state.
 */
let lifecycleTurn: Promise<void> = Promise.resolve();

export function TinaProvider({
  config,
  queryClient,
  children,
}: TinaProviderProps) {
  /**
   * Created once per provider, and never during render of the tree below it. A client
   * built inline would be replaced on every render, and discard the cache each time.
   */
  const [ownQueryClient] = useState(createDefaultQueryClient);
  const activeQueryClient = queryClient ?? ownQueryClient;
  /**
   * One resolveClientSegments pass feeds both halves of the runtime (ADR-003). One
   * state object holds them, so the registry and the store always appear together.
   *
   * The schema stays out of that object. The boot is keyed on the plugin set, so a
   * schema held here would go stale when the schema changed and the plugin names did
   * not.
   */
  const [booted, setBooted] = useState<BootedRuntime | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const composedPlugins = config.plugins;
  const pluginsKey = usePluginsKey(composedPlugins);

  useEffect(() => {
    let mounted = true;
    // The graph pass (ADR-006) validates the manifests before it imports a
    // segment. A config with a conflict, or with a missing provider, fails here.
    // It does not fail part-way through the boot. The composition runs before the
    // init, because a field type conflict appears only in createFieldRegistry, and
    // it must not leave initialized plugins behind. The onInit runs last, before
    // the runtime is exposed, so no consumer sees a half-initialized plugin set.
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
    // Advance the shared turn at the mount, and not only at the teardown. A
    // second provider that mounts in the same commit then chains its onInit after
    // this boot. It does not race this boot on the module singleton manifests.
    // The teardown replaces the turn again with the destroy.
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
      // The teardown waits for the boot, and then becomes the next lifecycle
      // turn. The init sequence cannot be cancelled, so an unmount during the
      // boot still destroys the plugins that completed their init. A failed boot
      // has nothing to destroy. initializePlugins already tore down its partial
      // sequence, and setError reported the cause. A failed destroy is logged and
      // not thrown again, because an unmount has no error boundary.
      const destroyBootedPlugins = async () => {
        const destroyPlugins = await boot.catch(() => null);
        await destroyPlugins?.();
      };
      lifecycleTurn = destroyBootedPlugins().catch((cause) => {
        console.error('[tinacms] plugin teardown failed:', cause);
      });
    };
  }, [pluginsKey]);

  /**
   * Held, and not rebuilt. Every use(TinaRuntimeContext) consumer re-renders when this
   * object changes identity. Only the playground and the test config run the React
   * Compiler, and this package ships its source, so a consumer's bundler sees this hook
   * as written.
   *
   * A config rebuilt on each render still churns here, through `config.schema`.
   * usePluginsKey absorbs that for the plugin list only.
   */
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
  /**
   * The path of the open document. There is one form for each document (ADR-010), so
   * this path identifies the form in the form state store.
   */
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
  /**
   * The path of the document travels with its values. A field transform that depends on
   * the storage format reads the path from here. The rich-text field selects its codec
   * in this way. A collection with more than one format therefore resolves for each
   * document, and not for the whole collection.
   */
  const transformContext = useMemo(() => ({ documentPath: path }), [path]);
  /**
   * Held, and not rebuilt. Rebuilt on each render, this parses every field again — for
   * the rich-text field that is a whole parseMDX of the body — and hands the seed effect
   * below a new object, which reseeds the form on every render.
   *
   * Only the playground and the test config run the React Compiler, and this package
   * ships its source, so a consumer's bundler sees these hooks as written.
   */
  const ingested = useMemo(
    () =>
      ingestDocument(document, collection.fields, registry, transformContext),
    [document, collection, registry, transformContext]
  );
  /**
   * The store compares values, and the fields own the answer. This is where the two
   * meet. The registry lives on the runtime, and the store must not import it.
   */
  const equal = useMemo(
    () => fieldEqualityFor(collection.fields, registry, transformContext),
    [collection, registry, transformContext]
  );
  /**
   * The kept edits win over the incoming document. The store keeps an unsaved form
   * after the teardown (ADR-012). A new host of the same form id therefore adopts the
   * kept values and their mirrored errors into the new RHF instance, and does not seed
   * from the document. This applies to edited forms only. A kept pristine form adopts
   * the incoming document, because a pristine form is never stale.
   *
   * The hook reads the store once for each hosted form, keyed on the form id alone.
   * While this instance hosts the form, the store mirrors RHF, so a read of that mirror
   * during the mount would make a cycle. A change of document under kept edits keeps
   * the edits, which matches the store. The draft slice will later choose between the
   * new content and the kept edits.
   */
  const kept = useMemo(() => {
    const scope = readFormStore().forms[formId];
    if (!isEdited(scope)) return { seed: null, errors: {} };
    const errors: Record<string, FieldErrorEntry> = {};
    for (const [address, messages] of Object.entries(scope.errors)) {
      if (messages?.length) errors[address] = toFieldErrorEntry(messages);
    }
    return { seed: toDocument(scope.values), errors };
  }, [formId]);
  const seedValues = kept.seed ?? ingested;
  const resolver = buildFormResolver(collection, registry);
  const methods = useForm<TinaDocument>({
    defaultValues: seedValues,
    /**
     * The kept errors seed like the kept values. RHF adopts the whole map in its errors
     * effect, so an invalid form shows its errors again after a remount. It needs no
     * call to trigger().
     *
     * This is always an object. On a switch between forms, the new identity makes RHF
     * replace the errors of the last host. An empty object clears them. A null would
     * skip the effect and leak them.
     */
    errors: kept.errors,
    resolver,
    mode: 'onChange',
    /**
     * The error seeding must not take the focus. RHF focuses the first field with an
     * error each time its errors prop arrives. A save does not call handleSubmit, so
     * nothing else uses this flag.
     */
    shouldFocusError: false,
  });

  /**
   * A counter, so that two seeds of the same form id still give two different keys.
   */
  const reseeds = useRef(0);
  /**
   * The identity of the seed that the mounted fields read. RHF resets its values in
   * place, and a field that hosts an editor owning its own state cannot follow that. It
   * has to mount again. Plate is that editor. This key changes whenever this provider
   * reseeds RHF — a discard below, a document that changed under the form, or a switch
   * of document — and it holds the form id of that seed. Refer to useFormSeedKey.
   *
   * It is state updated when the reseed lands, and not a value computed from the formId
   * of the render. Computed, the key changed on the switch render itself — one render
   * before the reset below replaces the values — so an editor keyed on it mounted once
   * on the old document's values and again after the reset. The seed the fields read
   * does not change until the reset runs, so the key must not claim that it has.
   */
  const [seedKey, setSeedKey] = useState(() => `${formId}#${reseeds.current}`);
  const advanceSeedKey = useCallback((seededFormId: FormId) => {
    reseeds.current += 1;
    setSeedKey(`${seededFormId}#${reseeds.current}`);
  }, []);

  /**
   * The signature of the seed that RHF holds. The effect below adopts a new seed.
   *
   * The useForm hook of RHF reads defaultValues at the mount only, so a new seed must
   * reset the form. A JSON signature detects the change, and that signature holds the
   * form id. The form id is part of it because a switch between two documents with
   * equal content must still reset the form. Without that reset, the RHF edits of the
   * old form would render, and save, under the path of the new form. A re-render with
   * the same content clears no edit in progress.
   *
   * The first run registers the form only, because defaultValues already seeded RHF.
   *
   * One gap remains. A document that changes under a mounted and edited form resets
   * RHF, while the store keeps the edits. The draft slice will resolve this.
   */
  const seededSignature = useRef<string | null>(null);
  useEffect(() => {
    // The unmount does not call removeForm (ADR-012). A move away keeps the edits.
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
      // A kept seed arrives with its errors in place, because the errors effect
      // of RHF runs before this one. The reset must keep them. Any other seed is
      // new content, so its old errors must go.
      methods.reset(seedValues, { keepErrors: kept.seed !== null });
      advanceSeedKey(formId);
    }
  }, [formId, seedValues, kept, methods, equal, advanceSeedKey]);

  /**
   * Throw the edits away and put the form back on its baseline: the content it loaded,
   * or the content it last saved.
   *
   * Three places hold a value, and they move together — the store, RHF, and any editor
   * that owns its state. The store goes first, so the reset that RHF broadcasts lands
   * on a form that is already pristine.
   */
  const discardEdits = useCallback(() => {
    const store = readFormStore();
    const scope = store.forms[formId];
    if (!isEdited(scope)) return;
    const baseline = toDocument(scope.baseline);
    store.discardEdits(formId);
    methods.reset(baseline);
    advanceSeedKey(formId);
  }, [formId, methods, advanceSeedKey]);

  // A one-way sync from RHF to the form store, with the values and the errors on one
  // subscription. RHF owns the values and the render. The form store owns the
  // pristine, dirty, and clean status (ADR-010). The methods.subscribe call is the one
  // place that reads RHF. A wrapper around field.onChange would miss reset() and
  // setValue(), and a raw useController could go around it. The subscription lives as
  // long as the hosted form, so an update never lands under the id of another form.
  // Every update it receives also comes after the error seeding above.
  useEffect(() => {
    const unsubscribe = methods.subscribe({
      formState: { values: true, errors: true },
      callback: ({ values, errors, name }) => {
        const store = useFormStore.getState();
        // The name is undefined on a reset. registerForm adopts the baseline.
        if (name !== undefined) {
          store.setFieldValue(formId, toFieldAddress(name), values[name]);
        }
        const mirrored: FieldErrors = {};
        for (const [field, entry] of Object.entries(
          (errors ?? {}) as Record<string, FieldErrorEntry | undefined>
        )) {
          const messages = fieldErrorMessages(entry);
          if (messages.length > 0) mirrored[toFieldAddress(field)] = messages;
        }
        store.setFieldErrors(formId, mirrored);
      },
    });
    return () => unsubscribe();
  }, [formId, methods]);

  /**
   * Held, and it has to be. editor/context.ts documents this scope as changing only
   * when the document changes, and useFormSave keys its own useCallback on it.
   */
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
        {/* The fragment makes the children a ReactElement. The children type of
            the RHF FormProvider is older than the bigint in the ReactNode of
            React 19. */}
        <>{children}</>
      </RhfFormProvider>
    </FormScopeContext>
  );
}
