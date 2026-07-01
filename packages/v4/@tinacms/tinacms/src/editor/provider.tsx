import {
  type ReactNode,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormProvider as RhfFormProvider, useForm } from 'react-hook-form';
import type { FieldAddress } from '../core/field/address';
import {
  type FieldRegistry,
  resolveFieldPlugins,
} from '../core/field/registry';
import { ingestDocument } from '../core/form/ingest';
import type { PluginManifest } from '../core/plugin';
import type { CollectionSchema, TinaDocument } from '../core/schema/types';
import {
  ActiveFieldContext,
  CollectionContext,
  RegistryContext,
} from './context';
import { buildFormResolver } from './resolver';

export interface TinaProviderProps {
  plugins: PluginManifest[];
  children: ReactNode;
}

export function TinaProvider({ plugins, children }: TinaProviderProps) {
  // TODO(zustand): the resolved registry + this loading/error state belong in the
  // global Tina store (ADR-003), composed once at boot — not per-provider state.
  const [registry, setRegistry] = useState<FieldRegistry | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const pluginsKey = plugins.map((plugin) => plugin.name).join('|');

  // TODO(zustand): resolve plugins once at boot into the global store (ADR-003)
  // rather than in this effect — the provider would then just read a ready
  // registry, with no loading state or in-effect async here.
  useEffect(() => {
    let mounted = true;
    resolveFieldPlugins(plugins)
      .then((resolved) => {
        if (mounted) setRegistry(resolved);
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
  if (!registry) return null;
  return <RegistryContext value={registry}>{children}</RegistryContext>;
}

export interface FormProviderProps {
  collection: CollectionSchema;
  document?: TinaDocument;
  children: ReactNode;
}

export function FormProvider({
  collection,
  document,
  children,
}: FormProviderProps) {
  const registry = use(RegistryContext);
  if (!registry) {
    throw new Error('FormProvider must be used within a TinaProvider');
  }

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

  // TODO(zustand): active-field / UI state should live in the global Tina store.
  const [active, setActive] = useState<FieldAddress | null>(null);
  const activeField = useMemo(() => ({ active, setActive }), [active]);

  return (
    <CollectionContext value={collection}>
      <ActiveFieldContext value={activeField}>
        <RhfFormProvider {...methods}>
          {/* Fragment pins children to a ReactElement — RHF's FormProvider children
              type predates the bigint that React 19's ReactNode includes. */}
          <>{children}</>
        </RhfFormProvider>
      </ActiveFieldContext>
    </CollectionContext>
  );
}
