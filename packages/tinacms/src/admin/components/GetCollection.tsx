/**

*/

import type { Collection, TinaField, TinaSchema } from '@tinacms/schema-tools';
import type { TinaCMS } from '@tinacms/toolkit';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterArgs, TinaAdminApi } from '../api';
import LoadingPage from '../components/LoadingPage';
import { handleNavigate } from '../pages/CollectionListPage';
import type { CollectionResponse, DocumentForm } from '../types';
import { FullscreenError } from './FullscreenError';

const isValidSortKey = (sortKey: string, collection: Collection<true>) => {
  if (collection.fields) {
    const sortKeys = collection.fields.map((x) => x.name);
    return sortKeys.includes(sortKey);
  } else if (collection.templates) {
    const collectionMap: Record<string, TinaField> = {};
    const conflictedFields: Set<string> = new Set();
    for (const template of collection.templates) {
      for (const field of template.fields) {
        if (collectionMap[field.name]) {
          if (collectionMap[field.name].type !== field.type) {
            conflictedFields.add(field.name);
          }
        } else {
          collectionMap[field.name] = field;
        }
      }
    }
    for (const key in conflictedFields) {
      delete collectionMap[key];
    }
    for (const key in collectionMap) {
      if (key === sortKey) {
        return true;
      }
    }

    return false;
  }
};

export const useGetCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true,
  folder: { loading: boolean; fullyQualifiedName: string },
  after: string = '',
  sortKey?: string,
  filterArgs?: FilterArgs
) => {
  const api = new TinaAdminApi(cms);
  const schema = cms.api.tina.schema as TinaSchema;
  const collectionExtra = schema.getCollection(collectionName);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [collection, setCollection] = useState<
    CollectionResponse | Collection | undefined
  >(undefined);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [loading, setLoading] = useState<boolean>(true);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [error, setError] = useState<Error | undefined>(undefined);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [resetState, setResetSate] = useState(0);

  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  useEffect(() => {
    let cancelled = false;

    const fetchCollection = async () => {
      if ((await api.isAuthenticated()) && !folder.loading && !cancelled) {
        const { name, order } = JSON.parse(sortKey || '{}');
        const validSortKey = isValidSortKey(name, collectionExtra)
          ? name
          : undefined;
        try {
          const collection = await api.fetchCollection(
            collectionName,
            includeDocuments,
            filterArgs?.filterField ? '' : folder.fullyQualifiedName,
            after,
            validSortKey,
            order,
            filterArgs
          );
          setCollection(collection);
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetCollection failed: ${error.message}`
          );
          console.error(error);
          setCollection(undefined);
          setError(error);
        }

        setLoading(false);
      }
    };

    if (cancelled) return;

    setLoading(true);
    fetchCollection();

    // TODO: useDebounce
    return () => {
      cancelled = true;
    };
  }, [
    cms,
    collectionName,
    folder.loading,
    folder.fullyQualifiedName,
    resetState,
    after,
    sortKey,
  ]);

  const reFetchCollection = () => setResetSate((x) => x + 1);

  return { collection, loading, error, reFetchCollection, collectionExtra };
};

export const useSearchCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true,
  folder: { loading: boolean; fullyQualifiedName: string },
  after: string = '',
  search?: string
) => {
  const api = new TinaAdminApi(cms);
  const schema = cms.api.tina.schema as TinaSchema;
  const collectionExtra = schema.getCollection(collectionName);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [collection, setCollection] = useState<
    CollectionResponse | Collection | undefined
  >(undefined);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [loading, setLoading] = useState<boolean>(true);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [error, setError] = useState<Error | undefined>(undefined);
  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  const [resetState, setResetSate] = useState(0);

  // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
  useEffect(() => {
    let cancelled = false;

    const searchCollection = async () => {
      if ((await api.isAuthenticated()) && !folder.loading && !cancelled) {
        try {
          const response = (await cms.api.search.query(search, {
            limit: 15,
            cursor: after,
            collection: collectionName,
          })) as {
            results: { _id: string }[];
            nextCursor: string;
            prevCursor: string;
            fuzzyMatches?: Record<string, any[]>;
          };

          // Handle empty or missing results
          const results = response?.results ?? [];

          const docs = (await Promise.allSettled<
            Promise<{ document: DocumentForm }>
          >(
            results.map((result) => {
              const [collection, relativePath] = result._id.split(':');
              return api.fetchDocument(collection, relativePath, false);
            })
          )) as {
            status: 'fulfilled' | 'rejected';
            value: { document: DocumentForm };
            reason?: any;
          }[];

          const edges = docs
            .filter((p) => p.status === 'fulfilled' && !!p.value?.document)
            .map((result) => ({ node: result.value.document })) as any[];

          const c = await api.fetchCollection(collectionName, false, '');
          const collectionData = {
            format: c.format,
            label: c.label,
            name: collectionName,
            templates: c.templates,
            documents: {
              pageInfo: {
                hasNextPage: !!response?.nextCursor,
                hasPreviousPage: !!response?.prevCursor,
                startCursor: '',
                endCursor: response?.nextCursor || '',
              },
              edges,
            },
          };

          setCollection(collectionData);
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetCollection failed: ${error.message}`
          );
          console.error(error);
          setCollection(undefined);
          setError(error);
        }

        setLoading(false);
      }
    };

    if (cancelled) return;

    setLoading(true);
    searchCollection();

    // TODO: useDebounce
    return () => {
      cancelled = true;
    };
  }, [
    cms,
    collectionName,
    folder.loading,
    folder.fullyQualifiedName,
    resetState,
    after,
    search,
  ]);

  const reFetchCollection = () => setResetSate((x) => x + 1);

  return { collection, loading, error, reFetchCollection, collectionExtra };
};

