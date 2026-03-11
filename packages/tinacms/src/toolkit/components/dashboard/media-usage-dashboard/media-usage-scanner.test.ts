import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scanAllMedia } from './media-usage-scanner';

describe('Media Usage Dashboard Logic', () => {
  let mockList: any; // Mock media.list function
  let mockRequest: any; // Mock CMS API request function
  let mockCms: any; // Mock CMS object to pass into the scanner

  const createMediaFile = (
    media: { id: string; src: string; filename?: string } & Record<string, any>
  ) => ({
    type: 'file',
    filename: media.filename || media.src.split('/').pop() || media.id,
    ...media,
  });

  const createDocumentValues = (
    overrides: Record<string, any> = {}
  ): Record<string, any> => ({
    _collection: 'post',
    _template: 'post',
    title: 'This is a title',
    topic: ['programming', 'blacksmithing'],
    body: {
      type: 'root',
      children: [
        {
          type: 'p',
          children: [{ type: 'text', text: 'This is a test' }],
        },
      ],
    },
    ...overrides,
  });

  const createDocumentNode = (
    values: Record<string, any>,
    sysOverrides: Record<string, any> = {}
  ) => ({
    _sys: {
      relativePath: 'test.md',
      breadcrumbs: ['test'],
      title: 'Test Document',
      collection: { name: 'post', label: 'Posts' },
      ...sysOverrides,
    },
    _values: createDocumentValues(values),
  });

  const mockCollections = (
    collections = [{ name: 'post', label: 'Posts' }]
  ) => {
    mockRequest.mockImplementation(async (query: string) => {
      if (query.includes('collections { name label }')) {
        return { collections };
      }
      return {};
    });
  };

  const mockSinglePostConnection = (
    values: Record<string, any>,
    sysOverrides: Record<string, any> = {}
  ) => {
    mockRequest.mockImplementation(async (query: string) => {
      if (query.includes('collections { name label }')) {
        return { collections: [{ name: 'post', label: 'Posts' }] };
      }
      if (query.includes('postConnection')) {
        return {
          postConnection: {
            pageInfo: { hasNextPage: false },
            edges: [{ node: createDocumentNode(values, sysOverrides) }],
          },
        };
      }
      return {};
    });
  };

  const mockMediaListOnce = (
    mediaItems: ({ id: string; src: string; filename?: string } & Record<
      string,
      any
    >)[]
  ) => {
    mockList.mockResolvedValueOnce({
      items: mediaItems.map((m) => createMediaFile(m)),
      nextOffset: undefined,
    });
  };

  beforeEach(() => {
    mockList = vi.fn();
    mockRequest = vi.fn().mockResolvedValue({ collections: [] });

    mockCms = {
      media: { list: mockList },
      api: {
        tina: {
          request: mockRequest,
          schema: { getCollection: vi.fn().mockReturnValue({}) },
        },
      },
      flags: { get: vi.fn() },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Helper to set up the media scanner with a mocked media library and document values for testing content analysis.
   * @param mediaItems - Array of media items to be returned by the mocked media.list function
   * @param values - The _values object to be returned in the mocked document query, representing the content of a document that may reference media items
   * @param sysOverrides - Optional overrides for the _sys object in the mocked document query, allowing customization of relativePath, breadcrumbs, title, etc. for testing navigation and edit URL resolution
   */
  const setupScannerWithValues = async (
    mediaItems: { id: string; src: string; filename?: string }[],
    values: any,
    sysOverrides: any = {}
  ) => {
    mockMediaListOnce(mediaItems);
    mockSinglePostConnection(values, sysOverrides);
    return await scanAllMedia(mockCms);
  };

  describe('Media Library Discovery', () => {
    it('paginates over multiple media list offsets correctly', async () => {
      // Arrange: Simulate two pages of media items that require pagination
      mockList.mockResolvedValueOnce({
        items: [
          createMediaFile({
            id: 'f-1',
            src: '/img1.png',
            filename: 'img1.png',
          }),
        ],
        nextOffset: 'page-2',
      });
      mockList.mockResolvedValueOnce({
        items: [
          createMediaFile({
            id: 'f-2',
            src: '/img2.png',
            filename: 'img2.png',
          }),
        ],
        nextOffset: undefined,
      });
      mockCollections();

      // Act
      const result = await scanAllMedia(mockCms);

      // Assert: First call should be with no offset, second call should be with 'page-2'
      expect(mockList).toHaveBeenCalledTimes(2);
      expect(mockList).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ offset: 'page-2' })
      );
      expect(result).toHaveLength(2);
      expect(result.map((item) => item.media.id)).toEqual(['f-1', 'f-2']);
    });

    it('recursively crawls media from subdirectories', async () => {
      // Arrange: Simulate a media library with a root directory and one subdirectory
      mockList.mockImplementation(async (args: any) => {
        if (args.directory === '') {
          return {
            items: [
              {
                type: 'file',
                id: 'root-file',
                src: '/root.png',
                filename: 'root.png',
              },
              { type: 'dir', filename: 'subdir' },
            ],
            nextOffset: undefined,
          };
        }
        if (args.directory === 'subdir') {
          return {
            items: [
              {
                type: 'file',
                id: 'subdir-file',
                src: '/subdir.png',
                filename: 'subdir.png',
              },
            ],
            nextOffset: undefined,
          };
        }
        return { items: [], nextOffset: undefined };
      });
      mockCollections();

      // Act
      const result = await scanAllMedia(mockCms);

      // Assert: Should have called list for both root and subdir, and found both files
      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ directory: '' })
      );
      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ directory: 'subdir' })
      );
      expect(result).toHaveLength(2);
      expect(result.map((item) => item.media.id)).toEqual([
        'root-file',
        'subdir-file',
      ]);
    });

    it('builds nested subdirectory paths while recursing', async () => {
      // Arrange: Simulate nested directories so the joined directory path branch is exercised
      mockList.mockImplementation(async (args: any) => {
        if (args.directory === '') {
          return {
            items: [{ type: 'dir', filename: 'parent' }],
            nextOffset: undefined,
          };
        }
        if (args.directory === 'parent') {
          return {
            items: [{ type: 'dir', filename: 'child' }],
            nextOffset: undefined,
          };
        }
        if (args.directory === 'parent/child') {
          return {
            items: [
              {
                type: 'file',
                id: 'nested-file',
                src: '/nested.png',
                filename: 'nested.png',
              },
            ],
            nextOffset: undefined,
          };
        }
        return { items: [], nextOffset: undefined };
      });
      mockCollections();

      // Act
      const result = await scanAllMedia(mockCms);

      // Assert: Should recurse into the joined nested path and find the nested file
      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ directory: 'parent/child' })
      );
      expect(result).toHaveLength(1);
      expect(result[0].media.id).toBe('nested-file');
    });

    it('correctly categorizes files into images, videos, and generic types', async () => {
      // Arrange: Simulate a media library with various file types
      mockMediaListOnce([
        { id: 'img-1', src: '/1.jpg', filename: 'photo.jpg' },
        { id: 'vid-1', src: '/2.mp4', filename: 'movie.mp4' },
        { id: 'doc-1', src: '/3.pdf', filename: 'rules.pdf' },
        { id: 'unknown-1', src: '/4.unknown', filename: 'data.unknown' },
      ]);
      mockCollections();

      // Act
      const result = await scanAllMedia(mockCms);

      // Assert: Should categorize based on file extension
      expect(result.find((r) => r.media.id === 'img-1')?.type).toBe('image');
      expect(result.find((r) => r.media.id === 'vid-1')?.type).toBe('video');
      expect(result.find((r) => r.media.id === 'doc-1')?.type).toBe('other');
      expect(result.find((r) => r.media.id === 'unknown-1')?.type).toBe(
        'other'
      );
      expect(result.every((r) => r.count === 0)).toBe(true);
    });
  });

  describe('Content Analysis', () => {
    it('identifies media references in document objects', async () => {
      // Arrange and Act: Set up a media item and a document that references it in a simple field
      const result = await setupScannerWithValues(
        [{ id: 'id-1', src: '/media/image.png' }],
        { image: '/media/image.png' }
      );

      // Assert: Should find one reference to the media item
      expect(result.find((u) => u.media.id === 'id-1')?.count).toBe(1);
      expect(
        result.find((u) => u.media.id === 'id-1')?.usedIn[0]?.relativePath
      ).toBe('test.md');
    });

    it('finds multiple distinct media references in nested structures', async () => {
      // Arrange and Act: Set up two media items and a document that references both in different nested fields
      const result = await setupScannerWithValues(
        [
          { id: 'id-1', src: '/media/image1.png' },
          { id: 'id-2', src: '/media/image2.png' },
        ],
        {
          blocks: [
            { type: 'hero', bgImage: '/media/image1.png' },
            {
              type: 'gallery',
              items: [
                { img: '/media/image2.png' },
                { img: '/media/image1.png' },
              ],
            },
          ],
        }
      );

      // Assert: Should find one reference for each media item, even if one is referenced multiple times
      expect(result.find((u) => u.media.id === 'id-1')?.count).toBe(1);
      expect(result.find((u) => u.media.id === 'id-2')?.count).toBe(1);
    });

    it('counts a media path mentioned in document text as usage', async () => {
      // Arrange and Act: Set up a media item and a document that mentions the media path in text content
      const result = await setupScannerWithValues(
        [{ id: 'id-1', src: '/media/image.png' }],
        {
          body: {
            type: 'root',
            children: [
              {
                type: 'p',
                children: [
                  { type: 'text', text: 'This is a /media/image.png file' },
                ],
              },
            ],
          },
          description: 'But this one is not: /media/image.png.jpg',
        }
      );

      // Assert: Should count the direct path mention and ignore the longer suffixed path
      expect(result[0].count).toBe(1);
    });

    it('avoids false positives for path prefixes (e.g., .png vs .png.webp)', async () => {
      // Arrange and Act: Set up a media item and a document that contains a path that is a prefix of the media path
      const result = await setupScannerWithValues(
        [{ id: 'id-1', src: '/media/image.png' }],
        { image: '/media/image.png.webp' }
      );
      expect(result[0].count).toBe(0);
    });

    it('deduplicates multiple references within the same document', async () => {
      // Arrange and Act: Set up a media item and a document that references it multiple times in different fields
      const result = await setupScannerWithValues(
        [
          {
            id: 'img-1',
            src: '/media/img.jpg',
          },
        ],
        { img1: '/media/img.jpg', img2: '/media/img.jpg' }
      );

      // Assert: Should find one reference to the media item and count it only once
      expect(result[0].count).toBe(1);
      expect(result[0].usedIn).toHaveLength(1);
    });
  });

  describe('Navigation & Edit URL Resolution', () => {
    it('constructs correct default edit URLs with subdirectories', async () => {
      // Arrange and Act: Simulate a media item and a document in a subdirectory that references it
      const result = await setupScannerWithValues(
        [{ id: 'img-1', src: '/media/hero.jpg' }],
        { images: ['/media/hero.jpg'] },
        {
          relativePath: 'content/posts/hello.md',
          breadcrumbs: ['posts', 'hello'],
        }
      );

      // Assert: Should construct a URL that includes the breadcrumbs path
      expect(result[0].usedIn[0].editUrl).toBe(
        '#/collections/edit/post/~/posts/hello'
      );
    });

    it('respects custom ui.router configurations and basepaths', async () => {
      // Arrange: Configure custom router and basepath flags
      mockCms.flags.get.mockImplementation((key: string) => {
        if (key === 'tina-preview') return true;
        if (key === 'tina-basepath') return 'admin';
        return undefined;
      });

      mockCms.api.tina.schema.getCollection.mockReturnValue({
        ui: { router: async () => '/custom-route/hello' },
      });

      // Act: Run the scanner for a document with a media reference
      const result = await setupScannerWithValues(
        [{ id: 'img-1', src: '/media/img.png' }],
        { images: ['/media/img.png'] }
      );

      // Assert: Should use the custom route and include the basepath
      expect(result[0].usedIn[0].editUrl).toBe('#/~/admin/custom-route/hello');
    });

    it('respects custom ui.router configurations without a leading slash', async () => {
      // Arrange: Configure a custom router that returns a path without a leading slash
      mockCms.flags.get.mockImplementation((key: string) => {
        if (key === 'tina-preview') return true;
        if (key === 'tina-basepath') return 'admin';
        return undefined;
      });

      mockCms.api.tina.schema.getCollection.mockReturnValue({
        ui: { router: async () => 'custom-route/hello' },
      });

      // Act: Run the scanner for a document with a media reference
      const result = await setupScannerWithValues(
        [{ id: 'img-1', src: '/media/img.png' }],
        { images: ['/media/img.png'] }
      );

      // Assert: Should use the custom route directly without introducing an extra slash
      expect(result[0].usedIn[0].editUrl).toBe('#/~/admin/custom-route/hello');
    });

    it('falls back to the default edit URL when ui.router throws', async () => {
      // Arrange: Configure a custom router that fails while resolving a document URL
      mockCms.api.tina.schema.getCollection.mockReturnValue({
        ui: { router: async () => Promise.reject(new Error('router failed')) },
      });

      // Act: Run the scanner for a document with a media reference
      const result = await setupScannerWithValues(
        [{ id: 'img-1', src: '/media/img.png' }],
        { images: ['/media/img.png'] },
        {
          breadcrumbs: ['posts', 'hello'],
        }
      );

      // Assert: Should use the standard collection edit URL when router resolution fails
      expect(result[0].usedIn[0].editUrl).toBe(
        '#/collections/edit/post/~/posts/hello'
      );
    });
  });

  describe('Collection Scanning', () => {
    it('paginates through multiple document result pages', async () => {
      // Arrange: Simulate two document pages that each reference the same media item
      mockMediaListOnce([
        {
          id: 'img-1',
          src: '/media/hero.jpg',
          filename: 'hero.jpg',
        },
      ]);
      mockRequest.mockImplementation(async (query: string, args?: any) => {
        if (query.includes('collections { name label }')) {
          return { collections: [{ name: 'post', label: 'Posts' }] };
        }
        if (query.includes('postConnection') && !args?.variables?.after) {
          return {
            postConnection: {
              pageInfo: { hasNextPage: true, endCursor: 'page-2' },
              edges: [
                {
                  node: {
                    _sys: {
                      relativePath: 'first.md',
                      breadcrumbs: ['first'],
                      collection: { name: 'post', label: 'Posts' },
                    },
                    _values: createDocumentValues({
                      images: ['/media/hero.jpg'],
                    }),
                  },
                },
              ],
            },
          };
        }
        if (
          query.includes('postConnection') &&
          args?.variables?.after === 'page-2'
        ) {
          return {
            postConnection: {
              pageInfo: { hasNextPage: false, endCursor: 'page-3' },
              edges: [
                {
                  node: {
                    _sys: {
                      relativePath: 'second.md',
                      breadcrumbs: ['second'],
                      collection: { name: 'post', label: 'Posts' },
                    },
                    _values: createDocumentValues({
                      images: ['/media/hero.jpg'],
                    }),
                  },
                },
              ],
            },
          };
        }
        return {};
      });

      // Act
      const result = await scanAllMedia(mockCms);

      // Assert: Should scan both document pages and count one usage per document
      expect(result[0].count).toBe(2);
      expect(result[0].usedIn).toHaveLength(2);
      expect(result[0].usedIn.map((doc) => doc.relativePath)).toEqual([
        'first.md',
        'second.md',
      ]);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.stringContaining('postConnection'),
        expect.objectContaining({ variables: { after: 'page-2' } })
      );
    });

    it('rethrows document query errors for the dashboard to handle', async () => {
      // Arrange: Simulate a document query failure after media discovery succeeds
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockMediaListOnce([
        {
          id: 'img-1',
          src: '/media/hero.jpg',
          filename: 'hero.jpg',
        },
      ]);
      mockRequest.mockImplementation(async (query: string) => {
        if (query.includes('collections { name label }')) {
          return { collections: [{ name: 'post', label: 'Posts' }] };
        }
        if (query.includes('postConnection')) {
          throw new Error('query failed');
        }
        return {};
      });

      // Act and Assert: Should surface the collection scan failure to the caller
      await expect(scanAllMedia(mockCms)).rejects.toThrow('query failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing collection post:',
        expect.any(Error)
      );
    });
  });
});
