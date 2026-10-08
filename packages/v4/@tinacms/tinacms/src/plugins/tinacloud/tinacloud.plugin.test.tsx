import { QueryClient } from '@tanstack/react-query';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TinaAdmin } from '../../admin/admin';
import { asResolvedConfig } from '../../config';
import { MediaError } from '../../core/media/contract';
import { definePlugin, resolveClientSegments } from '../../core/plugin';
import { type TinaRuntime, TinaRuntimeContext } from '../../editor/context';
import { useAuthSlice, useMediaSlice } from '../../editor/hooks';
import { createRpcHandler } from '../../rpc/handler';
import { defineServerPlugin } from '../../server';
import { createTinaStore } from '../../store/create-store';
import { stubLoginPopup, tinaCloudUser } from '../../test/tinacloud-login';
import { mediaManagerPlugin } from '../media-manager/media-manager.plugin';
import { TINACLOUD_ASSETS_URL, TINACLOUD_IDENTITY_URL } from './client';
import { tinaCloud } from './tinacloud.plugin';

const stubTinaCloud = (
  project: Record<string, unknown> = {
    defaultBranch: 'main',
    mediaBranch: 'main',
  }
) => {
  const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
    if (url.endsWith('/currentUser')) return Response.json(tinaCloudUser);
    if (url.startsWith(TINACLOUD_IDENTITY_URL)) return Response.json(project);
    return Response.json({ files: [], directories: [] });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const boot = async () => {
  const store = createTinaStore(
    await resolveClientSegments([
      tinaCloud({ clientId: 'abc' }),
      mediaManagerPlugin(),
    ])
  );
  const runtime = { store } as unknown as TinaRuntime;
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TinaRuntimeContext value={runtime}>{children}</TinaRuntimeContext>
  );
  const { result } = renderHook(
    () => ({ media: useMediaSlice(), auth: useAuthSlice() }),
    { wrapper }
  );
  return { store, result };
};

const bootSignedIn = async () => {
  const booted = await boot();
  const { complete } = stubLoginPopup();
  const login = booted.result.current.auth?.login();
  complete();
  await act(() => login);
  return { store: booted.store, media: booted.result.current.media };
};

const listUrls = (fetchMock: ReturnType<typeof stubTinaCloud>) =>
  fetchMock.mock.calls
    .map(([url]) => url)
    .filter((url) => url.startsWith(TINACLOUD_ASSETS_URL));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('tinaCloud()', () => {
  it('provides media and auth, with a server segment', () => {
    const plugin = tinaCloud({ clientId: 'abc' });
    expect(plugin.provides).toEqual(['media', 'auth']);
    expect(plugin.server).toBeTypeOf('function');
  });

  it('mounts a media slice and a signed-out auth slice', async () => {
    const { result } = await boot();
    expect(Object.keys(result.current.media).sort()).toEqual([
      'delete',
      'features',
      'list',
      'rename',
      'resolveUrl',
      'upload',
    ]);
    expect(result.current.media.features).toEqual({
      search: true,
      extensionFilter: true,
      maxSize: 100 * 1024 * 1024,
    });
    expect(result.current.auth).toMatchObject({
      status: 'signed-out',
      user: null,
    });
  });

  it('fails media requests as unauthorized before sign-in', async () => {
    const fetchMock = stubTinaCloud();
    const { result } = await boot();
    const failure = await result.current.media
      .list('')
      .catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(MediaError);
    expect(failure).toMatchObject({ code: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the auth slice's token on media requests after sign-in", async () => {
    const fetchMock = stubTinaCloud();
    const { media } = await bootSignedIn();
    await media.list('');
    const [, init] = fetchMock.mock.calls.at(-1) ?? [];
    expect(new Headers(init?.headers).get('Authorization')).toBe(
      'Bearer id-token'
    );
  });

  it("uses the project's default branch when the store has no branch", async () => {
    const fetchMock = stubTinaCloud();
    const { media } = await bootSignedIn();
    await media.list('');
    expect(listUrls(fetchMock)).toEqual([
      `${TINACLOUD_ASSETS_URL}/v2/abc/list/?limit=20&branch=main`,
    ]);
    expect(media.resolveUrl('hero.png')).toBe(
      'https://assets.tina.io/abc/hero.png'
    );
  });

  it('reads the branch from store.branch.name at call time', async () => {
    const fetchMock = stubTinaCloud();
    const { store, media } = await bootSignedIn();
    store.setState({ branch: { name: 'feat/x' } });
    await media.list('');
    expect(listUrls(fetchMock)).toEqual([
      `${TINACLOUD_ASSETS_URL}/v2/abc/list/?limit=20&branch=feat%2Fx`,
    ]);
    expect(media.resolveUrl('hero.png')).toBe(
      'https://assets.tina.io/abc/__staging/feat/x/__file/hero.png'
    );
  });

  it('serves the default branch from staging when it is not the media branch', async () => {
    stubTinaCloud({ defaultBranch: 'main', mediaBranch: 'tina-media' });
    const { media } = await bootSignedIn();
    await media.list('');
    expect(media.resolveUrl('hero.png')).toBe(
      'https://assets.tina.io/abc/__staging/main/__file/hero.png'
    );
  });

  it('gates the admin until the editor signs in to TinaCloud', async () => {
    stubTinaCloud();
    const user = userEvent.setup();
    const { complete } = stubLoginPopup();
    const contentPlugin = definePlugin({
      name: 'test:content',
      provides: ['content'],
      client: async () => ({
        default: {
          slice: () => ({
            list: async () => [],
            get: async () => null,
            update: async () => {
              throw new Error('read-only');
            },
          }),
        },
      }),
    });
    render(
      <TinaAdmin
        config={asResolvedConfig({
          plugins: [contentPlugin, tinaCloud({ clientId: 'abc' })],
          schema: {
            collections: [
              {
                name: 'post',
                label: 'Posts',
                path: 'content/posts',
                format: 'mdx',
                fields: [],
              },
            ],
          },
        })}
        queryClient={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      />
    );

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    act(() => complete());
    expect(
      await screen.findByRole('list', { name: 'Account' })
    ).toHaveTextContent('Ada Lovelace');
    expect(screen.getByRole('list', { name: 'Collections' })).toBeVisible();
  });
});

describe('tinaCloud() on the server', () => {
  const editorialPlugin = definePlugin({
    name: 'editorial',
    server: async () => ({
      default: defineServerPlugin({ publish: async () => 'queued' }),
    }),
  });

  const handler = createRpcHandler({
    plugins: [tinaCloud({ clientId: 'abc' }), editorialPlugin],
  });

  const post = (path: string, token?: string) =>
    handler(
      new Request(`http://tina.local/api/tina${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      })
    );

  it('authenticates RPC requests through TinaCloud', async () => {
    stubTinaCloud();
    expect((await post('/editorial/publish')).status).toBe(401);
    const response = await post('/editorial/publish', 'id-token');
    expect(response.status).toBe(200);
    expect(await response.json()).toBe('queued');
  });

  it('does not route getSession as an operation', async () => {
    stubTinaCloud();
    expect((await post('/auth/getSession', 'id-token')).status).toBe(404);
    expect((await post('/media/getSession', 'id-token')).status).toBe(404);
  });
});
