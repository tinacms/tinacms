import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useCollectionFolder } from './utils';

const FolderProbe = () => {
  const folder = useCollectionFolder();
  return <output>{JSON.stringify(folder)}</output>;
};

const readFolder = (url: string) => {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path='collections/:collectionName/*' element={<FolderProbe />} />
      </Routes>
    </MemoryRouter>
  );
  return JSON.parse(screen.getByRole('status').textContent ?? '{}');
};

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

  it('reads a nested folder and its parent', () => {
    expect(readFolder('/collections/post/~/guides/setup')).toMatchObject({
      name: 'guides/setup',
      fullyQualifiedName: '~/guides/setup',
      parentName: '/~/guides',
    });
  });

  it('decodes an encoded folder name once', () => {
    expect(readFolder('/collections/post/~/my%20notes/50%25')).toMatchObject({
      name: 'my notes/50%',
      fullyQualifiedName: '~/my notes/50%',
    });
  });
});
