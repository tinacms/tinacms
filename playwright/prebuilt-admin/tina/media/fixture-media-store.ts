import type {
  Media,
  MediaList,
  MediaListOptions,
  MediaStore,
  MediaUploadOptions,
} from 'tinacms';

// PREBUILT_FIXTURE_MEDIA_STORE — a real custom media store loaded through
// `media.loadCustomStore`'s dynamic `import()`. esbuild has to code-split this
// into its own chunk in the production bundle; the setup meta-assertion greps
// for that chunk to prove the fixture isn't accidentally tame.
export class FixtureMediaStore implements MediaStore {
  accept = '*';
  isStatic = true;

  async persist(_files: MediaUploadOptions[]): Promise<Media[]> {
    return [];
  }

  async delete(_media: Media): Promise<void> {
    // read-only fixture store
  }

  async list(_options?: MediaListOptions): Promise<MediaList> {
    return {
      items: [
        {
          type: 'file',
          id: 'prebuilt-fixture-media',
          filename: 'prebuilt-fixture-media.png',
          directory: '',
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
      ],
    };
  }

  parse(media: Media): string {
    return media.src ?? '';
  }
}
