import { describe, expect, it } from 'vitest';
import { type ResolvedConfig, asResolvedConfig } from '../config';
import {
  defineHook,
  defineHooksPlugin,
  defineServerHook,
} from '../core/form/hooks';
import { definePlugin } from '../core/plugin';
import {
  defineSearchPlugin,
  searchIndex,
} from '../plugins/search/search.plugin';
import type { SearchFields } from '../core/search/index-contract';
import type { FieldSchema } from '../core/schema/types';
import { tinaCloud } from '../plugins/tinacloud/tinacloud.plugin';
import { LOCK_VERSION, checkLock, compileSchema } from './compile-schema';

const fieldPlugin = (type: string, contractVersion: number) =>
  definePlugin({
    name: `test:field:${type}`,
    provides: ['field'],
    field: { type, contractVersion },
  });

const configWith = (
  fields: FieldSchema[],
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

describe('compileSchema field-level validators', () => {
  const validatorPlugin = definePlugin({
    name: 'test:validators',
    provides: ['validator'],
    validators: ['matches'],
    client: async () => ({ default: {} }),
  });
  const slug: FieldSchema = {
    name: 'slug',
    type: 'string',
    validators: [{ name: 'matches', args: ['^[a-z]+$'] }],
  };

  it('accepts a validator an installed plugin registers', () => {
    const lock = compileSchema(
      configWith([slug], [fieldPlugin('string', 1), validatorPlugin])
    );
    expect(lock.schema.collections[0].fields[0]).toEqual(slug);
  });

  it('rejects a validator no installed plugin registers', () => {
    expect(() =>
      compileSchema(configWith([slug], [fieldPlugin('string', 1)]))
    ).toThrow(/uses the validator "matches"/);
  });

  it('rejects an unregistered validator nested inside a template', () => {
    expect(() =>
      compileSchema(
        configWith(
          [
            {
              name: 'blocks',
              type: 'rich-text',
              templates: [{ name: 'hero', fields: [slug] }],
            },
          ],
          [fieldPlugin('string', 1), fieldPlugin('rich-text', 1)]
        )
      )
    ).toThrow(/uses the validator "matches"/);
  });
});

describe('compileSchema with an array of scalar items', () => {
  const tags = (of: FieldSchema) =>
    ({ name: 'tags', type: 'array', of }) as FieldSchema;

  it('pins the type of the of field', () => {
    const lock = compileSchema(
      configWith(
        [tags({ name: 'tag', type: 'datetime' })],
        [fieldPlugin('array', 1), fieldPlugin('datetime', 2)]
      )
    );
    expect(lock.primitives).toEqual({ array: 1, datetime: 2 });
  });

  it('pins the type of an of field inside a template', () => {
    const lock = compileSchema(
      configWith(
        [
          {
            name: 'blocks',
            type: 'array',
            templates: [
              {
                name: 'gallery',
                fields: [tags({ name: 'at', type: 'datetime' })],
              },
            ],
          },
        ],
        [fieldPlugin('array', 1), fieldPlugin('datetime', 2)]
      )
    );
    expect(lock.primitives).toEqual({ array: 1, datetime: 2 });
  });

  it('rejects an unregistered validator on the of field', () => {
    expect(() =>
      compileSchema(
        configWith(
          [
            tags({
              name: 'tag',
              type: 'string',
              validators: [{ name: 'matches', args: ['^[a-z]+$'] }],
            }),
          ],
          [fieldPlugin('array', 1), fieldPlugin('string', 1)]
        )
      )
    ).toThrow(/uses the validator "matches"/);
  });
});

describe('compileSchema collection-level hooks', () => {
  it('accepts a form hook an installed plugin registers', () => {
    const hookPlugin = definePlugin({
      name: 'test:hooks',
      provides: ['hooks'],
      hooks: ['logSave'],
      client: async () => ({ default: { hooks: { logSave: () => ({}) } } }),
    });
    const lock = compileSchema(
      asResolvedConfig({
        plugins: [fieldPlugin('string', 1), hookPlugin],
        schema: {
          collections: [
            {
              name: 'post',
              format: 'mdx',
              hooks: [{ name: 'logSave', args: ['saved'] }],
              fields: [{ name: 'title', type: 'string' }],
            },
          ],
        },
      })
    );
    expect(lock.schema.collections[0].hooks).toEqual([
      { name: 'logSave', args: ['saved'] },
    ]);
  });

  it('accepts a hook that only has a server side', () => {
    const slug = defineHook('slug', {
      server: async () => ({ default: defineServerHook(() => ({})) }),
    });
    const lock = compileSchema(
      asResolvedConfig({
        plugins: [
          fieldPlugin('string', 1),
          defineHooksPlugin('test:hooks', [slug]),
        ],
        schema: {
          collections: [
            {
              name: 'post',
              format: 'mdx',
              hooks: [slug()],
              fields: [{ name: 'title', type: 'string' }],
            },
          ],
        },
      })
    );
    expect(lock.schema.collections[0].hooks).toEqual([{ name: 'slug' }]);
  });

  it('rejects a form hook no installed plugin registers', () => {
    expect(() =>
      compileSchema(
        asResolvedConfig({
          plugins: [fieldPlugin('string', 1)],
          schema: {
            collections: [
              {
                name: 'post',
                format: 'mdx',
                hooks: [{ name: 'logSave' }],
                fields: [{ name: 'title', type: 'string' }],
              },
            ],
          },
        })
      )
    ).toThrow(/form hook "logSave"/);
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

describe('compileSchema dropped v3 options', () => {
  const plugins = [
    fieldPlugin('string', 1),
    fieldPlugin('object', 1),
    fieldPlugin('array', 1),
  ];
  const dropped = [
    'ui',
    'component',
    'parse',
    'format',
    'validate',
    'min',
    'max',
  ];
  const placements: Record<string, (extra: object) => FieldSchema[]> = {
    'a top-level field': (extra) => [{ name: 'a', type: 'string', ...extra }],
    'a field inside fields': (extra) => [
      {
        name: 'o',
        type: 'object',
        fields: [{ name: 'a', type: 'string', ...extra }],
      } as FieldSchema,
    ],
    'a field inside templates': (extra) => [
      {
        name: 'l',
        type: 'array',
        templates: [
          { name: 't', fields: [{ name: 'a', type: 'string', ...extra }] },
        ],
      } as FieldSchema,
    ],
    'a template': (extra) => [
      {
        name: 'l',
        type: 'array',
        templates: [{ name: 't', fields: [], ...extra }],
      } as FieldSchema,
    ],
    'an of field': (extra) => [
      {
        name: 'l',
        type: 'array',
        of: { name: 'a', type: 'string', ...extra },
      } as FieldSchema,
    ],
  };

  for (const option of dropped) {
    it(`rejects "${option}" at any depth, naming the option`, () => {
      for (const make of Object.values(placements)) {
        expect(() =>
          compileSchema(configWith(make({ [option]: 1 }), plugins))
        ).toThrow(new RegExp(`sets "${option}", which v4 does not have`));
      }
    });
  }

  it('allows a collection format and other plugin-defined keys', () => {
    expect(() =>
      compileSchema(
        configWith(
          [{ name: 'a', type: 'string', pluginOption: 1 } as FieldSchema],
          plugins
        )
      )
    ).not.toThrow();
  });

  it('rejects hidden and description on a scalar array item', () => {
    for (const option of ['hidden', 'description']) {
      expect(() =>
        compileSchema(
          configWith(
            [
              {
                name: 'l',
                type: 'array',
                of: { name: 'a', type: 'string', [option]: true },
              } as FieldSchema,
            ],
            plugins
          )
        )
      ).toThrow(new RegExp(`sets "${option}" on its "of" field`));
    }
  });
});

describe('compileSchema array options', () => {
  const plugins = [fieldPlugin('string', 1), fieldPlugin('array', 1)];
  const blocks = (extra: object): FieldSchema[] => [
    {
      name: 'blocks',
      type: 'array',
      templates: [
        {
          name: 'hero',
          fields: [],
          itemLabel: () => 'x',
          previewImage: 'a.png',
        },
      ],
      ...extra,
    } as unknown as FieldSchema,
  ];

  it('rejects defaultItem on a templates array', () => {
    expect(() =>
      compileSchema(configWith(blocks({ defaultItem: {} }), plugins))
    ).toThrow(/sets "defaultItem" on the array/);
  });

  it('rejects an unknown picker, and a picker on an array without templates', () => {
    expect(() =>
      compileSchema(configWith(blocks({ picker: 'carousel' }), plugins))
    ).toThrow(/"picker" takes "list" or "grid"/);
    expect(() =>
      compileSchema(
        configWith(
          [
            {
              name: 'l',
              type: 'array',
              picker: 'grid',
              fields: [],
            } as FieldSchema,
          ],
          plugins
        )
      )
    ).toThrow(/"picker" takes/);
  });

  it('rejects an object display it does not know, naming the object', () => {
    const objectPlugins = [...plugins, fieldPlugin('object', 1)];
    const object = (extra: object) => [
      { name: 'seo', type: 'object', fields: [], ...extra } as FieldSchema,
    ];
    expect(() =>
      compileSchema(configWith(object({ display: 'tabs' }), objectPlugins))
    ).toThrow(/object "seo".*"display" to "tabs"/);
    for (const display of ['fieldset', 'collapsible', 'drillIn']) {
      expect(() =>
        compileSchema(configWith(object({ display }), objectPlugins))
      ).not.toThrow();
    }
  });

  it('treats an omitted or undefined object display as unset', () => {
    const objectPlugins = [...plugins, fieldPlugin('object', 1)];
    for (const extra of [{}, { display: undefined }] satisfies object[]) {
      expect(() =>
        compileSchema(
          configWith(
            [
              {
                name: 'seo',
                type: 'object',
                fields: [],
                ...extra,
              } as unknown as FieldSchema,
            ],
            objectPlugins
          )
        )
      ).not.toThrow();
    }
  });

  it('leaves picker and of to a non-array field that defines them', () => {
    expect(() =>
      compileSchema(
        configWith(
          [
            {
              name: 'w',
              type: 'wheel',
              picker: 'spin',
              of: { name: 'a', type: 'string', description: 'x' },
            } as FieldSchema,
          ],
          [...plugins, fieldPlugin('wheel', 1)]
        )
      )
    ).not.toThrow();
  });

  it('writes no itemLabel, and no picker when unset, to the lock', () => {
    const lock = JSON.parse(
      JSON.stringify(compileSchema(configWith(blocks({}), plugins)))
    );
    const [template] = lock.schema.collections[0].fields[0].templates;
    expect(template).not.toHaveProperty('itemLabel');
    expect(lock.schema.collections[0].fields[0]).not.toHaveProperty('picker');
  });
});

describe('compileSchema tinaCloud() search fields', () => {
  const withTinaCloud = (
    fields: SearchFields,
    hooks: { name: string }[] = []
  ): ResolvedConfig =>
    asResolvedConfig({
      plugins: [
        fieldPlugin('string', 1),
        tinaCloud({ clientId: 'abc', search: { fields } }),
      ],
      schema: {
        collections: [
          {
            name: 'post',
            path: 'content/posts',
            format: 'md',
            hooks,
            fields: [{ name: 'title', type: 'string' }],
          },
        ],
      },
    });

  it('names tina:tinacloud for an unknown field', () => {
    expect(() => compileSchema(withTinaCloud({ post: { nope: 1 } }))).toThrow(
      /tina:tinacloud.*"nope".*"post"/
    );
  });

  it('refuses searchIndex() on a collection tinaCloud() does not list', () => {
    expect(() => compileSchema(withTinaCloud({}, [searchIndex()]))).toThrow(
      /"post".*searchIndex/
    );
  });

  it('refuses searchIndex() on a listed collection, as no plugin registers the hook', () => {
    expect(() =>
      compileSchema(withTinaCloud({ post: { title: 1 } }, [searchIndex()]))
    ).toThrow(/form hook "searchIndex"/);
  });
});

describe('compileSchema search fields', () => {
  const searchable = (fields: SearchFields) =>
    defineSearchPlugin({
      name: 'test:search',
      fields,
      server: () => import('../test/in-memory-search.server'),
    });
  const fieldTypes = [
    'string',
    'rich-text',
    'boolean',
    'image',
    'reference',
    'object',
    'select',
    'datetime',
    'number',
    'array',
  ];
  const withSearch = (
    fields: SearchFields,
    hooks: { name: string }[] = []
  ): ResolvedConfig =>
    asResolvedConfig({
      plugins: [
        ...fieldTypes.map((type) => fieldPlugin(type, 1)),
        searchable(fields),
      ],
      schema: {
        collections: [
          {
            name: 'post',
            path: 'content/posts',
            format: 'md',
            hooks,
            fields: fieldTypes.map((type) => ({ name: `${type}Field`, type })),
          },
        ],
      },
    });

  it('accepts string and rich-text fields', () => {
    expect(() =>
      compileSchema(
        withSearch({ post: { stringField: 3, ['rich-textField']: 1 } })
      )
    ).not.toThrow();
  });

  it('names the plugin and the collection for an unknown collection', () => {
    expect(() => compileSchema(withSearch({ blog: { title: 1 } }))).toThrow(
      /test:search.*"blog"/
    );
  });

  it('names the field for an unknown field', () => {
    expect(() => compileSchema(withSearch({ post: { nope: 1 } }))).toThrow(
      /test:search.*"nope".*"post"/
    );
  });

  it.each(
    fieldTypes.filter((type) => type !== 'string' && type !== 'rich-text')
  )('refuses a %s field', (type) => {
    expect(() =>
      compileSchema(withSearch({ post: { [`${type}Field`]: 1 } }))
    ).toThrow(new RegExp(`"${type}Field".*"post".*"${type}"`));
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'refuses the weight %s',
    (weight) => {
      expect(() =>
        compileSchema(withSearch({ post: { stringField: weight } }))
      ).toThrow(/"stringField".*"post"/);
    }
  );

  it('refuses a collection that lists searchIndex() without fields', () => {
    expect(() => compileSchema(withSearch({}, [searchIndex()]))).toThrow(
      /"post".*searchIndex/
    );
  });

  it('allows fields for a collection that does not list searchIndex()', () => {
    expect(() =>
      compileSchema(withSearch({ post: { stringField: 1 } }))
    ).not.toThrow();
  });

  it('writes a lock identical to the same project without the search plugin', () => {
    const plain = asResolvedConfig({
      ...withSearch({ post: { stringField: 1 } }),
      plugins: fieldTypes.map((type) => fieldPlugin(type, 1)),
    });
    expect(
      JSON.stringify(compileSchema(withSearch({ post: { stringField: 1 } })))
    ).toBe(JSON.stringify(compileSchema(plain)));
  });

  it.each([
    ['loser then winner', false],
    ['winner then loser', true],
  ])(
    'checks only the fields of a defineSearchPlugin that overrides another (%s)',
    (_order, reversed) => {
      const base = withSearch({});
      const plugins = (winnerFields: SearchFields) => {
        const search = [
          searchable({ missing: { title: 1 } }),
          defineSearchPlugin({
            name: 'test:winner',
            fields: winnerFields,
            server: () => import('../test/in-memory-search.server'),
            overrides: [{ capability: 'search' }],
          }),
        ];
        return [
          ...fieldTypes.map((type) => fieldPlugin(type, 1)),
          ...(reversed ? search.reverse() : search),
        ];
      };
      expect(() =>
        compileSchema(
          asResolvedConfig({
            ...base,
            plugins: plugins({ post: { stringField: 1 } }),
          })
        )
      ).not.toThrow();
      expect(() =>
        compileSchema(
          asResolvedConfig({ ...base, plugins: plugins({ post: { nope: 1 } }) })
        )
      ).toThrow(/test:winner.*"nope"/);
    }
  );

  it('does not check the fields of a plugin that lost search to an override', () => {
    const config = asResolvedConfig({
      ...withSearch({}),
      plugins: [
        ...fieldTypes.map((type) => fieldPlugin(type, 1)),
        searchable({ missing: { title: 1 } }),
        definePlugin({
          name: 'test:winner',
          provides: ['search'],
          overrides: [{ capability: 'search' }],
        }),
      ],
    });
    expect(() => compileSchema(config)).not.toThrow();
  });
});
