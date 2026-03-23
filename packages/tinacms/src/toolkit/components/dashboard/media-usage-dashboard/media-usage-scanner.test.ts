import { describe, expect, it, vi } from 'vitest';
import type { TinaCMS } from '@tinacms/toolkit';
import { scanAllMedia } from './media-usage-scanner';

// Creates a minimal stub media item for cms.media.list
const makeStubMediaItem = (
  id: string,
  filename: string,
  src: string,
  type: 'file' | 'dir' = 'file'
) => ({ id, filename, src, type });

// Creates a paginated media list response
const makeStubMediaList = (
  items: ReturnType<typeof makeStubMediaItem>[],
  nextOffset?: string
) => ({ items, nextOffset });

// Creates a minimal GraphQL document node for the collection connection response.
// sysOverrides added so tests can verify that those fields are correctly forwarded to custom router functions.
const makeStubDocumentEdge = (
  collectionName: string,
  values: Record<string, unknown> = {},
  breadcrumbs: string[] = [],
  sysOverrides: Record<string, unknown> = {}
) => ({
  node: {
    _sys: {
      breadcrumbs,
      collection: { name: collectionName },
      ...sysOverrides,
    },
    _values: values,
  },
});

// Creates a paginated GraphQL collection connection response
const makeStubCollectionResponse = (
  edges: ReturnType<typeof makeStubDocumentEdge>[],
  hasNextPage = false,
  endCursor = 'cursor-end'
) => ({
  collectionConnection: {
    pageInfo: { hasNextPage, endCursor },
    edges,
  },
});

const buildStubCms = ({
  mediaItems = [],
  collectionNames = [],
  documentsByCollection = {},
  customRouter,
  tinaPreview,
  tinaBasePath,
}: {
  mediaItems?: ReturnType<typeof makeStubMediaItem>[];
  collectionNames?: string[];
  documentsByCollection?: Record<
    string,
    ReturnType<typeof makeStubDocumentEdge>[]
  >;
  customRouter?: (args: {
    document: {
      _sys: {
        breadcrumbs: string[];
        relativePath?: string;
        filename?: string;
        basename?: string;
        path?: string;
        extension?: string;
        template?: string;
        title?: string;
        hasReferences?: boolean;
      };
    };
    collection: unknown;
  }) => Promise<string | undefined>;
  tinaPreview?: string;
  tinaBasePath?: string;
} = {}) => {
  return {
    media: {
      list: vi.fn().mockResolvedValue(makeStubMediaList(mediaItems)),
    },
    api: {
      tina: {
        request: vi.fn().mockImplementation((query: string) => {
          const matchedCollection = collectionNames.find((name) =>
            query.includes(`${name}Connection`)
          );
          if (matchedCollection) {
            const edges = documentsByCollection[matchedCollection] ?? [];
            return Promise.resolve(makeStubCollectionResponse(edges));
          }
          return Promise.resolve(makeStubCollectionResponse([]));
        }),
        schema: {
          getCollections: vi
            .fn()
            .mockReturnValue(
              collectionNames.map((name) => ({ name, label: name }))
            ),
          getCollection: vi.fn().mockImplementation((name: string) => ({
            name,
            ui: customRouter ? { router: customRouter } : undefined,
          })),
        },
      },
    },
    flags: {
      get: vi.fn().mockImplementation((flag: string) => {
        if (flag === 'tina-preview') return tinaPreview;
        if (flag === 'tina-basepath') return tinaBasePath;
        return undefined;
      }),
    },
  } as unknown as TinaCMS;
};

