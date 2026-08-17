import { canonicalPath } from '@tinacms/schema-tools';

// Admin URL of the list view for the folder containing a document.
// `filePath` is the doc's in-collection path (e.g. "folder/sub/doc.md");
// folder lists live under "~/", and a root-level doc lands on the collection root.
export const documentListPath = (collectionName: string, filePath: string) => {
  const folderPath = canonicalPath(filePath).split('/').slice(0, -1).join('/');
  return `/collections/${collectionName}/~${folderPath ? `/${folderPath}` : ''}`;
};

// Same as documentListPath, but takes a document's full content path
// (e.g. "content/posts/folder/doc.md") and resolves the in-collection
// path by stripping the collection's own path prefix.
export const collectionListPathForDocument = (
  fullPath: string,
  collection: { name: string; path?: string }
) => {
  const collectionPath = canonicalPath(collection.path || '');
  const canonical = canonicalPath(fullPath);
  const relativePath = collectionPath
    ? canonical.slice(collectionPath.length + 1)
    : canonical;
  return documentListPath(collection.name, relativePath);
};
