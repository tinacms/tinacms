import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  defineHook,
  defineHooksPlugin,
  defineServerHook,
} from '../../../core/form/hooks';
import { definePlugin } from '../../../core/plugin';
import { createRpcHandler } from '../../../rpc/handler';
import { defineServerPlugin, toUserId } from '../../../server';
import {
  tinaCloudIdentity,
  tinaCloudUser,
} from '../../../test/tinacloud-login';
import { TINACLOUD_IDENTITY_URL } from '../client';
import { tinaCloud } from '../tinacloud.plugin';
import { contentUrl } from './request';

const shout = defineHook('shout', {
  server: async () => ({
    default: defineServerHook(() => ({
      beforeSave: (document, { session }) => ({
        ...document,
        title: String(document.title).toUpperCase(),
        savedBy: session?.identity.id ?? null,
      }),
    })),
  }),
});

const handler = createRpcHandler({
  plugins: [
    tinaCloud({ clientId: 'abc' }),
    defineHooksPlugin('test:hooks', [shout]),
  ],
  schema: {
    collections: [
      { name: 'post', format: 'mdx', fields: [], hooks: [shout()] },
    ],
  },
});

const stubTinaCloud = () => {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === `${TINACLOUD_IDENTITY_URL}/v2/apps/abc`) {
      return Response.json({ role: 'editor', defaultBranch: 'main' });
    }
    if (url.startsWith(TINACLOUD_IDENTITY_URL)) return tinaCloudIdentity(url);
    const { variables } = JSON.parse(String(init?.body));
    return Response.json({
      data: {
        updateDocument: {
          _sys: { path: variables.path },
          _values: variables.params,
        },
      },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const saveRequest = (value: Record<string, unknown>) =>
  new Request('http://tina.local/api/tina/content/update', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer id-token',
    },
    body: JSON.stringify({
      collection: 'post',
      path: 'content/posts/a.mdx',
      value,
    }),
  });

afterEach(() => vi.unstubAllGlobals());

describe('tinaCloud() content/update on the site server', () => {
  it('verifies the session, runs the server hook, then writes the result with the editor token', async () => {
    const fetchMock = stubTinaCloud();
    const response = await handler(saveRequest({ title: 'hi' }));

    expect(response.status).toBe(200);
    const write = fetchMock.mock.calls.find(
      ([url]) => url === contentUrl('abc', 'main')
    );
    expect(JSON.parse(String(write?.[1]?.body)).variables.params).toEqual({
      title: 'HI',
      savedBy: tinaCloudUser.id,
    });
    expect(new Headers(write?.[1]?.headers).get('Authorization')).toBe(
      'Bearer id-token'
    );
    expect(await response.json()).toEqual({
      entry: {
        path: 'content/posts/a.mdx',
        document: { title: 'HI', savedBy: tinaCloudUser.id },
      },
      hookWarnings: [],
    });
  });

  it('hands the hook the default branch when the save names none', async () => {
    stubTinaCloud();
    const seen = vi.fn();
    const probe = defineHook('branchProbe', {
      server: async () => ({
        default: defineServerHook(() => ({
          beforeSave: (document, { branch }) => {
            seen(branch);
            return document;
          },
        })),
      }),
    });
    const probing = createRpcHandler({
      plugins: [
        tinaCloud({ clientId: 'abc' }),
        defineHooksPlugin('test:branch', [probe]),
      ],
      schema: {
        collections: [
          { name: 'post', format: 'mdx', fields: [], hooks: [probe()] },
        ],
      },
    });
    const response = await probing(saveRequest({ title: 'hi' }));
    expect(response.status).toBe(200);
    expect(seen).toHaveBeenCalledWith('main');
  });

  it('needs tinaCloud() as the auth provider for its content write', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const fetchMock = stubTinaCloud();
    const otherAuth = createRpcHandler({
      plugins: [
        tinaCloud({ clientId: 'abc' }),
        definePlugin({
          name: 'test:auth',
          provides: ['auth'],
          overrides: [{ capability: 'auth' }],
          server: async () => ({
            default: defineServerPlugin({
              getSession: async () => ({
                identity: { id: toUserId('ada') },
                roles: ['admin'],
              }),
            }),
          }),
        }),
      ],
      schema: { collections: [{ name: 'post', format: 'mdx', fields: [] }] },
    });
    const response = await otherAuth(
      new Request('http://tina.local/api/tina/content/update', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer other-token',
        },
        body: JSON.stringify({
          collection: 'post',
          path: 'content/posts/a.mdx',
          value: {},
        }),
      })
    );
    expect(response.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(String(consoleError.mock.calls[0]?.[1])).toMatch(
      /needs tinaCloud\(\) as the auth provider/
    );
    consoleError.mockRestore();
  });
});
