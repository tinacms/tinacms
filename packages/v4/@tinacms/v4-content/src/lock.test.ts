import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCK_VERSION, parseTinaLock, TinaLockError } from './lock';

const FIXTURE_LOCK = readFileSync(
  path.resolve(__dirname, '../fixtures/kitchen-sink/tina-lock.json'),
  'utf8'
);

const valid = () => JSON.parse(FIXTURE_LOCK);

const rejects = (value: unknown, message: string) => {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  expect(() => parseTinaLock(raw)).toThrow(TinaLockError);
  expect(() => parseTinaLock(raw)).toThrow(message);
};

describe('parseTinaLock', () => {
  it('reads the fixture lock', () => {
    const lock = parseTinaLock(FIXTURE_LOCK);
    expect(lock.version).toBe(LOCK_VERSION);
    expect(lock.schema.collections.map(({ name }) => name)).toEqual([
      'post',
      'author',
    ]);
    expect(lock).toEqual(valid());
  });

  it('does not compare the version with LOCK_VERSION', () => {
    expect(
      parseTinaLock(JSON.stringify({ ...valid(), version: 99 })).version
    ).toBe(99);
  });

  it('rejects text that is not JSON', () => {
    rejects('{', 'tina-lock.json is not JSON');
  });

  it('rejects a value that is not an object', () => {
    rejects([], 'is not a JSON object');
  });

  it('rejects a lock with no integer version', () => {
    rejects({ ...valid(), version: '5' }, 'has no integer `version`');
  });

  it('rejects a lock with no schema', () => {
    rejects({ ...valid(), schema: null }, 'has no `schema` object');
  });

  it('rejects a schema with no collections list', () => {
    const lock = valid();
    lock.schema.collections = {};
    rejects(lock, 'has no `schema.collections` list');
  });

  it('rejects a collection that is not an object, has no name, or has no fields', () => {
    const lock = valid();
    lock.schema.collections = ['post'];
    rejects(lock, 'has a collection at 0 that is not an object');
    lock.schema.collections = [{ fields: [] }];
    rejects(lock, 'has a collection at 0 with no name');
    lock.schema.collections = [{ name: 'post' }];
    rejects(lock, 'has a collection "post" with no fields');
  });

  it('rejects a schema with no package version', () => {
    const lock = valid();
    delete lock.schema.version;
    rejects(lock, 'has no `schema.version` object');
  });

  it('rejects a lock with no primitives, or a primitive that is not a number', () => {
    rejects({ ...valid(), primitives: [] }, 'has no `primitives` object');
    rejects(
      { ...valid(), primitives: { string: '1' } },
      'pins the field type "string" to a version that is not a number'
    );
  });
});
