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
import { toFormId, toFormValues, useFormStore } from '../form/form-store';
import { createTinaStore } from '../store/create-store';
import {
  FormScopeContext,
  type SaveHandler,
  type TinaRuntime,
  TinaRuntimeContext,
} from './context';
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
  const defaultValues = useMemo(
    () => ingestDocument(document, collection.fields, registry),
    [document, collection, registry]
  );
  const resolver = useMemo(
    () => buildFormResolver(collection, registry),
    [collection, registry]
  );
  const methods = useForm<TinaDocument>({
    defaultValues,
    resolver,
    mode: 'onChange',
  });

  // Re-seed the form only when the document's content actually changes (compared by
  // a JSON signature). RHF's useForm reads defaultValues only at mount, so this
  // reset reloads the form when you switch documents — while a same-content
  // re-render won't wipe in-progress edits.
  //
  // Known seam: resetting while the form-store scope is *edited* diverges the two
  // (the store keeps edits per ADR-012, RHF adopts the new document). Unreachable
  // while a provider hosts one document; it's the trigger for the increment that
  // retires RHF value ownership (form-store.ts header).
  const seededSignature = useRef<string | null>(null);
  useEffect(() => {
    const signature = JSON.stringify(defaultValues);
    if (seededSignature.current === null) {
      seededSignature.current = signature;
      return;
    }
    if (seededSignature.current !== signature) {
      seededSignature.current = signature;
      methods.reset(defaultValues);
    }
  }, [defaultValues, methods]);

  // One-way RHF → form-store sync: RHF stays the value/render authority, the
  // form-store is the sole pristine/dirty/clean authority (ADR-010). This watch
  // subscription is the single chokepoint — wrapping field.onChange instead would
  // miss reset/setValue and be bypassable via a raw useController.
  useEffect(() => {
    const { registerForm, setFieldValue } = useFormStore.getState();
    registerForm(formId, toFormValues(defaultValues));
    const subscription = methods.watch((values, { name }) => {
      // `name` is undefined on reset — re-adopting the baseline is registerForm's job.
      if (name === undefined) return;
      setFieldValue(formId, toFieldAddress(name), values[name]);
    });
    // No removeForm on unmount (ADR-012): navigating away keeps unsaved edits.
    return () => subscription.unsubscribe();
  }, [formId, defaultValues, methods]);

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