describe('scanAllMedia', () => {
  describe('Basic Matching', () => {
    it('returns empty array when there are no media items', async () => {
      // Arrange: Empty media list and no collections
      const cms = buildStubCms({ mediaItems: [], collectionNames: [] });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Empty array
      expect(result).toEqual([]);
    });

    it('returns media with count 0 when it is not referenced in any document', async () => {
      // Arrange: Media item not referenced in any document
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [makeStubDocumentEdge('posts', {})],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with count 0 and no usedIn entries
      expect(result).toHaveLength(1);
      expect(result[0].media).toEqual(mediaItem);
      expect(result[0].usedIn).toHaveLength(0);
    });

    it('returns count 1 and usedIn entry when media is referenced in one document', async () => {
      // Arrange: Media item referenced in one document
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [makeStubDocumentEdge('posts', { ref: mediaItem.src })],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with count 1 and one usedIn entry
      expect(result[0].usedIn).toHaveLength(1);
    });

    it('returns count 2 when media is referenced in two separate documents', async () => {
      // Arrange: Media item referenced in two separate documents
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', { ref: mediaItem.src }),
            makeStubDocumentEdge('posts', { ref: mediaItem.src }),
          ],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with two usedIn entries
      expect(result[0].usedIn).toHaveLength(2);
    });

    it('counts as 1 when media appears multiple times in the same document', async () => {
      // Arrange: Media item referenced multiple times in the same document
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', {
              ref1: mediaItem.src,
              ref2: mediaItem.src,
            }),
          ],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with count 1 and one usedIn entry
      expect(result[0].usedIn).toHaveLength(1);
      expect(result[0].usedIn[0].collectionName).toBe('posts');
    });
  });

  describe('False Positive Prevention', () => {
    it('does not match when the media src is a substring of a longer path with extra characters before', async () => {
      // Arrange: Media item src is a substring of a longer path
      const mediaItem = makeStubMediaItem('img1', 'img1.png', 'img1.png');
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', {
              image: '/uploads/big-img1.png',
            }),
          ],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with count 0 and no usedIn entries
      expect(result[0].usedIn).toHaveLength(0);
    });

    it('does not match when the media src is a substring of a longer path with extra characters after', async () => {
      // Arrange: Media item src is a substring of a longer path
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', {
              image: '/uploads/img1.png2',
            }),
          ],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with count 0 and no usedIn entries
      expect(result[0].usedIn).toHaveLength(0);
    });
  });

  describe('Special Characters in Filenames', () => {
    it('matches media whose src contains characters that JSON.stringify escapes (e.g. quotes)', async () => {
      // Arrange: filename with a double-quote — JSON.stringify will escape it to \"
      const mediaItem = makeStubMediaItem(
        'weird',
        'say"cheese.png',
        '/uploads/say"cheese.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', {
              image: mediaItem.src,
            }),
          ],
        },
      });

      const result = await scanAllMedia(cms);

      expect(result[0].usedIn).toHaveLength(1);
    });

    it('matches media whose src contains a backslash', async () => {
      // Arrange: filename with a backslash — JSON.stringify escapes \ to \\
      const mediaItem = makeStubMediaItem(
        'bs',
        'back\\slash.png',
        '/uploads/back\\slash.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', {
              image: mediaItem.src,
            }),
          ],
        },
      });

      const result = await scanAllMedia(cms);

      expect(result[0].usedIn).toHaveLength(1);
    });
  });

  describe('Multiple Media Items', () => {
    it('correctly tracks multiple media items referenced in the same document', async () => {
      // Arrange: Multiple media items referenced in the same document
      const mediaItem1 = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const mediaItem2 = makeStubMediaItem(
        'img2',
        'img2.png',
        '/uploads/img2.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem1, mediaItem2],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', {
              ref1: mediaItem1.src,
              ref2: mediaItem2.src,
            }),
          ],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media items with count 1 and one usedIn entry each
      const usage1 = result.find((r) => r.media.id === 'img1')!;
      const usage2 = result.find((r) => r.media.id === 'img2')!;
      expect(usage1.usedIn).toHaveLength(1);
      expect(usage2.usedIn).toHaveLength(1);
    });
  });

  describe('Edit URL Resolution', () => {
    it.each([
      {
        label: 'when no custom router is defined',
        customRouter: undefined,
      },
      {
        label: 'when a custom router is defined but tina-preview is not set',
        customRouter: async () => '/my-custom-route',
      },
    ])('uses the default edit URL $label', async ({ customRouter }) => {
      // Arrange: Media item with default edit URL fallback
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', { ref: mediaItem.src }, ['hello']),
          ],
        },
        customRouter,
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with default edit URL
      expect(result[0].usedIn[0].editUrl).toBe(
        '#/collections/edit/posts/~/hello'
      );
    });

    it.each(['/posts/hello', 'posts/hello'])(
      'builds the same preview URL when custom router returns %s',
      async (route) => {
        // Arrange: Media item with custom router
        const mediaItem = makeStubMediaItem(
          'img1',
          'img1.png',
          '/uploads/img1.png'
        );
        const cms = buildStubCms({
          mediaItems: [mediaItem],
          collectionNames: ['posts'],
          documentsByCollection: {
            posts: [
              makeStubDocumentEdge('posts', { ref: mediaItem.src }, ['hello']),
            ],
          },
          customRouter: async () => route,
          tinaPreview: 'true',
        });

        // Act: Scan all media
        const result = await scanAllMedia(cms);

        // Assert: Media item with normalized custom router path
        expect(result[0].usedIn[0].editUrl).toBe('#/~/posts/hello');
      }
    );

    it('includes tina-basepath in preview URL when both flags are set', async () => {
      // Arrange: Media item with custom router
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', { ref: mediaItem.src }, ['hello']),
          ],
        },
        customRouter: async ({ document }) =>
          `/posts/${document._sys.breadcrumbs.join('/')}`,
        tinaPreview: 'true',
        tinaBasePath: 'base',
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item with custom router
      expect(result[0].usedIn[0].editUrl).toBe('#/~/base/posts/hello');
    });

    it('supports custom routes built from any _sys field (e.g. relativePath and template)', async () => {
      // Arrange: Media item referenced in a document that has relativePath and template populated
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
        documentsByCollection: {
          posts: [
            makeStubDocumentEdge('posts', { ref: mediaItem.src }, ['hello'], {
              relativePath: 'hello.md',
              template: 'post',
              filename: 'hello',
            }),
          ],
        },
        // Router uses fields other than breadcrumbs to prove all _sys fields are forwarded
        customRouter: async ({ document }) =>
          `/blog/${document._sys.template}/${document._sys.filename}`,
        tinaPreview: 'true',
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: URL is built from template + filename, proving those _sys fields reached the router
      expect(result[0].usedIn[0].editUrl).toBe('#/~/blog/post/hello');
    });

    it('falls back to the default edit URL when the custom router throws', async () => {
      // Arrange: Media item with custom router
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      try {
        const cms = buildStubCms({
          mediaItems: [mediaItem],
          collectionNames: ['posts'],
          documentsByCollection: {
            posts: [
              makeStubDocumentEdge('posts', { ref: mediaItem.src }, ['hello']),
            ],
          },
          customRouter: async () => {
            throw new Error('router error');
          },
          tinaPreview: 'true',
        });

        // Act: Scan all media
        const result = await scanAllMedia(cms);

        // Assert: Media item with custom router
        expect(result[0].usedIn[0].editUrl).toBe(
          '#/collections/edit/posts/~/hello'
        );

        // Assert: Console error was called
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Unable to determine custom edit URL for document. Falling back to default edit URL.',
          expect.any(Error)
        );
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('Pagination', () => {
    it('collects media items across multiple pages', async () => {
      // Arrange: Media items across multiple pages
      const cms = buildStubCms({ collectionNames: [] });
      cms.media.list = vi
        .fn()
        .mockResolvedValueOnce(
          makeStubMediaList(
            [makeStubMediaItem('img1', 'img1.png', '/uploads/img1.png')],
            'offset-page-2'
          )
        )
        .mockResolvedValueOnce(
          makeStubMediaList([
            makeStubMediaItem('img2', 'img2.png', '/uploads/img2.png'),
          ])
        );

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media items across multiple pages
      expect(result).toHaveLength(2);
    });

    it('scans documents across multiple pages of a collection', async () => {
      // Arrange: Media item
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem],
        collectionNames: ['posts'],
      });

      // Arrange: Media item across multiple pages
      const page1 = makeStubCollectionResponse(
        [makeStubDocumentEdge('posts', { ref: mediaItem.src })],
        true,
        'cursor-1'
      );
      const page2 = makeStubCollectionResponse(
        [makeStubDocumentEdge('posts', { ref: mediaItem.src })],
        false,
        'cursor-2'
      );
      // Arrange: Mock the request to return the paginated responses
      cms.api.tina.request = vi
        .fn()
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item across multiple pages
      expect(result[0].usedIn).toHaveLength(2);
    });
  });

  describe('Subdirectory Traversal', () => {
    it('strips leading slashes from directory items before recursing', async () => {
      // Arrange: Mock nested directory traversal where the second-level
      // directory item includes a leading slash from the media store.
      const cms = buildStubCms({ collectionNames: [] });
      cms.media.list = vi
        .fn()
        .mockImplementation(({ directory }: { directory: string }) => {
          if (directory === '') {
            return Promise.resolve(
              makeStubMediaList([
                makeStubMediaItem(
                  'proidentLoremsunt',
                  'proidentLoremsunt',
                  '',
                  'dir'
                ),
              ])
            );
          }
          if (directory === 'proidentLoremsunt') {
            return Promise.resolve(
              makeStubMediaList([
                makeStubMediaItem(
                  '/consequatexdolore',
                  '/consequatexdolore',
                  '',
                  'dir'
                ),
              ])
            );
          }
          if (directory === 'proidentLoremsunt/consequatexdolore') {
            return Promise.resolve(
              makeStubMediaList([
                makeStubMediaItem(
                  'flower',
                  'flower.jpg',
                  '/uploads/proidentLoremsunt/consequatexdolore/flower.jpg'
                ),
              ])
            );
          }
          return Promise.resolve(makeStubMediaList([]));
        });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: The nested media item is collected successfully
      expect(result).toHaveLength(1);
      expect(result[0].media.id).toBe('flower');
      // Assert: Recursive traversal strips the extra slash before joining
      expect(cms.media.list).toHaveBeenCalledWith(
        expect.objectContaining({
          directory: 'proidentLoremsunt/consequatexdolore',
        })
      );
    });

    it('builds the correct path for media nested two levels deep', async () => {
      // Arrange: Mock the media list to return a directory item
      const cms = buildStubCms({ collectionNames: [] });
      cms.media.list = vi
        .fn()
        .mockImplementation(({ directory }: { directory: string }) => {
          if (directory === '') {
            return Promise.resolve(
              makeStubMediaList([
                makeStubMediaItem('uploads', 'uploads', '', 'dir'),
              ])
            );
          }
          if (directory === 'uploads') {
            return Promise.resolve(
              makeStubMediaList([
                makeStubMediaItem('images', 'images', '', 'dir'),
              ])
            );
          }
          if (directory === 'uploads/images') {
            return Promise.resolve(
              makeStubMediaList([
                makeStubMediaItem(
                  'img1',
                  'img1.png',
                  '/uploads/images/img1.png'
                ),
              ])
            );
          }
          return Promise.resolve(makeStubMediaList([]));
        });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item in subdirectory
      expect(result).toHaveLength(1);
      expect(result[0].media.id).toBe('img1');
      // Assert: media.list was called with the correctly joined path
      expect(cms.media.list).toHaveBeenCalledWith(
        expect.objectContaining({ directory: 'uploads/images' })
      );
    });
  });

  describe('Error Handling', () => {
    it('throws and propagates the error when the GraphQL request fails', async () => {
      // Arrange: Spy on console.error
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Arrange: Media item
      const mediaItem = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );

      try {
        // Arrange: Build stub CMS with media item and collection
        const cms = buildStubCms({
          mediaItems: [mediaItem],
          collectionNames: ['posts'],
        });

        // Arrange: Mock the request to throw an error
        cms.api.tina.request = vi
          .fn()
          .mockRejectedValue(new Error('GraphQL network error'));

        // Act: Scan all media
        await expect(scanAllMedia(cms)).rejects.toThrow(
          'GraphQL network error'
        );
      } finally {
        // Assert: Console error was called with the collection processing error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error processing collection posts:',
          expect.any(Error)
        );
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe('Multiple Collections', () => {
    it('scans media usage across multiple collections independently', async () => {
      // Arrange: Media items
      const mediaItem1 = makeStubMediaItem(
        'img1',
        'img1.png',
        '/uploads/img1.png'
      );
      const mediaItem2 = makeStubMediaItem(
        'img2',
        'img2.png',
        '/uploads/img2.png'
      );
      const cms = buildStubCms({
        mediaItems: [mediaItem1, mediaItem2],
        collectionNames: ['posts', 'pages'],
        documentsByCollection: {
          posts: [makeStubDocumentEdge('posts', { ref: mediaItem1.src })],
          pages: [makeStubDocumentEdge('pages', { ref: mediaItem2.src })],
        },
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item in collection
      const usage1 = result.find((r) => r.media.id === 'img1')!;
      const usage2 = result.find((r) => r.media.id === 'img2')!;

      expect(usage1.usedIn).toHaveLength(1);
      expect(usage1.usedIn[0].collectionName).toBe('posts');

      expect(usage2.usedIn).toHaveLength(1);
      expect(usage2.usedIn[0].collectionName).toBe('pages');
    });
  });

  describe('Media Type Classification', () => {
    it.each(['gif', 'jpg', 'jpeg', 'tiff', 'png', 'svg', 'webp', 'avif'])(
      'classifies .%s files as image',
      async (extension) => {
        // Arrange: Media item
        const cms = buildStubCms({
          mediaItems: [
            makeStubMediaItem(
              extension,
              `asset.${extension}`,
              `/uploads/asset.${extension}`
            ),
          ],
          collectionNames: [],
        });

        // Act: Scan all media
        const result = await scanAllMedia(cms);

        // Assert: Media item type
        expect(result[0].type).toBe('image');
      }
    );

    it.each(['mp4', 'webm', 'ogg', 'm4v', 'mov', 'avi', 'flv', 'mkv'])(
      'classifies .%s files as video',
      async (extension) => {
        // Arrange: Media item
        const cms = buildStubCms({
          mediaItems: [
            makeStubMediaItem(
              extension,
              `asset.${extension}`,
              `/uploads/asset.${extension}`
            ),
          ],
          collectionNames: [],
        });

        // Act: Scan all media
        const result = await scanAllMedia(cms);

        // Assert: Media item type
        expect(result[0].type).toBe('video');
      }
    );

    it('classifies non-image non-video files as other', async () => {
      // Arrange: Media item
      const cms = buildStubCms({
        mediaItems: [
          makeStubMediaItem('pdf', 'document.pdf', '/uploads/document.pdf'),
        ],
        collectionNames: [],
      });

      // Act: Scan all media
      const result = await scanAllMedia(cms);

      // Assert: Media item type
      expect(result[0].type).toBe('other');
    });
  });
});
