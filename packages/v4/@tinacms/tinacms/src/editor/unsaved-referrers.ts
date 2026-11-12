import { collectReferences } from '../core/form/references';
import { type CollectionSchema, formatForPath } from '../core/schema/types';
import { isUnder, trimSlashes } from '../core/content/names';
import type { UnsavedDocument } from '../form/form-store';

export interface UnsavedReferrer {
  collection: string;
  path: string;
  title?: string;
}

/** The collection the server would read the document with: the longest `path` holding it whose format matches its extension. */
const ownerOf = (
  collections: CollectionSchema[],
  path: string
): CollectionSchema | undefined => {
  const format = formatForPath(path);
  if (format === undefined) return undefined;
  return collections
    .filter(
      (collection) =>
        collection.path !== undefined &&
        isUnder(path, trimSlashes(collection.path)) &&
        [collection.format].flat().includes(format)
    )
    .sort(
      (a, b) =>
        trimSlashes(b.path ?? '').length - trimSlashes(a.path ?? '').length
    )[0];
};

/**
 * The unsaved documents that hold a reference to a path `isMoved` accepts. Each
 * document is listed once, whichever of its copies holds the reference.
 */
export const findUnsavedReferrers = (
  collections: CollectionSchema[],
  documents: UnsavedDocument[],
  isMoved: (path: string) => boolean
): UnsavedReferrer[] => {
  const referrers = new Map<string, UnsavedReferrer>();
  for (const { path, values } of documents) {
    if (referrers.has(path)) continue;
    const owner = ownerOf(collections, path);
    if (!owner) continue;
    const refersToMoved = collectReferences(
      values,
      owner.fields,
      collections
    ).some((target) => isMoved(target.path));
    if (!refersToMoved) continue;
    const { title } = values;
    referrers.set(path, {
      collection: owner.name,
      path,
      ...(typeof title === 'string' && title !== '' ? { title } : {}),
    });
  }
  return [...referrers.values()];
};
