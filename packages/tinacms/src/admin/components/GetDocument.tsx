/**

*/

import React, { useState, useEffect } from 'react';
import type { TinaCMS } from '@tinacms/toolkit';
import { TinaAdminApi } from '../api';
import type { DocumentForm } from '../types';
import LoadingPage from './LoadingPage';
import { FullscreenError } from './FullscreenError';

export const useGetDocument = (
  cms: TinaCMS,
  collectionName: string,
  relativePath: string
) => {
  const api = new TinaAdminApi(cms);
  const [document, setDocument] = useState<DocumentForm>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    let isCancelled = false; // Add cancellation flag

    const fetchDocument = async () => {
      if (api.isAuthenticated() && !isCancelled) {
        try {
          const response = await api.fetchDocument(
            collectionName,
            relativePath
          );

          // Only update state if the request hasn't been cancelled
          if (!isCancelled) {
            setDocument(response.document);
          }
        } catch (error) {
          // Only handle error if the request hasn't been cancelled
          if (!isCancelled) {
            cms.alerts.error(
              `[${error.name}] GetDocument failed: ${error.message}`
            );
            console.error(error);
            setDocument(undefined);
            setError(error);
          }
        }

        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchDocument();

    // Cleanup function to cancel the request
    return () => {
      isCancelled = true;
    };
  }, [cms, collectionName, relativePath]);

  return { document, loading, error };
};

const GetDocument = ({
  cms,
  collectionName,
  relativePath,
  children,
}: {
  cms: TinaCMS;
  collectionName: string;
  relativePath: string;
  children: any;
}) => {
  const { document, loading, error } = useGetDocument(
    cms,
    collectionName,
    relativePath
  );

  if (error) {
    return <FullscreenError />;
  }

  if (loading) {
    return <LoadingPage />;
  }

  return <>{children(document, loading)}</>;
};

export default GetDocument;
