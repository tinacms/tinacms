import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaError, type MediaSlice } from '../../../core/media/contract';
import type { TinaStoreState } from '../../../core/plugin';
import { stubXhr } from '../../../test/fake-xhr';
import { TINACLOUD_ASSETS_URL, TINACLOUD_IDENTITY_URL } from '../client';
import { createTinaCloudMediaSlice } from './tinacloud-media.client';

const png = new File(['x'], 'hero.png', { type: 'image/png' });

const boot = (current?: string) => {
  let state: TinaStoreState = { branch: { current } };
  let answerProject: ((response: Response) => void) | undefined;
  const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
    if (url.startsWith(TINACLOUD_IDENTITY_URL)) {
      return new Promise<Response>((resolve) => {
        answerProject = resolve;
      });
    }
    return Response.json({ signedUrl: 'https://s3.test/signed' });
  });
  vi.stubGlobal('fetch', fetchMock);
  stubXhr((xhr) => queueMicrotask(() => xhr.respond(200)));
  const slice = createTinaCloudMediaSlice({
    clientId: 'abc',
    getToken: () => 'secret',
  })(
    () => {},
    () => state
  );
  const uploadUrlRequest = () =>
    fetchMock.mock.calls
      .map(([url]) => url)
      .find((url) => url.startsWith(TINACLOUD_ASSETS_URL));
  return {
    slice: slice as unknown as MediaSlice,
    switchTo: (next: string) => {
      state = { branch: { current: next } };
    },
    projectLookupIsPending: () =>
      vi.waitFor(() => expect(answerProject).toBeDefined()),
    answerProject: () =>
      answerProject?.(
        Response.json({ defaultBranch: 'main', mediaBranch: 'main' })
      ),
    uploadUrlRequest,
  };
};

afterEach(() => vi.unstubAllGlobals());

describe('TinaCloud media slice upload', () => {
  it('uploads to the branch that was live at the call, not one set during the project lookup', async () => {
    const harness = boot('feat/a');
    const done = harness.slice.upload(png);
    await harness.projectLookupIsPending();
    harness.switchTo('feat/b');
    harness.answerProject();
    expect(await done).toBe('hero.png');
    expect(harness.uploadUrlRequest()).toBe(
      `${TINACLOUD_ASSETS_URL}/v1/abc/upload_url/hero.png?branch=feat%2Fa`
    );
  });

  it('uploads to the default branch with no branch in the store', async () => {
    const harness = boot();
    const done = harness.slice.upload(png);
    await harness.projectLookupIsPending();
    harness.answerProject();
    expect(await done).toBe('hero.png');
    expect(harness.uploadUrlRequest()).toBe(
      `${TINACLOUD_ASSETS_URL}/v1/abc/upload_url/hero.png?branch=main`
    );
  });

  it('keeps the default branch when a branch is set during the project lookup', async () => {
    const harness = boot();
    const done = harness.slice.upload(png);
    await harness.projectLookupIsPending();
    harness.switchTo('feat/b');
    harness.answerProject();
    expect(await done).toBe('hero.png');
    expect(harness.uploadUrlRequest()).toBe(
      `${TINACLOUD_ASSETS_URL}/v1/abc/upload_url/hero.png?branch=main`
    );
  });

  describe('when the project lookup fails', () => {
    const bootWithLookup = (lookup: () => Promise<Response>) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          if (url.startsWith(TINACLOUD_IDENTITY_URL)) return lookup();
          return Response.json({ items: [] });
        })
      );
      return createTinaCloudMediaSlice({
        clientId: 'abc',
        getToken: () => 'secret',
      })(
        () => {},
        () => ({ branch: {} })
      ) as unknown as MediaSlice;
    };
    const noAnswer = () => Promise.reject(new TypeError('Failed to fetch'));

    it('rejects an upload whose project lookup got no answer with an error that is no MediaError', async () => {
      const failure = await bootWithLookup(noAnswer)
        .upload(png)
        .catch((cause: unknown) => cause);
      expect(failure).toBeInstanceOf(Error);
      expect(failure).not.toBeInstanceOf(MediaError);
    });

    it.each([
      [401, 'unauthorized'],
      [404, 'not-found'],
      [500, 'backend-failure'],
    ])(
      'keeps the code of a project lookup that TinaCloud answers with %i for an upload',
      async (status, code) => {
        const slice = bootWithLookup(async () => new Response('', { status }));
        await expect(slice.upload(png)).rejects.toMatchObject({
          name: 'MediaError',
          code,
        });
      }
    );

    it('still maps a lookup with no answer to backend-failure for list and delete', async () => {
      const slice = bootWithLookup(noAnswer);
      await expect(slice.list('')).rejects.toMatchObject({
        name: 'MediaError',
        code: 'backend-failure',
      });
      await expect(slice.delete('hero.png')).rejects.toMatchObject({
        name: 'MediaError',
        code: 'backend-failure',
      });
    });
  });
});
