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
import { type FieldErrorEntry, fieldErrorMessages } from './field-errors';
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
  // values into the fresh RHF instance instead of re-seeding from the document.
  // Edited scopes only — a pristine kept scope must re-adopt the incoming
  // document (registerForm's "pristine is never stale" contract), not shadow it
  // with the old mirror. Read once per hosted form ([formId], not reactive):
  // while THIS instance hosts the form, the store mirrors RHF — adopting the
  // mirror back mid-flight would be a cycle, and a document swap under kept
  // edits keeps the edits (matching the store's edited no-op; the future draft
  // slice arbitrates reload-vs-keep, form-store.ts registerForm).
  const keptSeed = useMemo(() => {
    const kept = useFormStore.getState().forms[formId];
    return isEdited(kept) ? toDocument(kept.values) : null;
  }, [formId]);
  const seedValues = keptSeed ?? ingested;
  const resolver = useMemo(
    () => buildFormResolver(collection, registry),
    [collection, registry]
  );
  const methods = useForm<TinaDocument>({
    defaultValues: seedValues,
    resolver,
    mode: 'onChange',
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
    const signature = JSON.stringify([formId, seedValues]);
    if (
      seededSignature.current !== null &&
      seededSignature.current !== signature
    ) {
      methods.reset(seedValues);
    }
    seededSignature.current = signature;
    // No removeForm on unmount (ADR-012): navigating away keeps unsaved edits.
    useFormStore.getState().registerForm(formId, toFormValues(seedValues));
  }, [formId, seedValues, methods]);

  // One-way RHF → form-store sync, values and errors on one subscription: RHF
  // stays the value/render authority, the form-store is the sole
  // pristine/dirty/clean authority (ADR-010). methods.subscribe is the single
  // chokepoint — wrapping field.onChange instead would miss reset/setValue and
  // be bypassable via a raw useController. The subscription's lifetime IS the
  // hosted form's ([formId]; keptSeed is memoized per formId), so a derivation
  // can never land under another form's id — no ownership guard needed.
  useEffect(() => {
    // Re-validate on re-adopt: RHF derives no errors from defaultValues, so a
    // form re-mounted onto invalid kept edits would look error-free until the
    // next keystroke — one trigger() re-derives. Until it resolves, the fresh
    // instance's empty derivations are pre-derivation noise that must not
    // clobber the kept errors; a non-empty derivation IS the re-derivation, so
    // it flows and spends the flag. A VALID re-derivation emits nothing
    // non-empty, so a still-armed flag is spent here — writing the empty map
    // in case the kept errors went stale (rules loosened between hosts).
    let reAdoptValidationPending = keptSeed !== null;
    if (keptSeed) {
      methods.trigger().then(
        (isValid) => {
          if (!reAdoptValidationPending) return;
          reAdoptValidationPending = false;
          if (isValid) useFormStore.getState().setFieldErrors(formId, {});
        },
        () => {
          reAdoptValidationPending = false;
        }
      );
    }
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
        if (reAdoptValidationPending) {
          if (Object.keys(mirrored).length === 0) return;
          reAdoptValidationPending = false;
        }
        store.setFieldErrors(formId, mirrored);
      },
    });
    return () => unsubscribe();
  }, [formId, keptSeed, methods]);

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
