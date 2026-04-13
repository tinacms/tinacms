import { createResolver, updateObjectWithJsonPath } from './index';
import { describe, expect, it } from 'vitest';

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
});
