import { describe, expect, it } from 'vitest';
import { type ResolvedConfig, asResolvedConfig } from '../config';
import { definePlugin } from '../core/plugin';
import type { FieldSchema } from '../core/schema/types';
import { LOCK_VERSION, checkLock, compileSchema } from './compile-schema';

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

  it('stamps schema.version with the package version, in the v3 shape', () => {
    const lock = compileSchema(configWith([{ name: 'title', type: 'string' }]));
    const { fullVersion, major, minor, patch } = lock.schema.version;
    expect(fullVersion).toMatch(/^\d+\.\d+\.\d+/);
    expect(fullVersion.startsWith(`${major}.${minor}.${patch}`)).toBe(true);
    expect([major, minor].every((part) => /^\d+$/.test(part))).toBe(true);
  });

  it('references primitives by key and version without inlining them', () => {
    const lock = compileSchema(configWith([{ name: 'title', type: 'string' }]));
    expect(lock.primitives).toEqual({ string: 1 });
    expect(typeof lock.primitives.string).toBe('number');
  });

  it('omits installed field types the schema does not use', () => {
    const lock = compileSchema(configWith([{ name: 'title', type: 'string' }]));
    expect(lock.primitives).not.toHaveProperty('rich-text');
  });

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

  it('reports a lock stamped by an older tinacms as stale', () => {
    const lock = compileSchema(config);
    const stamped = {
      ...lock,
      schema: {
        ...lock.schema,
        version: {
          fullVersion: '4.0.0-alpha.-1',
          major: '4',
          minor: '0',
          patch: '0-alpha',
        },
      },
    };
    expect(checkLock(stamped, config).status).toBe('stale');
  });

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

  it('refuses a lock written in a newer format instead of downgrading it', () => {
    const lock = { ...compileSchema(config), version: LOCK_VERSION + 1 };
    const check = checkLock(lock, config);
    expect(check.status).toBe('unreadable');
    expect(check).toHaveProperty('message', expect.stringContaining('Upgrade'));
  });

  it('reports a lock written in an older format as stale', () => {
    const lock = { ...compileSchema(config), version: LOCK_VERSION - 1 };
    expect(checkLock(lock, config).status).toBe('stale');
  });

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
