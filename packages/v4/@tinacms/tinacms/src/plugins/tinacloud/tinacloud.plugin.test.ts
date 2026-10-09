import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveClientSegments } from '../../core/plugin';
import { type TinaRuntime, TinaRuntimeContext } from '../../editor/context';
import { useMediaSlice } from '../../editor/hooks';
import { createTinaStore } from '../../store/create-store';
import { mediaManagerPlugin } from '../media-manager/media-manager.plugin';
import { TINACLOUD_ASSETS_URL, TINACLOUD_IDENTITY_URL } from './client';
import { tinaCloud } from './tinacloud.plugin';

const boot = async () => {
  const store = createTinaStore(
    await resolveClientSegments([
      tinaCloud({ clientId: 'abc', getToken: () => 'secret' }),
      mediaManagerPlugin(),
    ])
  );
  const runtime = { store } as unknown as TinaRuntime;
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(TinaRuntimeContext, { value: runtime }, children);
  const { result } = renderHook(() => useMediaSlice(), { wrapper });
  return { store, media: result.current };
};

beforeEach(() => localStorage.clear());

afterEach(() => vi.unstubAllGlobals());

describe('tinaCloud()', () => {
  it('provides the media capability', () => {
    expect(
      tinaCloud({ clientId: 'abc', getToken: () => undefined }).provides
    ).toEqual(['media']);
  });

  it('mounts a media slice with every operation, rename and features', async () => {
    const { media } = await boot();
    expect(Object.keys(media).sort()).toEqual([
      'delete',
      'features',
      'list',
      'mediaBranch',
      'rename',
      'resolveUrl',
      'upload',
    ]);
    expect(media.features).toEqual({
      search: true,
      extensionFilter: true,
      maxSize: 100 * 1024 * 1024,
    });
  });

  const stubTinaCloud = (project: Record<string, unknown>) => {
    const fetchMock = vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(
            url.startsWith(TINACLOUD_IDENTITY_URL)
              ? project
              : { files: [], directories: [] }
          )
        )
    );
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  it("uses the project's default branch when the store has no branch", async () => {
    const fetchMock = stubTinaCloud({
      defaultBranch: 'main',
      mediaBranch: 'main',
    });
    const { media } = await boot();
    await media.list('');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${TINACLOUD_IDENTITY_URL}/v2/apps/abc`,
      `${TINACLOUD_ASSETS_URL}/v2/abc/list/?limit=20&branch=main`,
    ]);
    expect(media.resolveUrl('hero.png')).toBe(
      'https://assets.tina.io/abc/hero.png'
    );
  });

  it('reads the branch from store.branch.name at call time', async () => {
    const fetchMock = stubTinaCloud({
      defaultBranch: 'main',
      mediaBranch: 'main',
    });
    const { store, media } = await boot();
    store.setState({ branch: { name: 'feat/x' } });
    await media.list('');
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${TINACLOUD_ASSETS_URL}/v2/abc/list/?limit=20&branch=feat%2Fx`
    );
    expect(media.resolveUrl('hero.png')).toBe(
      'https://assets.tina.io/abc/__staging/feat/x/__file/hero.png'
    );
  });

  it('serves the default branch from staging when it is not the media branch', async () => {
    stubTinaCloud({ defaultBranch: 'main', mediaBranch: 'tina-media' });
    const { media } = await boot();
    await media.list('');
    expect(media.resolveUrl('hero.png')).toBe(
      'https://assets.tina.io/abc/__staging/main/__file/hero.png'
    );
  });
});