const GetCollection = ({
  cms,
  collectionName,
  folder,
  includeDocuments = true,
  startCursor,
  sortKey,
  children,
  filterArgs,
  search,
}: {
  cms: TinaCMS;
  collectionName: string;
  folder: { loading: boolean; fullyQualifiedName: string };
  includeDocuments?: boolean;
  startCursor?: string;
  sortKey?: string;
  children: any;
  filterArgs?: FilterArgs;
  search?: string;
}) => {
  const navigate = useNavigate();

  const { collection, loading, error, reFetchCollection, collectionExtra } =
    search
      ? // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
        useSearchCollection(
          cms,
          collectionName,
          includeDocuments,
          folder,
          startCursor || '',
          search
        )
      : // biome-ignore lint/correctness/useHookAtTopLevel: not ready to fix these yet
        useGetCollection(
          cms,
          collectionName,
          includeDocuments,
          folder,
          startCursor || '',
          sortKey,
          filterArgs
        ) || {};

  useEffect(() => {
    if (loading) return;

    // get the collection definition
    const collectionDefinition = cms.api.tina.schema.getCollection(
      collection.name
    );

    // check if the collection allows create or delete
    const allowCreate =
      collectionDefinition?.ui?.allowedActions?.create ?? true;
    const allowDelete =
      collectionDefinition?.ui?.allowedActions?.delete ?? true;

    const collectionResponse = collection as CollectionResponse;
    if (
      !allowCreate &&
      !allowDelete &&
      // Check there is only one document
      collectionResponse.documents?.edges?.length === 1 &&
      // Check to make sure the file is not a folder
      collectionResponse.documents?.edges[0]?.node?.__typename !== 'Folder'
    ) {
      const doc = collectionResponse.documents.edges[0].node;
      handleNavigate(
        navigate,
        cms,
        collectionResponse,
        collectionDefinition,
        doc
      );
    }
  }, [collection?.name || '', loading]);

  if (error) {
    return <FullscreenError />;
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <>{children(collection, loading, reFetchCollection, collectionExtra)}</>
  );
};

export default GetCollection;
