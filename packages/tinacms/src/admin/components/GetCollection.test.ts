import { describe, expect, it } from 'vitest';

import type { CollectionResponse } from '../types';
import { shouldAutoOpenCollectionDocument } from './GetCollection.utils';

const collectionWithNode = (node: { __typename: string }) =>
  ({
    documents: {
      edges: [{ node }],
    },
  }) as CollectionResponse;

describe('shouldAutoOpenCollectionDocument', () => {
  it('auto-opens a single document at the collection root when create and delete are disabled', () => {
    expect(
      shouldAutoOpenCollectionDocument({
        allowCreate: false,
        allowDelete: false,
        collection: collectionWithNode({ __typename: 'Document' }),
        folder: { fullyQualifiedName: '~' },
      })
    ).toBe(true);
  });

  it('does not auto-open a single document inside a folder view', () => {
    expect(
      shouldAutoOpenCollectionDocument({
        allowCreate: false,
        allowDelete: false,
        collection: collectionWithNode({ __typename: 'Document' }),
        folder: { fullyQualifiedName: '~/album-one' },
      })
    ).toBe(false);
  });

  it('does not auto-open folders', () => {
    expect(
      shouldAutoOpenCollectionDocument({
        allowCreate: false,
        allowDelete: false,
        collection: collectionWithNode({ __typename: 'Folder' }),
        folder: { fullyQualifiedName: '~' },
      })
    ).toBe(false);
  });
});
