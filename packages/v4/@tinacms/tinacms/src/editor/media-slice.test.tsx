import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { createStore } from 'zustand';
import type { TinaStoreState } from '../core/plugin';
import { type TinaRuntime, TinaRuntimeContext } from './context';
import { useMediaSlice } from './hooks';

const renderWithMedia = (media: Record<string, unknown>) => {
  const store = createStore<TinaStoreState>()(() => ({ media }));
  const runtime = { store } as unknown as TinaRuntime;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
  );
  return renderHook(() => useMediaSlice(), { wrapper });
};

const conforming = {
  upload: async () => 'a.png',
  list: async () => ({ items: [] }),
  delete: async () => {},
  resolveUrl: (path: string) => `/uploads/${path}`,
};

describe('useMediaSlice', () => {
  it('returns a slice that has the four media operations', () => {
    const { result } = renderWithMedia(conforming);
    expect(result.current.resolveUrl('a.png')).toBe('/uploads/a.png');
  });

  it('names the missing capability when a media plugin lacks an operation', () => {
    const { resolveUrl: _missing, ...partial } = conforming;
    expect(() => renderWithMedia(partial)).toThrow(/media-capability-missing/);
  });
});
