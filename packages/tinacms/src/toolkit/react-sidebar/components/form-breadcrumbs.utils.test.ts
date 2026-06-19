import { describe, expect, it } from 'vitest';
import {
  collectionListPathForDocument,
  documentListPath,
} from './form-breadcrumbs.utils';

describe('documentListPath', () => {
  it('points a root-level document at the collection root', () => {
    expect(documentListPath('post', 'my-post.md')).toBe('/collections/post/~');
  });

  it('points a document inside a folder at that folder list', () => {
    expect(documentListPath('post', 'my-folder/my-post.md')).toBe(
      '/collections/post/~/my-folder'
    );
  });

  it('preserves nested folder paths', () => {
    expect(documentListPath('post', 'a/b/c/my-post.md')).toBe(
      '/collections/post/~/a/b/c'
    );
  });

  it('works regardless of file extension', () => {
    expect(documentListPath('page', 'docs/intro.mdx')).toBe(
      '/collections/page/~/docs'
    );
  });
});

describe('collectionListPathForDocument', () => {
  const collection = { name: 'post', path: 'content/posts' };

  it('strips the collection path prefix for a root-level document', () => {
    expect(
      collectionListPathForDocument('content/posts/my-post.md', collection)
    ).toBe('/collections/post/~');
  });

  it('resolves the containing folder for a nested document', () => {
    expect(
      collectionListPathForDocument(
        'content/posts/a/b/c/my-post.md',
        collection
      )
    ).toBe('/collections/post/~/a/b/c');
  });

  it('handles a collection rooted at the repository root', () => {
    expect(
      collectionListPathForDocument('a/b/my-post.md', {
        name: 'post',
        path: '',
      })
    ).toBe('/collections/post/~/a/b');
  });
});
