import {
  type ReactNode,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FormProvider as RhfFormProvider,
  type UseFormReturn,
  useForm,
  useFormState,
} from 'react-hook-form';
import { toFieldAddress } from '../core/field/address';
import { createFieldRegistry } from '../core/field/registry';
import { ingestDocument } from '../core/form/ingest';
import { type PluginManifest, resolveClientSegments } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import {
  type FieldErrors,
  type FormId,
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
    return kept?.status === 'edited' ? toDocument(kept.values) : null;
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

  // Re-seed the form only when the seed's content actually changes (compared by
  // a JSON signature). RHF's useForm reads defaultValues only at mount, so this
  // reset reloads the form when you switch documents — while a same-content
  // re-render won't wipe in-progress edits. The divergence seam is closed across
  // remounts (a kept form's seed is the store's own values, so both sides
  // agree); the one remaining case — a document swap on a form edited while
  // mounted — still resets RHF while the store keeps its edits, awaiting the
  // draft slice's reload-vs-keep arbitration (form-store.ts registerForm TODO).
  const seededSignature = useRef<string | null>(null);
  useEffect(() => {
    // The signature carries the formId: an unkeyed switch between
    // identical-content documents must still reset, or the old form's RHF
    // edits would render — and save — under the new form's path.
    const signature = JSON.stringify([formId, seedValues]);
    if (seededSignature.current === null) {
      seededSignature.current = signature;
      return;
    }
    if (seededSignature.current !== signature) {
      seededSignature.current = signature;
      methods.reset(seedValues);
    }
  }, [formId, seedValues, methods]);

  // One-way RHF → form-store sync: RHF stays the value/render authority, the
  // form-store is the sole pristine/dirty/clean authority (ADR-010). This watch
  // subscription is the single chokepoint — wrapping field.onChange instead would
  // miss reset/setValue and be bypassable via a raw useController.
  useEffect(() => {
    const { registerForm, setFieldValue } = useFormStore.getState();
    registerForm(formId, toFormValues(seedValues));
    const subscription = methods.watch((values, { name }) => {
      // `name` is undefined on reset — re-adopting the baseline is registerForm's job.
      if (name === undefined) return;
      setFieldValue(formId, toFieldAddress(name), values[name]);
    });
    // No removeForm on unmount (ADR-012): navigating away keeps unsaved edits.
    return () => subscription.unsubscribe();
  }, [formId, seedValues, methods]);

  useErrorMirror(formId, methods, keptSeed);

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

// Keeps the store's error mirror faithful to RHF's derivations — one-way, like
// the value sync, with the store carrying the copy that outlives the mount
// (useFormErrors). One unit owns the whole coupled lifecycle:
//
// - Re-validate on re-adopt: RHF derives no errors from defaultValues, so a
//   form re-mounted onto invalid kept edits (`keptSeed`) would look error-free
//   until the next keystroke — one trigger() re-derives.
// - Until that resolves, the fresh RHF instance's empty error state is
//   pre-derivation noise: the pending flag (armed once per hosted form —
//   re-arming on later renders would swallow a legitimate errors-cleared write
//   after the flag is spent) keeps it from clobbering the kept errors. A
//   non-empty derivation IS the re-derivation, so it flows and spends the flag
//   in case it beat trigger's resolution.
// - Ownership guard: the run where formId changed (an unkeyed switch) still
//   holds the OUTGOING form's derivation — writing it would bleed one form's
//   errors into the other's scope. Skip it; the provider's reset re-derives
//   and its notification re-runs the mirror under the right owner. (Also skips
//   the mount run, whose fresh-instance {} has nothing to say.)
function useErrorMirror(
  formId: FormId,
  methods: UseFormReturn<TinaDocument>,
  keptSeed: TinaDocument | null
): void {
  const reAdoptValidationPending = useRef(false);
  const armedFormId = useRef<FormId | null>(null);
  if (armedFormId.current !== formId) {
    armedFormId.current = formId;
    reAdoptValidationPending.current = keptSeed !== null;
  }
  useEffect(() => {
    if (keptSeed) {
      void methods.trigger().finally(() => {
        reAdoptValidationPending.current = false;
      });
    }
  }, [keptSeed, methods]);

  const { errors } = useFormState({ control: methods.control });
  const mirroredFormId = useRef<FormId | null>(null);
  useEffect(() => {
    if (mirroredFormId.current !== formId) {
      mirroredFormId.current = formId;
      return;
    }
    const mirrored: FieldErrors = {};
    for (const [name, entry] of Object.entries(
      errors as Record<string, FieldErrorEntry | undefined>
    )) {
      const messages = fieldErrorMessages(entry);
      if (messages.length > 0) mirrored[toFieldAddress(name)] = messages;
    }
    const empty = Object.keys(mirrored).length === 0;
    if (reAdoptValidationPending.current) {
      if (empty) return;
      reAdoptValidationPending.current = false;
    }
    useFormStore.getState().setFieldErrors(formId, mirrored);
  }, [errors, formId]);
}
