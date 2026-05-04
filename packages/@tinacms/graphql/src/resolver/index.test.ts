import {
  createResolver,
  resolveFieldData,
  updateObjectWithJsonPath,
} from './index';
import { describe, expect, it, vi } from 'vitest';
import path from 'path';
import { parseMDX, serializeMDX } from '../mdx';
import {
  resolveMediaCloudToRelative,
  resolveMediaRelativeToCloud,
} from './media-utils';
import { generatePasswordHash } from '../auth/utils';

vi.mock('../mdx', () => ({
  parseMDX: vi.fn(),
  serializeMDX: vi.fn(),
}));

vi.mock('./media-utils', () => ({
  resolveMediaRelativeToCloud: vi.fn((v) => v),
  resolveMediaCloudToRelative: vi.fn((v) => v),
}));

vi.mock('../auth/utils', () => ({
  generatePasswordHash: vi.fn(),
}));

describe('index', () => {
  describe('validatePath', () => {
    const resolver = createResolver({
      database: {} as any,
      tinaSchema: {} as any,
      isAudit: false,
    });
    // @ts-ignore Since it's private
    const validatePath = resolver.validatePath;

    it('should success for valid path', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = 'posts/hello.md';
      expect(() => validatePath(fullPath, collection)).not.toThrow();
    });

    it('should success for deep valid path', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = 'posts/nested/path/hello.md';
      expect(() => validatePath(fullPath, collection)).not.toThrow();
    });

    it('should throw error for path escaping collection directory via ..', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = 'posts/../../outside.md';
      expect(() => validatePath(fullPath, collection)).toThrow(
        'Invalid path: path escapes the collection directory'
      );
    });

    it('should throw error for sibling directory traversal', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = 'posts/../other-collection/file.md';
      expect(() => validatePath(fullPath, collection)).toThrow(
        'Invalid path: path escapes the collection directory'
      );
    });

    it('should throw error for absolute path', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = '/etc/passwd';
      expect(() => validatePath(fullPath, collection)).toThrow(
        'Invalid path: path escapes the collection directory'
      );
    });

    it('should throw error for backslash path traversal', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = 'posts/x\\..\\..\\outside.md';
      expect(() => validatePath(fullPath, collection)).toThrow(
        'Invalid path: path escapes the collection directory'
      );
    });

    it('should throw error for mixed slash traversal escaping collection', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = 'posts/x\\..\\..\\other/file.md';
      expect(() => validatePath(fullPath, collection)).toThrow(
        'Invalid path: path escapes the collection directory'
      );
    });

    it('should throw error for null bytes in path', () => {
      const collection = { path: 'posts' } as any;
      const fullPath = 'posts/file\0.md';
      expect(() => validatePath(fullPath, collection)).toThrow();
    });

    const invalidPathCases = [
      { label: 'whitespace only', relativePath: ' ' },
      { label: 'leading space + ext', relativePath: ' .md' },
      { label: 'multiple leading spaces', relativePath: '  .md' },
      { label: 'trailing space', relativePath: 'hello.md ' },
      { label: 'interior space', relativePath: 'hello world.md' },
    ];

    for (const { label, relativePath } of invalidPathCases) {
      it(`should throw error for ${label} relativePath ("${relativePath}")`, () => {
        const collection = { path: 'posts' } as any;
        const fullPath = `posts/${relativePath}`;
        expect(() => validatePath(fullPath, collection, relativePath)).toThrow(
          'Invalid path'
        );
      });
    }
  });

  describe('relativePath validation', () => {
    const collection = { name: 'post', path: 'posts', format: 'md' };
    const resolver = createResolver({
      database: {} as any,
      tinaSchema: {
        getCollections: () => [collection],
        getCollection: () => collection,
      } as any,
      isAudit: false,
    });
    // @ts-ignore Since it's private
    const getValidatedPath = resolver.getValidatedPath;

    const cases = [
      { label: 'empty string', relativePath: '' },
      { label: 'whitespace only', relativePath: ' ' },
      { label: 'leading space + ext', relativePath: ' .md' },
      { label: 'multiple leading spaces', relativePath: '  .md' },
      { label: 'trailing space', relativePath: 'hello.md ' },
      { label: 'interior space', relativePath: 'hello world.md' },
      { label: 'special characters', relativePath: 'hello@world.md' },
      { label: 'unicode characters', relativePath: 'héllo.md' },
    ];

    for (const { label, relativePath } of cases) {
      it(`should throw error in getValidatedPath for ${label} ("${relativePath}")`, () => {
        expect(() => getValidatedPath('post', relativePath)).toThrow(
          'Invalid path'
        );
      });
    }

    for (const { label, relativePath } of cases) {
      it(`should throw error in resolveCreateFolder for ${label} ("${relativePath}")`, async () => {
        await expect(
          resolver.resolveCreateFolder({
            collectionName: 'post',
            relativePath,
          })
        ).rejects.toThrow('Invalid path');
      });
    }

    const validCases = [
      { label: 'simple filename', relativePath: 'hello.md' },
      { label: 'nested path', relativePath: 'sub/folder/hello.md' },
      { label: 'with hyphens', relativePath: 'my-post.md' },
      { label: 'with underscores', relativePath: 'my_post.md' },
      { label: 'with numbers', relativePath: 'post-123.md' },
    ];

    for (const { label, relativePath } of validCases) {
      it(`should accept valid relativePath in getValidatedPath for ${label} ("${relativePath}")`, () => {
        expect(() => getValidatedPath('post', relativePath)).not.toThrow();
      });
    }
  });

  describe('updateObjectWithJsonPath', () => {
    it('should update top-level property', () => {
      const oldValue = 3;
      const obj = { a: oldValue };
      const path = '$.a';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({ a: newValue });
      expect(result.updated).toBe(true);
    });

    it('should update nested property in array', () => {
      const oldValue = 2;
      const obj = { a: { b: [{ c: 1 }, { c: oldValue }, { c: 3 }] } };
      const path = '$.a.b[*].c';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: { b: [{ c: 1 }, { c: newValue }, { c: 3 }] },
      });
      expect(result.updated).toBe(true);
    });

    it('should update multiple matches in array', () => {
      const oldValue = 2;
      const obj = { a: { b: [{ c: oldValue }, { c: oldValue }, { c: 3 }] } };
      const path = '$.a.b[*].c';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: { b: [{ c: newValue }, { c: newValue }, { c: 3 }] },
      });
      expect(result.updated).toBe(true);
    });

    it('should not update if oldValue does not match', () => {
      const oldValue = 5;
      const obj = { a: { b: { c: 3 } } };
      const path = '$.a.b.c';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({ a: { b: { c: 3 } } });
      expect(result.updated).toBe(false);
    });

    it('should update nested array in array', () => {
      const oldValue = 2;
      const obj = {
        a: {
          b: [{ c: [{ d: 1 }, { d: oldValue }] }, { c: [{ d: 3 }] }],
        },
      };
      const path = '$.a.b[*].c[*].d';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: {
          b: [{ c: [{ d: 1 }, { d: newValue }] }, { c: [{ d: 3 }] }],
        },
      });
      expect(result.updated).toBe(true);
    });

    it('should update property in array of objects', () => {
      const oldValue = 'old';
      const obj = { a: [{ b: oldValue }, { b: 'other' }, { b: oldValue }] };
      const path = '$.a[*].b';
      const newValue = 'new';

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: [{ b: newValue }, { b: 'other' }, { b: newValue }],
      });
      expect(result.updated).toBe(true);
    });

    it('should update property in nested arrays', () => {
      const oldValue = 2;
      const obj = {
        a: [{ b: [{ c: oldValue }, { c: 3 }] }, { b: [{ c: 4 }] }],
      };
      const path = '$.a[*].b[*].c';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: [{ b: [{ c: newValue }, { c: 3 }] }, { b: [{ c: 4 }] }],
      });
      expect(result.updated).toBe(true);
    });

    it('should update property in deeply nested object', () => {
      const oldValue = 3;
      const obj = { a: { b: { c: { d: { e: oldValue } } } } };
      const path = '$.a.b.c.d.e';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: { b: { c: { d: { e: newValue } } } },
      });
      expect(result.updated).toBe(true);
    });

    it('should not update if no matches in array', () => {
      const oldValue = 5;
      const obj = { a: [{ b: 1 }, { b: 2 }, { b: 3 }] };
      const path = '$.a[*].b';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({ a: [{ b: 1 }, { b: 2 }, { b: 3 }] }); // No change
      expect(result.updated).toBe(false);
    });

    it('should update property in array with mixed types', () => {
      const oldValue = 2;
      const obj = { a: [{ b: oldValue }, { b: 'string' }, { b: oldValue }] };
      const path = '$.a[*].b';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: [{ b: newValue }, { b: 'string' }, { b: newValue }],
      });
      expect(result.updated).toBe(true);
    });

    it('should update property in array with null values', () => {
      const oldValue = null;
      const obj = { a: [{ b: oldValue }, { b: 2 }, { b: oldValue }] };
      const path = '$.a[*].b';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: [{ b: newValue }, { b: 2 }, { b: newValue }],
      });
      expect(result.updated).toBe(true);
    });

    it('should update property in array with undefined values', () => {
      const oldValue = undefined;
      const obj = { a: [{ b: oldValue }, { b: 2 }, { b: oldValue }] };
      const path = '$.a[*].b';
      const newValue = 10;

      const result = updateObjectWithJsonPath(obj, path, oldValue, newValue);

      expect(result.object).toEqual({
        a: [{ b: newValue }, { b: 2 }, { b: newValue }],
      });
      expect(result.updated).toBe(true);
    });
  });

  describe('resolveFieldData()', () => {
    const tinaSchema = {
      schema: {} as any,
      getTemplateForData: vi.fn(),
    } as any;

    it('returns string fields unchanged', async () => {
      const field = {
        name: 'title',
        type: 'string',
        namespace: ['post', 'title'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(
        field,
        { title: 'Hello' },
        accumulator,
        tinaSchema
      );

      expect(accumulator).toEqual({ title: 'Hello' });
    });

    it('returns number fields unchanged', async () => {
      const field = {
        name: 'rating',
        type: 'number',
        namespace: ['post', 'rating'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(field, { rating: 4.5 }, accumulator, tinaSchema);

      expect(accumulator).toEqual({ rating: 4.5 });
    });

    it('returns boolean fields unchanged including false', async () => {
      const field = {
        name: 'published',
        type: 'boolean',
        namespace: ['post', 'published'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(
        field,
        { published: false },
        accumulator,
        tinaSchema
      );

      expect(accumulator).toEqual({ published: false });
    });

    it('serializes datetime fields to ISO string from Date input', async () => {
      const field = {
        name: 'publishedAt',
        type: 'datetime',
        namespace: ['post', 'publishedAt'],
      } as any;
      const accumulator: Record<string, unknown> = {};
      const date = new Date('2025-01-01T00:00:00.000Z');

      await resolveFieldData(
        field,
        { publishedAt: date },
        accumulator,
        tinaSchema
      );

      expect(accumulator).toEqual({ publishedAt: '2025-01-01T00:00:00.000Z' });
    });

    it('passes through datetime string input as-is', async () => {
      const field = {
        name: 'publishedAt',
        type: 'datetime',
        namespace: ['post', 'publishedAt'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(
        field,
        { publishedAt: '2025-01-01' },
        accumulator,
        tinaSchema
      );

      expect(accumulator).toEqual({ publishedAt: '2025-01-01' });
    });

    it('returns reference fields unchanged when set', async () => {
      const field = {
        name: 'author',
        type: 'reference',
        namespace: ['post', 'author'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(
        field,
        { author: 'authors/jane.md' },
        accumulator,
        tinaSchema
      );

      expect(accumulator).toEqual({ author: 'authors/jane.md' });
    });

    it('omits reference fields when value is null', async () => {
      const field = {
        name: 'author',
        type: 'reference',
        namespace: ['post', 'author'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(field, { author: null }, accumulator, tinaSchema);

      expect(accumulator).toEqual({});
    });

    it('resolves an object field by recursing into each declared subfield', async () => {
      const subfields = [
        {
          name: 'subtitle',
          type: 'string',
          namespace: ['post', 'meta', 'subtitle'],
        },
        {
          name: 'wordCount',
          type: 'number',
          namespace: ['post', 'meta', 'wordCount'],
        },
      ];
      const field = {
        name: 'meta',
        type: 'object',
        namespace: ['post', 'meta'],
        fields: subfields,
      } as any;
      const accumulator: Record<string, unknown> = {};
      const localSchema = {
        schema: {} as any,
        getTemplateForData: vi.fn().mockReturnValue({
          fields: subfields,
          namespace: ['post', 'meta'],
        }),
      } as any;

      await resolveFieldData(
        field,
        { meta: { subtitle: 'About', wordCount: 120 } },
        accumulator,
        localSchema
      );

      expect(accumulator).toEqual({
        meta: { subtitle: 'About', wordCount: 120 },
      });
    });

    it('resolves a list (object[]) field by mapping each item through the template', async () => {
      const subfields = [
        { name: 'name', type: 'string', namespace: ['post', 'tags', 'name'] },
      ];
      const field = {
        name: 'tags',
        type: 'object',
        list: true,
        namespace: ['post', 'tags'],
        fields: subfields,
      } as any;
      const accumulator: Record<string, unknown> = {};
      const localSchema = {
        schema: {} as any,
        getTemplateForData: vi.fn().mockReturnValue({
          fields: subfields,
          namespace: ['post', 'tags'],
        }),
      } as any;

      await resolveFieldData(
        field,
        { tags: [{ name: 'tina' }, { name: 'cms' }] },
        accumulator,
        localSchema
      );

      expect(accumulator).toEqual({
        tags: [{ name: 'tina' }, { name: 'cms' }],
      });
    });

    it('attaches _template key to union object list items', async () => {
      const heroFields = [
        {
          name: 'heading',
          type: 'string',
          namespace: ['page', 'block', 'hero', 'heading'],
        },
      ];
      const field = {
        name: 'block',
        type: 'object',
        list: true,
        namespace: ['page', 'block'],
        templates: [
          {
            name: 'hero',
            namespace: ['page', 'block', 'hero'],
            fields: heroFields,
          },
        ],
      } as any;
      const accumulator: Record<string, unknown> = {};
      const localSchema = {
        schema: {} as any,
        getTemplateForData: vi.fn().mockReturnValue({
          fields: heroFields,
          namespace: ['page', 'block', 'hero'],
        }),
      } as any;

      await resolveFieldData(
        field,
        { block: [{ heading: 'Welcome' }] },
        accumulator,
        localSchema
      );

      expect(accumulator).toEqual({
        block: [{ _template: 'hero', heading: 'Welcome' }],
      });
    });

    it('parses rich-text fields through parseMDX into the API tree shape', async () => {
      const tree = {
        type: 'root',
        children: [{ type: 'p', children: [{ type: 'text', text: 'hi' }] }],
      };
      vi.mocked(parseMDX).mockReturnValue(tree as any);
      const field = {
        name: 'body',
        type: 'rich-text',
        namespace: ['post', 'body'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(field, { body: '# hi' }, accumulator, tinaSchema);

      expect(accumulator).toEqual({ body: tree });
    });

    it('throws GraphQLError on invalid markdown when isAudit=true', async () => {
      vi.mocked(parseMDX).mockReturnValue({
        type: 'root',
        children: [
          {
            type: 'invalid_markdown',
            message: 'unexpected token',
            position: { start: { line: 1, column: 1 } },
          },
        ],
      } as any);
      const field = {
        name: 'body',
        type: 'rich-text',
        namespace: ['post', 'body'],
      } as any;

      await expect(
        resolveFieldData(
          field,
          { body: '???' },
          {},
          tinaSchema,
          undefined,
          true
        )
      ).rejects.toThrow(/unexpected token/);
    });

    it('sets the invalid_markdown tree without throwing when isAudit=false', async () => {
      const invalidTree = {
        type: 'root',
        children: [{ type: 'invalid_markdown', message: 'bad' }],
      };
      vi.mocked(parseMDX).mockReturnValue(invalidTree as any);
      const field = {
        name: 'body',
        type: 'rich-text',
        namespace: ['post', 'body'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(
        field,
        { body: '???' },
        accumulator,
        tinaSchema,
        undefined,
        false
      );

      expect(accumulator).toEqual({ body: invalidTree });
    });

    it('nulls password hash field but preserves passwordChangeRequired flag', async () => {
      const field = {
        name: 'password',
        type: 'password',
        namespace: ['user', 'password'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(
        field,
        {
          password: { value: 'hashed-secret', passwordChangeRequired: true },
        },
        accumulator,
        tinaSchema
      );

      expect(accumulator).toEqual({
        password: { value: undefined, passwordChangeRequired: true },
      });
    });

    it('rewrites image paths from relative to cloud when config.media is provided', async () => {
      vi.mocked(resolveMediaRelativeToCloud).mockReturnValue(
        'https://cdn.example.com/images/hero.png'
      );
      const field = {
        name: 'hero',
        type: 'image',
        namespace: ['post', 'hero'],
      } as any;
      const accumulator: Record<string, unknown> = {};
      const config = { media: { tina: { publicFolder: 'public' } } } as any;

      await resolveFieldData(
        field,
        { hero: 'images/hero.png' },
        accumulator,
        tinaSchema,
        config
      );

      expect(resolveMediaRelativeToCloud).toHaveBeenCalledWith(
        'images/hero.png',
        config,
        tinaSchema.schema
      );
      expect(accumulator).toEqual({
        hero: 'https://cdn.example.com/images/hero.png',
      });
    });

    it('skips displayOnly fields', async () => {
      const field = {
        name: 'helpText',
        type: 'displayOnly',
        namespace: ['post', 'helpText'],
      } as any;
      const accumulator: Record<string, unknown> = {};

      await resolveFieldData(
        field,
        { helpText: 'ignored' },
        accumulator,
        tinaSchema
      );

      expect(accumulator).toEqual({});
    });
  });

  describe('buildObjectMutations()', () => {
    const setup = () => {
      const resolver = createResolver({
        database: {} as any,
        tinaSchema: {} as any,
        isAudit: false,
      });
      (resolver as any).buildFieldMutations = vi
        .fn()
        .mockImplementation(async (item: any) => ({
          ...item,
          transformed: true,
        }));
      return { resolver };
    };

    it('builds mutations for a flat object via buildFieldMutations', async () => {
      const { resolver } = setup();
      const objectField = {
        name: 'meta',
        fields: [{ name: 'subtitle', type: 'string' }],
      } as any;
      const fieldValue = { subtitle: 'About' };

      const result = await resolver.buildObjectMutations(
        fieldValue,
        objectField
      );

      expect((resolver as any).buildFieldMutations).toHaveBeenCalledWith(
        fieldValue,
        objectField,
        undefined
      );
      expect(result).toEqual({ subtitle: 'About', transformed: true });
    });

    it('builds mutations for an array of objects, one item per element', async () => {
      const { resolver } = setup();
      const objectField = {
        name: 'tags',
        fields: [{ name: 'name', type: 'string' }],
      } as any;
      const fieldValue = [{ name: 'a' }, { name: 'b' }];

      const result = await resolver.buildObjectMutations(
        fieldValue,
        objectField
      );

      expect((resolver as any).buildFieldMutations).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { name: 'a', transformed: true },
        { name: 'b', transformed: true },
      ]);
    });

    it('selects the matching template for a union object by the input key', async () => {
      const { resolver } = setup();
      const heroTemplate = {
        name: 'hero',
        fields: [{ name: 'heading', type: 'string' }],
      };
      const featureTemplate = {
        name: 'feature',
        fields: [{ name: 'icon', type: 'string' }],
      };
      const unionField = {
        name: 'block',
        templates: [heroTemplate, featureTemplate],
      } as any;
      const fieldValue = { hero: { heading: 'Welcome' } };

      const result = await resolver.buildObjectMutations(
        fieldValue,
        unionField
      );

      expect((resolver as any).buildFieldMutations).toHaveBeenCalledWith(
        { heading: 'Welcome' },
        heroTemplate
      );
      expect(result).toEqual({
        heading: 'Welcome',
        transformed: true,
        _template: 'hero',
      });
    });

    it('attaches _template to each item of a union list', async () => {
      const { resolver } = setup();
      const heroTemplate = {
        name: 'hero',
        fields: [{ name: 'heading', type: 'string' }],
      };
      const featureTemplate = {
        name: 'feature',
        fields: [{ name: 'icon', type: 'string' }],
      };
      const unionField = {
        name: 'block',
        templates: [heroTemplate, featureTemplate],
      } as any;
      const fieldValue = [
        { hero: { heading: 'A' } },
        { feature: { icon: 'star' } },
      ];

      const result = await resolver.buildObjectMutations(
        fieldValue,
        unionField
      );

      expect(result).toEqual([
        { heading: 'A', transformed: true, _template: 'hero' },
        { icon: 'star', transformed: true, _template: 'feature' },
      ]);
    });

    it('throws when two array items share the same uid value', async () => {
      const { resolver } = setup();
      const objectField = {
        name: 'rows',
        fields: [
          { name: 'id', type: 'string', uid: true },
          { name: 'label', type: 'string' },
        ],
      } as any;
      const fieldValue = [
        { id: 'row-1', label: 'first' },
        { id: 'row-1', label: 'duplicate' },
      ];

      await expect(
        resolver.buildObjectMutations(fieldValue, objectField)
      ).rejects.toThrow(/Duplicate ids/);
    });

    it('passes existingData through to buildFieldMutations for nested updates', async () => {
      const { resolver } = setup();
      const objectField = {
        name: 'rows',
        fields: [
          { name: 'id', type: 'string', uid: true },
          { name: 'label', type: 'string' },
        ],
      } as any;
      const fieldValue = [{ id: 'row-1', label: 'updated' }];
      const existingData = [{ id: 'row-1', label: 'original' }];

      await resolver.buildObjectMutations(
        fieldValue,
        objectField,
        existingData
      );

      expect((resolver as any).buildFieldMutations).toHaveBeenCalledWith(
        { id: 'row-1', label: 'updated' },
        objectField,
        existingData[0]
      );
    });
  });

  describe('buildFieldMutations()', () => {
    const setup = () => {
      const resolver = createResolver({
        database: {} as any,
        tinaSchema: { schema: {} as any } as any,
        isAudit: false,
      });
      return { resolver, build: (resolver as any).buildFieldMutations };
    };

    it('passes string, number, boolean fields through unchanged', async () => {
      const { build } = setup();
      const template = {
        fields: [
          { name: 'title', type: 'string' },
          { name: 'published', type: 'boolean' },
          { name: 'rating', type: 'number' },
        ],
      } as any;

      const result = await build(
        { title: 'Hello', published: false, rating: 4 },
        template
      );

      expect(result).toEqual({ title: 'Hello', published: false, rating: 4 });
    });

    it('parses datetime input via resolveDateInput into a Date', async () => {
      const { build } = setup();
      const template = {
        fields: [{ name: 'publishedAt', type: 'datetime' }],
      } as any;

      const result = await build({ publishedAt: '2025-01-01' }, template);

      expect(result.publishedAt).toBeInstanceOf(Date);
      expect((result.publishedAt as Date).toISOString()).toContain(
        '2025-01-01'
      );
    });

    it('rewrites image paths from cloud to relative on write', async () => {
      vi.mocked(resolveMediaCloudToRelative).mockReturnValue('images/hero.png');
      const { build } = setup();
      const template = {
        fields: [{ name: 'hero', type: 'image' }],
      } as any;

      const result = await build(
        { hero: 'https://cdn.example.com/images/hero.png' },
        template
      );

      expect(resolveMediaCloudToRelative).toHaveBeenCalledWith(
        'https://cdn.example.com/images/hero.png',
        undefined,
        {}
      );
      expect(result).toEqual({ hero: 'images/hero.png' });
    });

    it('serializes rich-text via serializeMDX before storage', async () => {
      vi.mocked(serializeMDX).mockReturnValue('# Hello');
      const { build } = setup();
      const template = {
        fields: [{ name: 'body', type: 'rich-text' }],
      } as any;
      const tree = { type: 'root', children: [] };

      const result = await build({ body: tree }, template);

      expect(serializeMDX).toHaveBeenCalledWith(
        tree,
        template.fields[0],
        expect.any(Function)
      );
      expect(result).toEqual({ body: '# Hello' });
    });

    it('hashes a new password value', async () => {
      vi.mocked(generatePasswordHash).mockResolvedValue('hashed-NEW');
      const { build } = setup();
      const template = {
        fields: [{ name: 'password', type: 'password' }],
      } as any;

      const result = await build(
        { password: { value: 'newpass', passwordChangeRequired: true } },
        template
      );

      expect(generatePasswordHash).toHaveBeenCalledWith({
        password: 'newpass',
      });
      expect(result).toEqual({
        password: { value: 'hashed-NEW', passwordChangeRequired: true },
      });
    });

    it('preserves the existing password hash when no new value is supplied', async () => {
      vi.mocked(generatePasswordHash).mockClear();
      const { build } = setup();
      const template = {
        fields: [{ name: 'password', type: 'password' }],
      } as any;

      const result = await build(
        { password: { passwordChangeRequired: false } },
        template,
        { password: { value: 'existing-hash' } }
      );

      expect(generatePasswordHash).not.toHaveBeenCalled();
      expect(result).toEqual({
        password: { value: 'existing-hash', passwordChangeRequired: false },
      });
    });

    it('delegates object fields to buildObjectMutations', async () => {
      const { resolver, build } = setup();
      (resolver as any).buildObjectMutations = vi
        .fn()
        .mockResolvedValue({ subtitle: 'About', transformed: true });
      const objectField = {
        name: 'meta',
        type: 'object',
        fields: [{ name: 'subtitle', type: 'string' }],
      };
      const template = { fields: [objectField] } as any;
      const fieldValue = { subtitle: 'About' };
      const existing = { meta: { subtitle: 'Old' } };

      const result = await build({ meta: fieldValue }, template, existing);

      expect((resolver as any).buildObjectMutations).toHaveBeenCalledWith(
        fieldValue,
        objectField,
        existing.meta
      );
      expect(result).toEqual({
        meta: { subtitle: 'About', transformed: true },
      });
    });

    it('skips displayOnly fields', async () => {
      const { build } = setup();
      const template = {
        fields: [
          { name: 'title', type: 'string' },
          { name: 'helpText', type: 'displayOnly' },
        ],
      } as any;

      const result = await build(
        { title: 'Hello', helpText: 'ignored' },
        template
      );

      expect(result).toEqual({ title: 'Hello' });
    });

    it('returns reference field values unchanged', async () => {
      const { build } = setup();
      const template = {
        fields: [{ name: 'author', type: 'reference' }],
      } as any;

      const result = await build({ author: 'authors/jane.md' }, template);

      expect(result).toEqual({ author: 'authors/jane.md' });
    });

    it('surfaces a useful error for invalid datetime input', async () => {
      const { build } = setup();
      const template = {
        fields: [{ name: 'publishedAt', type: 'datetime' }],
      } as any;

      await expect(build({ publishedAt: 'not-a-date' }, template)).rejects.toBe(
        'Invalid Date'
      );
    });
  });

  describe('resolveRetrievedDocument()', () => {
    const collection = { name: 'post', path: 'posts', format: 'md' } as any;
    const realPath = path.join('posts', 'hello.md');

    const setup = () => {
      const tinaSchema = {
        getCollections: () => [collection],
        getCollection: () => collection,
      };
      const resolver = createResolver({
        database: {} as any,
        tinaSchema: tinaSchema as any,
        isAudit: false,
      });
      const doc = { id: realPath, _collection: 'post' };
      resolver.getDocument = vi.fn().mockResolvedValue(doc);
      return { resolver, doc };
    };

    it('reads a document via getDocument with checkReferences and the resolved collection', async () => {
      const { resolver, doc } = setup();

      const result = await resolver.resolveRetrievedDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
      });

      expect(resolver.getDocument).toHaveBeenCalledWith(
        realPath,
        expect.objectContaining({ checkReferences: true, collection })
      );
      expect(result).toBe(doc);
    });

    it('throws when the relativePath fails getValidatedPath', async () => {
      const { resolver } = setup();

      await expect(
        resolver.resolveRetrievedDocument({
          collectionName: 'post',
          relativePath: 'bad name.md',
        })
      ).rejects.toThrow(/Invalid path/);
      expect(resolver.getDocument).not.toHaveBeenCalled();
    });

    it('throws when the collection name is unknown', async () => {
      const { resolver } = setup();

      await expect(
        resolver.resolveRetrievedDocument({
          collectionName: 'not-a-collection',
          relativePath: 'hello.md',
        })
      ).rejects.toThrow(/must be one of/);
    });
  });

  describe('resolveCreateDocument()', () => {
    const collection = { name: 'post', path: 'posts', format: 'md' } as any;
    const realPath = path.join('posts', 'hello.md');

    const setup = () => {
      const database = {
        documentExists: vi.fn().mockResolvedValue(false),
        put: vi.fn().mockResolvedValue(undefined),
      };
      const tinaSchema = {
        getCollections: () => [collection],
        getCollection: () => collection,
      };
      const resolver = createResolver({
        database: database as any,
        tinaSchema: tinaSchema as any,
        isAudit: false,
      });
      const createdDoc = { id: realPath, _collection: 'post' };
      resolver.getDocument = vi.fn().mockResolvedValue(createdDoc);
      resolver.buildObjectMutations = vi
        .fn()
        .mockResolvedValue({ title: 'Hello' });
      return { resolver, database, createdDoc };
    };

    it('writes the new document via database.put with the resolved real path and transformed body', async () => {
      const { resolver, database } = setup();

      await resolver.resolveCreateDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
        body: { title: 'Hello' },
      });

      expect(database.put).toHaveBeenCalledWith(
        realPath,
        { title: 'Hello' },
        'post'
      );
    });

    it('runs the body through buildObjectMutations before writing', async () => {
      const { resolver } = setup();
      const body = { title: 'Hello' };

      await resolver.resolveCreateDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
        body,
      });

      expect(resolver.buildObjectMutations).toHaveBeenCalledWith(
        body,
        collection
      );
    });

    it('throws when the document already exists', async () => {
      const { resolver, database } = setup();
      database.documentExists.mockResolvedValue(true);

      await expect(
        resolver.resolveCreateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          body: { title: 'Hello' },
        })
      ).rejects.toThrow(/already exists/);
      expect(database.put).not.toHaveBeenCalled();
    });

    it('returns the created document via getDocument', async () => {
      const { resolver, createdDoc } = setup();

      const result = await resolver.resolveCreateDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
        body: { title: 'Hello' },
      });

      expect(result).toBe(createdDoc);
    });
  });

  describe('resolveCreateFolder()', () => {
    const collection = { name: 'post', path: 'posts', format: 'md' } as any;

    const setup = (col = collection) => {
      const database = {
        documentExists: vi.fn().mockResolvedValue(false),
        put: vi.fn().mockResolvedValue(undefined),
      };
      const tinaSchema = {
        getCollections: () => [col],
        getCollection: () => col,
      };
      const resolver = createResolver({
        database: database as any,
        tinaSchema: tinaSchema as any,
        isAudit: false,
      });
      const folderDoc = { id: 'folder-doc' };
      resolver.getDocument = vi.fn().mockResolvedValue(folderDoc);
      return { resolver, database, folderDoc };
    };

    it('creates a .gitkeep placeholder at the expected nested path with the collection format', async () => {
      const { resolver, database } = setup();

      await resolver.resolveCreateFolder({
        collectionName: 'post',
        relativePath: 'subfolder',
      });

      expect(database.put).toHaveBeenCalledWith(
        path.join('posts', 'subfolder', '.gitkeep.md'),
        { _is_tina_folder_placeholder: true },
        'post'
      );
    });

    it('defaults the placeholder extension to md when the collection has no format', async () => {
      const formatless = { name: 'page', path: 'pages' } as any;
      const { resolver, database } = setup(formatless);

      await resolver.resolveCreateFolder({
        collectionName: 'page',
        relativePath: 'subfolder',
      });

      expect(database.put).toHaveBeenCalledWith(
        path.join('pages', 'subfolder', '.gitkeep.md'),
        expect.anything(),
        'page'
      );
    });

    it('throws when the folder already exists', async () => {
      const { resolver, database } = setup();
      database.documentExists.mockResolvedValue(true);

      await expect(
        resolver.resolveCreateFolder({
          collectionName: 'post',
          relativePath: 'subfolder',
        })
      ).rejects.toThrow(/already exists/);
      expect(database.put).not.toHaveBeenCalled();
    });

    it('throws when the collection name is unknown', async () => {
      const { resolver } = setup();

      await expect(
        resolver.resolveCreateFolder({
          collectionName: 'not-a-collection',
          relativePath: 'subfolder',
        })
      ).rejects.toThrow(/must be one of/);
    });
  });

  describe('resolveAddPendingDocument()', () => {
    const collection = { name: 'post', path: 'posts', format: 'md' } as any;
    const realPath = path.join('posts', 'hello.md');

    const setup = (templatesForCollectable: any) => {
      const database = {
        documentExists: vi.fn().mockResolvedValue(false),
        addPendingDocument: vi.fn().mockResolvedValue(undefined),
      };
      const tinaSchema = {
        getCollections: () => [collection],
        getCollection: () => collection,
        getTemplatesForCollectable: vi
          .fn()
          .mockReturnValue(templatesForCollectable),
      };
      const resolver = createResolver({
        database: database as any,
        tinaSchema: tinaSchema as any,
        isAudit: false,
      });
      const pendingDoc = { id: realPath };
      resolver.getDocument = vi.fn().mockResolvedValue(pendingDoc);
      return { resolver, database };
    };

    it('adds a pending document with empty payload for a single-template (object) collection', async () => {
      const { resolver, database } = setup({ type: 'object' });

      await resolver.resolveAddPendingDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
        templateName: '',
      });

      expect(database.addPendingDocument).toHaveBeenCalledWith(realPath, {});
    });

    it('adds a pending document with the resolved template name for a union collection', async () => {
      const { resolver, database } = setup({
        type: 'union',
        templates: [{ name: 'hero', namespace: ['post', 'hero'], fields: [] }],
      });

      await resolver.resolveAddPendingDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
        templateName: 'hero',
      });

      expect(database.addPendingDocument).toHaveBeenCalledWith(realPath, {
        _template: 'hero',
      });
    });

    it('throws when no templateName is supplied for a union collection', async () => {
      const { resolver, database } = setup({
        type: 'union',
        templates: [{ name: 'hero', namespace: ['post', 'hero'] }],
      });

      await expect(
        resolver.resolveAddPendingDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          templateName: '',
        })
      ).rejects.toThrow(/Must specify a template/);
      expect(database.addPendingDocument).not.toHaveBeenCalled();
    });

    it('throws when templateName does not match any template in a union collection', async () => {
      const { resolver, database } = setup({
        type: 'union',
        templates: [{ name: 'hero', namespace: ['post', 'hero'] }],
      });

      await expect(
        resolver.resolveAddPendingDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          templateName: 'mystery',
        })
      ).rejects.toThrow(/Expected to find template/);
      expect(database.addPendingDocument).not.toHaveBeenCalled();
    });
  });

  describe('resolveUpdateDocument()', () => {
    const collection = { name: 'post', path: 'posts', format: 'md' } as any;
    const realPath = path.join('posts', 'hello.md');
    const newRealPath = path.join('posts', 'renamed.md');

    const setup = () => {
      const database = {
        documentExists: vi.fn().mockResolvedValue(true),
        delete: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
      };
      const tinaSchema = {
        getCollections: () => [collection],
        getCollection: () => collection,
        getCollectionByFullPath: vi.fn().mockReturnValue(collection),
      };
      const resolver = createResolver({
        database: database as any,
        tinaSchema: tinaSchema as any,
        isAudit: false,
      });
      const rawData = { _collection: 'post', title: 'Hello' };
      const doc = { id: realPath, _collection: 'post', _rawData: rawData };
      resolver.getDocument = vi.fn().mockResolvedValue(doc);
      resolver.deleteDocument = vi.fn().mockResolvedValue(undefined);
      resolver.getRaw = vi.fn();
      resolver.buildObjectMutations = vi.fn().mockResolvedValue({});
      resolver.resolveLegacyValues = vi.fn().mockReturnValue({});
      (resolver as any).findReferences = vi.fn().mockResolvedValue({});
      return { resolver, database, tinaSchema, doc, rawData };
    };

    describe('body update', () => {
      it('writes the transformed body to database.put with the resolved real path', async () => {
        const { resolver, database } = setup();
        (resolver.buildObjectMutations as any).mockResolvedValue({
          title: 'Updated',
        });

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newBody: { title: 'Updated' },
        });

        expect(database.put).toHaveBeenCalledWith(
          realPath,
          { title: 'Updated' },
          'post'
        );
      });

      it('runs the new body through buildObjectMutations before writing', async () => {
        const { resolver, rawData } = setup();
        const newBody = { title: 'Updated' };

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newBody,
        });

        expect(resolver.buildObjectMutations).toHaveBeenCalledWith(
          newBody,
          collection,
          rawData
        );
      });

      it('merges legacyValues from resolveLegacyValues into the put payload', async () => {
        const { resolver, database } = setup();
        (resolver.buildObjectMutations as any).mockResolvedValue({
          title: 'Updated',
        });
        (resolver.resolveLegacyValues as any).mockReturnValue({
          deprecatedField: 'kept',
        });

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newBody: { title: 'Updated' },
        });

        expect(database.put).toHaveBeenCalledWith(
          realPath,
          { deprecatedField: 'kept', title: 'Updated' },
          'post'
        );
      });

      it('throws when the document does not exist', async () => {
        const { resolver, database } = setup();
        database.documentExists.mockResolvedValue(false);

        await expect(
          resolver.resolveUpdateDocument({
            collectionName: 'post',
            relativePath: 'hello.md',
            newBody: { title: 'x' },
          })
        ).rejects.toThrow(/does not exist/);
        expect(database.put).not.toHaveBeenCalled();
      });
    });

    describe('rename', () => {
      it('writes the document under the new path and deletes the old path', async () => {
        const { resolver, database, rawData } = setup();

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newRelativePath: 'renamed.md',
        });

        expect(database.put).toHaveBeenCalledWith(newRealPath, rawData, 'post');
        expect(resolver.deleteDocument).toHaveBeenCalledWith(realPath);
      });

      it('returns the existing document unchanged when the new path resolves to the same realPath', async () => {
        const { resolver, database, doc } = setup();

        const result = await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newRelativePath: 'hello.md',
        });

        expect(result).toBe(doc);
        expect(database.put).not.toHaveBeenCalled();
        expect(resolver.deleteDocument).not.toHaveBeenCalled();
      });

      it('rejects rename when the new path fails validation', async () => {
        const { resolver } = setup();

        await expect(
          resolver.resolveUpdateDocument({
            collectionName: 'post',
            relativePath: 'hello.md',
            newRelativePath: 'bad name.md',
          })
        ).rejects.toThrow(/Invalid path/);
      });

      it('skips the rewrite loop when no references are found', async () => {
        const { resolver, database } = setup();

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newRelativePath: 'renamed.md',
        });

        expect(database.put).toHaveBeenCalledTimes(1);
        expect(resolver.getRaw).not.toHaveBeenCalled();
      });

      it('persists each rewritten reference via database.put', async () => {
        const { resolver, database } = setup();
        const refDocA = path.join('posts', 'a.md');
        const refDocB = path.join('posts', 'b.md');
        (resolver as any).findReferences.mockResolvedValue({
          post: {
            [refDocA]: ['$.relatedPost'],
            [refDocB]: ['$.relatedPost'],
          },
        });
        resolver.getRaw = vi
          .fn()
          .mockResolvedValueOnce({ _collection: 'post', relatedPost: realPath })
          .mockResolvedValueOnce({
            _collection: 'post',
            relatedPost: realPath,
          });

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newRelativePath: 'renamed.md',
        });

        expect(database.put).toHaveBeenCalledTimes(3);
        expect(database.put).toHaveBeenCalledWith(
          refDocA,
          expect.objectContaining({ relatedPost: newRealPath }),
          'post'
        );
        expect(database.put).toHaveBeenCalledWith(
          refDocB,
          expect.objectContaining({ relatedPost: newRealPath }),
          'post'
        );
      });

      it('takes precedence and body is ignored when both are provided', async () => {
        const { resolver, database } = setup();

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newRelativePath: 'renamed.md',
          newBody: { title: 'should not apply' },
        });

        expect(database.put).toHaveBeenCalledWith(
          newRealPath,
          expect.anything(),
          'post'
        );
        expect(resolver.deleteDocument).toHaveBeenCalledWith(realPath);
        expect(resolver.buildObjectMutations).not.toHaveBeenCalled();
        expect(resolver.resolveLegacyValues).not.toHaveBeenCalled();
      });

      it('carries legacy fields forward when renaming a doc', async () => {
        const { resolver, database } = setup();
        resolver.getDocument = vi.fn().mockResolvedValue({
          id: realPath,
          _rawData: {
            _collection: 'post',
            title: 'Hello',
            legacyField: 'kept after rename',
          },
        });

        await resolver.resolveUpdateDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
          newRelativePath: 'renamed.md',
        });

        expect(database.put).toHaveBeenCalledWith(
          newRealPath,
          expect.objectContaining({ legacyField: 'kept after rename' }),
          'post'
        );
      });
    });
  });

  describe('resolveDeleteDocument()', () => {
    const collection = { name: 'post', path: 'posts', format: 'md' } as any;
    const realPath = path.join('posts', 'hello.md');

    const setup = (overrides: { hasReferences?: boolean } = {}) => {
      const database = {
        documentExists: vi.fn().mockResolvedValue(true),
        delete: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
      };
      const tinaSchema = {
        getCollections: () => [collection],
        getCollection: () => collection,
        getCollectionByFullPath: vi.fn().mockReturnValue(collection),
      };
      const resolver = createResolver({
        database: database as any,
        tinaSchema: tinaSchema as any,
        isAudit: false,
      });
      const deletedDoc = { id: realPath, _collection: 'post' };
      resolver.getDocument = vi.fn().mockResolvedValue(deletedDoc);
      resolver.deleteDocument = vi.fn().mockResolvedValue(undefined);
      resolver.getRaw = vi.fn();
      (resolver as any).hasReferences = vi
        .fn()
        .mockResolvedValue(overrides.hasReferences ?? false);
      (resolver as any).findReferences = vi.fn();
      return { resolver, database, tinaSchema, deletedDoc };
    };

    it('deletes the document at the resolved real path and returns the payload', async () => {
      const { resolver, deletedDoc } = setup();

      const result = await resolver.resolveDeleteDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
      });

      expect(resolver.deleteDocument).toHaveBeenCalledWith(realPath);
      expect(result).toBe(deletedDoc);
    });

    it('throws when the document does not exist', async () => {
      const { resolver, database } = setup();
      database.documentExists.mockResolvedValue(false);

      await expect(
        resolver.resolveDeleteDocument({
          collectionName: 'post',
          relativePath: 'hello.md',
        })
      ).rejects.toThrow(/does not exist/);
      expect(resolver.deleteDocument).not.toHaveBeenCalled();
    });

    it('does not query references when hasReferences returns false', async () => {
      const { resolver, database } = setup({ hasReferences: false });

      await resolver.resolveDeleteDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
      });

      expect((resolver as any).findReferences).not.toHaveBeenCalled();
      expect(database.put).not.toHaveBeenCalled();
    });

    it('persists each cleared reference via database.put', async () => {
      const { resolver, database } = setup({ hasReferences: true });
      const refDocA = path.join('posts', 'a.md');
      const refDocB = path.join('posts', 'b.md');
      (resolver as any).findReferences.mockResolvedValue({
        post: {
          [refDocA]: ['$.relatedPost'],
          [refDocB]: ['$.relatedPost'],
        },
      });
      resolver.getRaw = vi
        .fn()
        .mockResolvedValueOnce({ _collection: 'post', relatedPost: realPath })
        .mockResolvedValueOnce({ _collection: 'post', relatedPost: realPath });

      await resolver.resolveDeleteDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
      });

      expect(database.put).toHaveBeenCalledTimes(2);
      expect(database.put).toHaveBeenCalledWith(
        refDocA,
        expect.objectContaining({ relatedPost: null }),
        'post'
      );
      expect(database.put).toHaveBeenCalledWith(
        refDocB,
        expect.objectContaining({ relatedPost: null }),
        'post'
      );
    });

    it('clears a reference nested inside a deeply-nested object/list', async () => {
      const { resolver, database } = setup({ hasReferences: true });
      const refDocPath = path.join('posts', 'related.md');
      (resolver as any).findReferences.mockResolvedValue({
        post: { [refDocPath]: ['$.sections[*].items[*].author'] },
      });
      resolver.getRaw = vi.fn().mockResolvedValue({
        _collection: 'post',
        sections: [
          {
            items: [{ author: realPath }, { author: 'authors/other.md' }],
          },
        ],
      });

      await resolver.resolveDeleteDocument({
        collectionName: 'post',
        relativePath: 'hello.md',
      });

      expect(database.put).toHaveBeenCalledWith(
        refDocPath,
        {
          _collection: 'post',
          sections: [
            {
              items: [{ author: null }, { author: 'authors/other.md' }],
            },
          ],
        },
        'post'
      );
    });

    it('hasReferences returns false when the query is empty and true otherwise', async () => {
      const dbEmpty = {
        query: vi.fn().mockResolvedValue(undefined),
      };
      const resolverEmpty = createResolver({
        database: dbEmpty as any,
        tinaSchema: {} as any,
        isAudit: false,
      });
      expect(
        await (resolverEmpty as any).hasReferences('posts/x.md', collection)
      ).toBe(false);

      const dbWithRefs = {
        query: vi.fn().mockImplementation(async (_q, cb) => {
          cb('posts/y.md', {});
        }),
      };
      const resolverWithRefs = createResolver({
        database: dbWithRefs as any,
        tinaSchema: {} as any,
        isAudit: false,
      });
      expect(
        await (resolverWithRefs as any).hasReferences('posts/x.md', collection)
      ).toBe(true);
    });
  });

  describe('resolveLegacyValues()', () => {
    const resolver = createResolver({
      database: {} as any,
      tinaSchema: {} as any,
      isAudit: false,
    });

    it('preserves keys present on the document but not declared in the collection schema', () => {
      const collection = {
        name: 'post',
        fields: [{ name: 'title' }],
      } as any;
      const oldDoc = {
        _collection: 'post',
        title: 'Hello',
        droppedFromSchema: 'still here',
      };

      expect(resolver.resolveLegacyValues(oldDoc, collection)).toEqual({
        droppedFromSchema: 'still here',
      });
    });

    it('drops keys that are declared in the collection schema', () => {
      const collection = {
        name: 'post',
        fields: [{ name: 'title' }, { name: 'body' }],
      } as any;
      const oldDoc = {
        _collection: 'post',
        title: 'Hello',
        body: 'World',
      };

      expect(resolver.resolveLegacyValues(oldDoc, collection)).toEqual({});
    });

    it('skips reserved keys ($_body, _collection, _template, _relativePath, _id, _keepTemplateKey)', () => {
      const collection = {
        name: 'post',
        fields: [{ name: 'title' }],
      } as any;
      const oldDoc = {
        _collection: 'post',
        $_body: 'body content',
        _template: 'tpl',
        _keepTemplateKey: true,
        _relativePath: 'hello.md',
        _id: 'posts/hello.md',
        title: 'Hello',
        legacyKept: 'kept',
      };

      expect(resolver.resolveLegacyValues(oldDoc, collection)).toEqual({
        legacyKept: 'kept',
      });
    });

    it('uses the matched template fields when the collection is template-based', () => {
      const collection = {
        name: 'page',
        templates: [
          { name: 'hero', fields: [{ name: 'heading' }] },
          { name: 'feature', fields: [{ name: 'icon' }] },
        ],
      } as any;
      const oldDoc = {
        _template: 'hero',
        heading: 'Welcome',
        legacySubtitle: 'no longer in schema',
      };

      expect(resolver.resolveLegacyValues(oldDoc, collection)).toEqual({
        legacySubtitle: 'no longer in schema',
      });
    });

    it('preserves underscore-prefixed keys that are not on the reserved list', () => {
      const collection = {
        name: 'post',
        fields: [{ name: 'title' }],
      } as any;
      const oldDoc = {
        _collection: 'post',
        title: 'Hello',
        _publishedAt: '2024-01-01',
      };

      expect(resolver.resolveLegacyValues(oldDoc, collection)).toEqual({
        _publishedAt: '2024-01-01',
      });
    });
  });
});
