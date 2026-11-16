import { describe, expectTypeOf, it } from 'vitest';
import type {
  MediaProvider as ClientMediaProvider,
  MediaUploadOptions as ClientUploadOptions,
} from '../../client';
import type { MediaProvider, MediaUploadOptions } from '../../index';

describe('the upload contract', () => {
  it('takes optional progress and cancel, and still resolves to the media path', () => {
    expectTypeOf<MediaProvider['upload']>()
      .parameter(2)
      .toEqualTypeOf<MediaUploadOptions | undefined>();
    expectTypeOf<MediaUploadOptions>().toEqualTypeOf<{
      onProgress?: (fraction: number) => void;
      signal?: AbortSignal;
    }>();
    expectTypeOf<MediaProvider['upload']>().returns.resolves.toBeString();
    expectTypeOf<ClientUploadOptions>().toEqualTypeOf<MediaUploadOptions>();
    expectTypeOf<ClientMediaProvider>().toEqualTypeOf<MediaProvider>();
  });

  it('accepts a provider written against the two-parameter upload', () => {
    const older = {
      upload: async (file: File, folder?: string) =>
        folder ? `${folder}/${file.name}` : file.name,
      list: async () => ({ items: [] }),
      delete: async () => {},
      resolveUrl: (path: string) => `/uploads/${path}`,
    };
    expectTypeOf(older).toMatchTypeOf<MediaProvider>();
  });
});
