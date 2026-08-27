/**

*/

import type { TinaCMS } from '@tinacms/toolkit';
import {
  dispatchSessionExpired,
  isSessionExpiredError,
} from '@tinacms/toolkit';
import React, { useState, useEffect } from 'react';
import { TinaAdminApi } from '../api';
import type { DocumentForm } from '../types';
import { FullscreenError } from './FullscreenError';
import LoadingPage from './LoadingPage';
import { UnableToLoadModal } from './UnableToLoadModal';

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
      try {
        if ((await api.isAuthenticated()) && !isCancelled) {
          const response = await api.fetchDocument(
            collectionName,
            relativePath
          );

          // Only update state if the request hasn't been cancelled
          if (!isCancelled) {
            setDocument(response.document);
          }
        } else if (!isCancelled) {
          // Session gone: drop the previous document rather than leave the form
          // showing content the user can no longer save.
          dispatchSessionExpired(cms.events);
          setDocument(undefined);
        }
      } catch (error) {
        // Only handle error if the request hasn't been cancelled
        if (!isCancelled) {
          setDocument(undefined);
          // on session expiry request() already told the auth wall; no alert
          // over the login modal
          if (!isSessionExpiredError(error)) {
            cms.alerts.error(
              `[${error.name}] GetDocument failed: ${error.message}`
            );
            console.error(error);
            setError(error);
          }
        }
      }

      if (!isCancelled) {
        setLoading(false);
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

  // undefined when the session check skipped the fetch; consumers read
  // `document._values` straight away, so never hand them undefined
  if (!document) {
    return <UnableToLoadModal message='This document could not be loaded.' />;
  }

  return <>{children(document, loading)}</>;
};

export default GetDocument;
