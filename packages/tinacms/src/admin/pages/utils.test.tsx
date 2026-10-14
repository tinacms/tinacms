import { renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useCollectionFolder } from './utils';

const readFolder = (url: string) =>
  renderHook(() => useCollectionFolder(), {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    ),
  }).result.current;

describe('useCollectionFolder', () => {
  it('reads no folder at the collection root', () => {
    expect(readFolder('/collections/post')).toMatchObject({
      name: '',
      fullyQualifiedName: '',
      loading: false,
    });
  });

  it('reads the root folder marker', () => {
    expect(readFolder('/collections/post/~')).toMatchObject({
      name: '',
      fullyQualifiedName: '~',
    });
  });

  it('reads a nested folder', () => {
    expect(readFolder('/collections/post/~/guides/setup')).toMatchObject({
      name: 'guides/setup',
      fullyQualifiedName: '~/guides/setup',
    });
  });

  it('decodes an encoded folder name once', () => {
    expect(readFolder('/collections/post/~/my%20notes/50%25')).toMatchObject({
      name: 'my notes/50%',
      fullyQualifiedName: '~/my notes/50%',
    });
  });
});
