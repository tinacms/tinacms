import { describe, expect, it } from 'vitest';
import { type ResolvedConfig, asResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import type { FieldSchema } from '../core/schema/types';
import { LOCK_VERSION, checkLock, compileSchema } from './compile-schema';

// This config is built by hand, and not by defineConfig. The compile reads the manifests
// only. A fixed field set here also keeps these tests independent of the built-ins that
// ship.
const fieldPlugin = (type: string, contractVersion: number) =>
  definePlugin({
    name: `test:field:${type}`,
    provides: ['field'],
    field: { type, contractVersion },
  });

const configWith = (
  fields: { name: string; type: string }[],
  plugins = [fieldPlugin('string', 1), fieldPlugin('rich-text', 1)]
): ResolvedConfig =>
  asResolvedConfig({
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

  // The definitions resolve at build time from the installed plugins. The lock
  // therefore holds a version number, and nothing that a change without a break could
  // make stale.
  // The previous version of this asserted `not.toContain('Component')` against
  // manifests that carry no client segment, so it could not fail. What the ADR
  // actually promises is that the lock holds a version number and nothing that the
  // installed plugin resolves at build.
  it('references primitives by key and version without inlining them', () => {
    const lock = compileSchema(configWith([{ name: 'title', type: 'string' }]));
    expect(lock.primitives).toEqual({ string: 1 });
    expect(typeof lock.primitives.string).toBe('number');
  });

  it('omits installed field types the schema does not use', () => {
    const lock = compileSchema(configWith([{ name: 'title', type: 'string' }]));
    expect(lock.primitives).not.toHaveProperty('rich-text');
  });

  // The file is committed, so the iteration order alone must not change it.
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

  // An edit to the schema is the common case. Write the lock again, and do not stop
  // the build.
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

  // This is the case that ADR-016 covers. The primitive changed its shape under a
  // committed lock, and a silent repair must not happen.
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
      expect.stringContaining('tinacms migrate')
    );
  });
});

// A rich-text field carries templates whose fields have their own types. They render
// like any other field, so they need the same build gate and the same contract pin —
// reading only the top level let them through both.
const withFields = (fields: FieldSchema[]): ResolvedConfig =>
  asResolvedConfig({
    plugins: [fieldPlugin('rich-text', 1), fieldPlugin('string', 3)],
    schema: {
      collections: [
        { name: 'post', path: 'content/posts', format: 'md', fields },
      ],
    },
  });

const withTemplate = (nestedType: string): ResolvedConfig =>
  withFields([
    {
      name: 'body',
      type: 'rich-text',
      templates: [
        { name: 'cta', fields: [{ name: 'label', type: nestedType }] },
      ],
    },
  ]);

describe('compileSchema with nested template fields', () => {
  it('pins a type that only a template uses', () => {
    expect(compileSchema(withTemplate('string')).primitives).toEqual({
      'rich-text': 1,
      string: 3,
    });
  });

  it('rejects a template field type no plugin provides', () => {
    expect(() => compileSchema(withTemplate('image'))).toThrow(
      /uses the field type "image"/
    );
  });

  // A template can nest a field that carries templates of its own, and those fields
  // render too. Stopping at the first level let them past the gate.
  it('rejects a field type nested inside a template of a template', () => {
    expect(() =>
      compileSchema(
        withFields([
          {
            name: 'body',
            type: 'rich-text',
            templates: [
              {
                name: 'cta',
                fields: [
                  {
                    name: 'blurb',
                    type: 'rich-text',
                    templates: [
                      {
                        name: 'note',
                        fields: [{ name: 'icon', type: 'image' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ])
      )
    ).toThrow(/uses the field type "image"/);
  });
});

describe('compileSchema provider conflicts', () => {
  // The field registry refuses to boot this config; last-wins here would still write
  // a lock, pinning whichever plugin happened to be last.
  it('rejects two plugins providing the same field type', () => {
    expect(() =>
      compileSchema(
        configWith(
          [{ name: 'title', type: 'string' }],
          [fieldPlugin('string', 1), fieldPlugin('string', 2)]
        )
      )
    ).toThrow(/Two plugins provide/);
  });
});

describe('checkLock across lock formats', () => {
  const config = configWith([{ name: 'title', type: 'string' }]);

  // A lock from a newer tinacms differs only by stringify, so it read as stale and was
  // rewritten in the older format — a silent downgrade of a committed file.
  it('refuses a lock written in a newer format instead of downgrading it', () => {
    const lock = { ...compileSchema(config), version: LOCK_VERSION + 1 };
    const check = checkLock(lock, config);
    expect(check.status).toBe('unreadable');
    expect(check).toHaveProperty('message', expect.stringContaining('Upgrade'));
  });

  // The opposite case: this package can write the newer format, so the lock is merely
  // out of date. Telling the author to upgrade tinacms would leave them stuck.
  it('reports a lock written in an older format as stale', () => {
    const lock = { ...compileSchema(config), version: LOCK_VERSION - 1 };
    expect(checkLock(lock, config).status).toBe('stale');
  });

  // `primitives` is parsed JSON, so an inherited key would otherwise resolve against
  // Object.prototype and compare as a pinned version nobody wrote.
  it('does not read prototype keys as pinned versions', () => {
    const lock = compileSchema(
      configWith(
        [{ name: 'title', type: 'constructor' }],
        [fieldPlugin('constructor', 1)]
      )
    );
    expect(
      checkLock(
        lock,
        configWith(
          [{ name: 'title', type: 'constructor' }],
          [fieldPlugin('constructor', 1)]
        )
      )
    ).toEqual({ status: 'current' });
  });
});
