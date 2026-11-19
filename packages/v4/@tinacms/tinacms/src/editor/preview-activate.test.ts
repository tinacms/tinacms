import { describe, expect, it } from 'vitest';
import { t } from '../index';
import type { CollectionSchema } from '../core/schema/types';
import {
  collectionOfPath,
  decidePlacement,
  findCrossing,
} from './preview-activate';

const author: CollectionSchema = {
  name: 'author',
  path: 'content/authors',
  format: 'md',
  fields: [t.string({ name: 'name' })],
};
const post: CollectionSchema = {
  name: 'post',
  path: 'content/posts',
  format: 'mdx',
  fields: [
    t.string({ name: 'title' }),
    t.reference({ name: 'author', collections: ['author'] }),
    t.object({ name: 'seo', fields: [t.string({ name: 'title' })] }),
  ],
};
const collections = [post, author];
const POST = 'content/posts/a.mdx';
const AUTHOR = 'content/authors/jane.md';
const values = { title: 'A', author: AUTHOR, seo: { title: 'S' } };
const valueAt = (address: string) =>
  address
    .split('.')
    .reduce<unknown>(
      (held, key) => (held as Record<string, unknown> | undefined)?.[key],
      values
    );

describe('collectionOfPath', () => {
  it('finds the collection whose path prefixes the document', () => {
    expect(collectionOfPath(POST, collections)?.name).toBe('post');
  });
  it('lets the longest collection path win', () => {
    const nested: CollectionSchema = {
      ...post,
      name: 'nested',
      path: 'content/posts/long',
    };
    expect(
      collectionOfPath('content/posts/long/x.mdx', [post, nested])?.name
    ).toBe('nested');
  });
  it('rejects a path with a dot-dot segment and a path no collection owns', () => {
    expect(
      collectionOfPath('content/posts/../authors/x.md', collections)
    ).toBeUndefined();
    expect(collectionOfPath('other/x.md', collections)).toBeUndefined();
  });
});

describe('findCrossing', () => {
  it('finds the reference an address goes through and the rest of the address', () => {
    expect(
      findCrossing('author.name', post.fields, valueAt, collections)
    ).toEqual({
      prefix: 'author',
      target: { collection: 'author', path: AUTHOR },
      rest: 'name',
    });
  });
  it('finds none for the reference field itself or an ordinary object', () => {
    expect(
      findCrossing('author', post.fields, valueAt, collections)
    ).toBeNull();
    expect(
      findCrossing('seo.title', post.fields, valueAt, collections)
    ).toBeNull();
  });
  it('finds none when the reference names no document', () => {
    expect(
      findCrossing(
        'author.name',
        post.fields,
        (a) => (a === 'author' ? 'elsewhere/x.md' : undefined),
        collections
      )
    ).toBeNull();
  });
});

describe('decidePlacement', () => {
  const postRef = { collection: 'post', path: POST };
  const authorRef = { collection: 'author', path: AUTHOR };
  const crossing = {
    prefix: 'author',
    target: { collection: 'author', path: AUTHOR },
    rest: 'name',
  };

  it('sets the field when the target is the document the form shows', () => {
    expect(
      decidePlacement({
        target: postRef,
        clicked: postRef,
        crossing: null,
        open: postRef,
        base: postRef,
        main: POST,
      })
    ).toEqual({ kind: 'set' });
  });
  it('goes back to the base when the target is the document a step came from', () => {
    expect(
      decidePlacement({
        target: postRef,
        clicked: postRef,
        crossing: null,
        open: authorRef,
        base: postRef,
        main: POST,
      })
    ).toEqual({ kind: 'open', target: postRef, step: null });
  });
  it('opens a document as the form’s own when there is no base', () => {
    expect(
      decidePlacement({
        target: postRef,
        clicked: postRef,
        crossing: null,
        open: null,
        base: null,
        main: POST,
      })
    ).toEqual({ kind: 'open', target: postRef, step: null });
  });
  it('opens a crossing with the clicked document as the step back when there is no base', () => {
    expect(
      decidePlacement({
        target: authorRef,
        clicked: postRef,
        crossing,
        open: null,
        base: null,
        main: POST,
      })
    ).toEqual({
      kind: 'open',
      target: authorRef,
      step: { from: postRef, prefix: 'author' },
    });
  });
  it('opens a crossing from the base as a step keeping the prefix', () => {
    expect(
      decidePlacement({
        target: authorRef,
        clicked: postRef,
        crossing,
        open: postRef,
        base: postRef,
        main: POST,
      })
    ).toEqual({
      kind: 'open',
      target: authorRef,
      step: { from: postRef, prefix: 'author' },
    });
  });
  it('opens the page’s main document as the form’s own when another document is open', () => {
    const other = { collection: 'post', path: 'content/posts/other.mdx' };
    expect(
      decidePlacement({
        target: postRef,
        clicked: postRef,
        crossing: null,
        open: other,
        base: other,
        main: POST,
      })
    ).toEqual({ kind: 'open', target: postRef, step: null });
  });
  it('opens another document as a step from the base', () => {
    const nav = { collection: 'global', path: 'content/global/site.json' };
    expect(
      decidePlacement({
        target: nav,
        clicked: nav,
        crossing: null,
        open: postRef,
        base: postRef,
        main: POST,
      })
    ).toEqual({ kind: 'open', target: nav, step: { from: postRef } });
  });
});
