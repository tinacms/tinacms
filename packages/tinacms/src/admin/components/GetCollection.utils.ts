import type { CollectionResponse } from '../types';

export const shouldAutoOpenCollectionDocument = ({
  allowCreate,
  allowDelete,
  collection,
  folder,
}: {
  allowCreate: boolean;
  allowDelete: boolean;
  collection: CollectionResponse;
  folder: { fullyQualifiedName: string };
}) => {
  return (
    !allowCreate &&
    !allowDelete &&
    // Only auto-open at the collection root. Folder views can legitimately
    // contain a single index document and must stay navigable.
    (!folder.fullyQualifiedName || folder.fullyQualifiedName === '~') &&
    // Check there is only one document
    collection.documents?.edges?.length === 1 &&
    // Check to make sure the file is not a folder
    collection.documents?.edges[0]?.node?.__typename !== 'Folder'
  );
};
