import { useQueries } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { useInRouterContext } from 'react-router-dom';
import { useAdminRoute } from '../../../admin/use-admin-route';
import {
  CONTENT_STALE_TIME,
  contentKeys,
  useCurrentBranch,
  useContentSlice,
  useFieldActivation,
  useFieldAddress,
  useFieldFrame,
  useFieldSchema,
  useFieldValue,
  useSchemaCollections,
} from '../../../editor';
import type { ReferenceFieldSchema } from './reference-field.schema';
import {
  ReferenceFieldView,
  type ReferenceFieldViewDocument,
  type ReferenceFieldViewProps,
} from './reference-field.view';

interface ReferenceLists {
  /** One entry per collection the field names, in that order. */
  lists: {
    collection: string;
    documents: { path: string; title?: string }[];
  }[];
  isLoading: boolean;
  error: Error | null;
}

// `useCollectionDocuments` reads one collection, and a reference field can name
// several. `useQueries` takes the whole set in one call, so the hook order
// stays stable.
const useReferenceLists = (collections: string[]): ReferenceLists => {
  const content = useContentSlice();
  const branch = useCurrentBranch();
  return useQueries({
    queries: collections.map((collection) => ({
      queryKey: contentKeys.list(collection, branch),
      queryFn: () => content.list(collection),
      staleTime: CONTENT_STALE_TIME,
    })),
    combine: (results) => ({
      lists: collections.map((collection, index) => ({
        collection,
        documents:
          results[index]?.data?.map(({ path, title }) => ({ path, title })) ??
          [],
      })),
      isLoading: results.some((result) => result.isLoading),
      error: results.find((result) => result.error)?.error ?? null,
    }),
  });
};

/** The first collection to list a path wins, so each document appears once. */
const toDocuments = (
  lists: ReferenceLists['lists'],
  labelOf: (collection: string) => string
): ReferenceFieldViewDocument[] => {
  const seen = new Set<string>();
  const grouped = lists.length > 1;
  return lists.flatMap(({ collection, documents }) =>
    documents
      .filter(({ path }) => !seen.has(path) && seen.add(path))
      .map(({ path, title }) => ({
        value: path,
        label: title ?? path,
        meta: `${labelOf(collection)} · ${path}`,
        group: grouped ? labelOf(collection) : undefined,
        collection,
      }))
  );
};

/** Only mounted inside a Router, because `useAdminRoute` throws outside one. */
function RoutedReferenceFieldView(props: ReferenceFieldViewProps) {
  const { navigate } = useAdminRoute();
  return (
    <ReferenceFieldView
      {...props}
      onOpen={({ collection, value }) =>
        navigate({ view: 'document', collection, path: value })
      }
    />
  );
}

export function ReferenceField() {
  const address = useFieldAddress();
  const field = useFieldSchema<ReferenceFieldSchema>();
  const [stored, setValue] = useFieldValue<string | null>(address);
  const inputRef = useRef<HTMLInputElement>(null);
  const inRouter = useInRouterContext();
  const schemaCollections = useSchemaCollections();

  useFieldActivation(() => inputRef.current?.focus());

  const { lists, isLoading, error } = useReferenceLists(field.collections);
  const documents = useMemo(() => {
    if (error) return [];
    const labelOf = (name: string) =>
      schemaCollections.find((c) => c.name === name)?.label ?? name;
    return toDocuments(lists, labelOf);
  }, [error, lists, schemaCollections]);
  const value = typeof stored === 'string' && stored !== '' ? stored : null;
  const missing =
    value !== null &&
    !isLoading &&
    !error &&
    !documents.some((document) => document.value === value);

  const frame = useFieldFrame({
    warnings: missing ? ['This document no longer exists.'] : [],
  });

  let placeholder = 'Search documents…';
  if (isLoading) placeholder = 'Loading documents…';
  else if (error) placeholder = 'Could not load documents';

  const props: ReferenceFieldViewProps = {
    ...frame,
    errors: error ? [...frame.errors, error.message] : frame.errors,
    id: address,
    documents,
    value,
    missing,
    placeholder,
    disabled: frame.disabled || isLoading || error !== null,
    onChange: setValue,
    ref: inputRef,
  };

  return inRouter ? (
    <RoutedReferenceFieldView {...props} />
  ) : (
    <ReferenceFieldView {...props} />
  );
}
