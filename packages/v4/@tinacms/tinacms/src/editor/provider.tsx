import {
  type ReactNode,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormProvider as RhfFormProvider, useForm } from 'react-hook-form';
import { toFieldAddress } from '../core/field/address';
import { createFieldRegistry } from '../core/field/registry';
import { ingestDocument } from '../core/form/ingest';
import { type PluginManifest, resolveClientSegments } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import {
  type FieldErrors,
  isEdited,
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
  plugins: PluginManifest[];
  children: ReactNode;
}

export function TinaProvider({ plugins, children }: TinaProviderProps) {
  // One resolveClientSegments pass feeds both runtime halves (ADR-003), held as a
  // single state object so registry and store always appear together (no tearing).
  const [runtime, setRuntime] = useState<TinaRuntime | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const pluginsKey = plugins.map((plugin) => plugin.name).join('|');

  useEffect(() => {
    let mounted = true;
    resolveClientSegments(plugins)
      .then((resolved) => {
        if (mounted) {
          setRuntime({
            registry: createFieldRegistry(resolved),
            store: createTinaStore(resolved),
          });
        }
      })
      .catch((cause) => {
        if (mounted) {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      });
    return () => {
      mounted = false;
    };
  }, [pluginsKey]);

  if (error) throw error;
  if (!runtime) return null;
  return <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>;
}

export interface FormProviderProps {
  collection: CollectionSchema;
  // The open document's path — a form is opened per document (ADR-010), so this is
  // the form's identity in the form-state store.
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
  const ingested = useMemo(
    () => ingestDocument(document, collection.fields, registry),
    [document, collection, registry]
  );
  // Kept EDITS win over the incoming document: the store retains an unsaved
  // form across teardown (ADR-012), so hosting that formId again re-adopts its
  // values AND their mirrored errors into the fresh RHF instance instead of
  // re-seeding from the document. Edited scopes only — a pristine kept scope
  // must re-adopt the incoming document (registerForm's "pristine is never
  // stale" contract), not shadow it with the old mirror. Read once per hosted
  // form ([formId], not reactive): while THIS instance hosts the form, the
  // store mirrors RHF — adopting the mirror back mid-flight would be a cycle,
  // and a document swap under kept edits keeps the edits (matching the store's
  // edited no-op; the future draft slice arbitrates reload-vs-keep,
  // form-store.ts registerForm).
  const kept = useMemo(() => {
    const scope = useFormStore.getState().forms[formId];
    if (!isEdited(scope)) return { seed: null, errors: {} };
    const errors: Record<string, FieldErrorEntry> = {};
    for (const [address, messages] of Object.entries(scope.errors)) {
      if (messages?.length) errors[address] = toFieldErrorEntry(messages);
    }
    return { seed: toDocument(scope.values), errors };
  }, [formId]);
  const seedValues = kept.seed ?? ingested;
  const resolver = useMemo(
    () => buildFormResolver(collection, registry),
    [collection, registry]
  );
  const methods = useForm<TinaDocument>({
    defaultValues: seedValues,
    // Kept errors seed like kept values — RHF adopts them wholesale (its
    // errors-prop effect), so a re-mounted invalid form shows its errors with
    // no trigger() round trip. Always an object: on an unkeyed switch the
    // identity change makes RHF replace the previous host's errors ({} wipes;
    // null would skip the effect and leak them).
    errors: kept.errors,
    resolver,
    mode: 'onChange',
    // Error seeding must not steal focus (RHF focuses the first errored field
    // whenever its errors prop lands); saves don't go through handleSubmit, so
    // nothing else uses the flag.
    shouldFocusError: false,
  });

  // Adopt the seed. RHF's useForm reads defaultValues only at mount, so a
  // seed change resets the form — compared by a JSON signature that carries
  // the formId (an unkeyed switch between identical-content documents must
  // still reset, or the old form's RHF edits would render — and save — under
  // the new form's path), while a same-content re-render won't wipe
  // in-progress edits. The mount run only registers: defaultValues already
  // seeded RHF. The one remaining divergence seam — a document swap on a form
  // edited while mounted — still resets RHF while the store keeps its edits,
  // awaiting the draft slice's reload-vs-keep arbitration (form-store.ts
  // registerForm TODO).
  const seededSignature = useRef<string | null>(null);
  useEffect(() => {
    // No removeForm on unmount (ADR-012): navigating away keeps unsaved edits.
    useFormStore.getState().registerForm(formId, toFormValues(seedValues));
    const signature = JSON.stringify([formId, seedValues]);
    if (seededSignature.current === null) {
      seededSignature.current = signature;
      return;
    }
    if (seededSignature.current !== signature) {
      seededSignature.current = signature;
      // A kept seed arrives with its errors already seeded (RHF's errors-prop
      // effect runs before this one) — don't let the reset wipe them. Any
      // other seed is fresh content whose old errors must go.
      methods.reset(seedValues, { keepErrors: kept.seed !== null });
    }
  }, [formId, seedValues, kept, methods]);

  // One-way RHF → form-store sync, values and errors on one subscription: RHF
  // stays the value/render authority, the form-store is the sole
  // pristine/dirty/clean authority (ADR-010). methods.subscribe is the single
  // chokepoint — wrapping field.onChange instead would miss reset/setValue and
  // be bypassable via a raw useController. The subscription's lifetime IS the
  // hosted form's, so a derivation can never land under another form's id —
  // and every emission it sees post-dates the error seeding above, so there is
  // no pre-derivation noise to guard against.
  useEffect(() => {
    const unsubscribe = methods.subscribe({
      formState: { values: true, errors: true },
      callback: ({ values, errors, name }) => {
        const store = useFormStore.getState();
        // `name` is undefined on reset — re-adopting the baseline is registerForm's job.
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

  const formScope = useMemo(
    () => ({ formId, collection, onSave: onSave ?? null }),
    [formId, collection, onSave]
  );

  return (
    <FormScopeContext value={formScope}>
      <RhfFormProvider {...methods}>
        {/* Fragment pins children to a ReactElement — RHF's FormProvider children
            type predates the bigint that React 19's ReactNode includes. */}
        <>{children}</>
      </RhfFormProvider>
    </FormScopeContext>
  );
}
