import { describe, expect, it } from 'vitest';
import type { ResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import { LOCK_VERSION, checkLock, compileSchema } from './compile-schema';

// Built by hand rather than through defineConfig: the compile reads manifests only,
// and pinning the field set here keeps these assertions independent of which
// built-ins ship.
const fieldPlugin = (type: string, contractVersion: number) =>
  definePlugin({
    name: `test:field:${type}`,
    provides: ['field'],
    field: { type, contractVersion },
  });

const configWith = (
  fields: { name: string; type: string }[],
  plugins = [fieldPlugin('string', 1), fieldPlugin('rich-text', 1)]
): ResolvedConfig => ({
  plugins,
  schema: {
    collections: [
      { name: 'post', path: 'content/posts', format: 'md', fields },
    ],
  },
});

describe('compileSchema', () => {
  it('pins each field type the schema uses to its plugin contract version', () => {
    const lock = compileSchema(
      configWith([
        { name: 'title', type: 'string' },
        { name: 'body', type: 'rich-text' },
      ])
    );
    expect(lock).toEqual({
      version: LOCK_VERSION,
      schema: expect.anything(),
      primitives: { 'rich-text': 1, string: 1 },
    });
  });

  // The definitions resolve at build from the installed plugins, so the lock holds
  // a version number and nothing that could go stale on a non-breaking change.
  it('references primitives by key and version without inlining them', () => {
    const lock = compileSchema(configWith([{ name: 'title', type: 'string' }]));
    expect(JSON.stringify(lock)).not.toContain('Component');
    expect(lock.primitives).toEqual({ string: 1 });
  });

  it('omits installed field types the schema does not use', () => {
    const lock = compileSchema(configWith([{ name: 'title', type: 'string' }]));
    expect(lock.primitives).not.toHaveProperty('rich-text');
  });

  // Committed, so iteration order must not produce a diff on its own.
  it('orders primitives stably', () => {
    const lock = compileSchema(
      configWith([
        { name: 'body', type: 'rich-text' },
        { name: 'title', type: 'string' },
      ])
    );
    expect(Object.keys(lock.primitives)).toEqual(['rich-text', 'string']);
  });

  it('rejects a field type no installed plugin provides', () => {
    expect(() =>
      compileSchema(configWith([{ name: 'hero', type: 'image' }]))
    ).toThrow(/uses the field type "image"/);
  });
});

describe('checkLock', () => {
  const config = configWith([{ name: 'title', type: 'string' }]);

  it('passes a lock that matches the installed plugins', () => {
    expect(checkLock(compileSchema(config), config)).toEqual({
      status: 'current',
    });
  });

  // A schema edit is the everyday case: regenerate, never block.
  it('reports a lock that lags the schema as stale', () => {
    const lock = compileSchema(config);
    const check = checkLock(
      lock,
      configWith([
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string' },
      ])
    );
    expect(check.status).toBe('stale');
  });

  // The case ADR-016 exists for: the primitive changed shape under a committed
  // lock, so resolving it silently is what must not happen.
  it('stops on a pinned contract version the installed plugin no longer matches', () => {
    const lock = compileSchema(config);
    const check = checkLock(
      lock,
      configWith(
        [{ name: 'title', type: 'string' }],
        [fieldPlugin('string', 2)]
      )
    );
    expect(check.status).toBe('incompatible');
    expect(check).toHaveProperty(
      'message',
      expect.stringContaining('tina migrate')
    );
  });
});
