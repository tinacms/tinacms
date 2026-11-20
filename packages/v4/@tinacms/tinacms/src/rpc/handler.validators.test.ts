import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContentSaveInput } from '../core/content/contract';
import type { ValidatorFactory } from '../core/field/contract';
import { defineHook, defineHooksPlugin } from '../core/form/hooks';
import { definePlugin } from '../core/plugin';
import type {
  CollectionSchema,
  FieldSchema,
  ValidatorRef,
} from '../core/schema/types';
import booleanFieldPlugin from '../plugins/fields/boolean/boolean-field.plugin';
import objectFieldPlugin from '../plugins/fields/object/object-field.plugin';
import richTextFieldPlugin from '../plugins/fields/rich-text/rich-text-field.plugin';
import coreValidatorsPlugin from '../plugins/validators/core-validators.plugin';
import {
  type Session,
  defineServerHook,
  defineServerPlugin,
  toUserId,
} from '../server';
import { createRpcHandler } from './handler';

const session: Session = {
  identity: { id: toUserId('ada') },
  roles: ['admin'],
};

const contentPlugin = (update: (input: ContentSaveInput) => Promise<unknown>) =>
  definePlugin({
    name: 'test:cloud',
    provides: ['content', 'auth'],
    server: async () => ({
      default: defineServerPlugin({
        getSession: async () => session,
        update,
      }),
    }),
  });

const field = (
  type: string,
  name: string,
  rest: Partial<FieldSchema> & Record<string, unknown> = {}
): FieldSchema => ({ type, name, ...rest });

const required = (): ValidatorRef => ({ name: 'required' });

// A custom rule with a server factory that is stricter than any form rule.
const customPlugin = (
  factories: Record<string, ValidatorFactory>,
  names = Object.keys(factories)
) =>
  definePlugin({
    name: 'test:validators',
    provides: ['validator'],
    validators: names,
    server: async () => ({
      default: defineServerPlugin({ validators: factories }),
    }),
  });

const after: ValidatorFactory =
  (other) =>
  (value, { siblings }) =>
    typeof value === 'string' && value <= String(siblings[String(other)])
      ? `Must be after ${other}`
      : null;

const record = vi.fn();
const recording: ValidatorFactory = () => (value) => {
  record('validator', value);
  return null;
};

const recordingHooks = defineHooksPlugin('test:hooks', [
  defineHook('rec', {
    server: async () => ({
      default: defineServerHook(() => ({
        beforeSave: (document) => {
          record('hook');
          return document;
        },
      })),
    }),
  }),
]);

const setup = (
  collection: Partial<CollectionSchema> & { fields: FieldSchema[] },
  extra: ReturnType<typeof definePlugin>[] = [],
  options: { withSchema?: boolean } = {}
) => {
  const update = vi.fn(async (input: ContentSaveInput) => ({
    path: input.path,
    document: input.value,
  }));
  const handler = createRpcHandler({
    plugins: [
      contentPlugin(update),
      coreValidatorsPlugin,
      booleanFieldPlugin,
      objectFieldPlugin,
      richTextFieldPlugin,
      ...extra,
    ],
    ...(options.withSchema === false
      ? {}
      : {
          schema: {
            collections: [{ name: 'post', format: 'mdx', ...collection }],
          },
        }),
  });
  const save = (value: Record<string, unknown>, namespace = 'content') =>
    handler(
      new Request(`http://localhost/api/tina/${namespace}/update`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          collection: 'post',
          path: 'content/posts/a.mdx',
          value,
        }),
      })
    );
  return { save, update, handler };
};

afterEach(() => {
  record.mockClear();
  vi.restoreAllMocks();
});

describe('the Backend runs validators before a save', () => {
  it('runs the validators before the server hooks, and the hook sees a valid document only', async () => {
    const { save, update } = setup(
      {
        fields: [field('string', 'title', { validators: [{ name: 'rec' }] })],
        hooks: [{ name: 'rec' }],
      },
      [customPlugin({ rec: recording }), recordingHooks]
    );
    const response = await save({ title: 'Hi' });
    expect(response.status).toBe(200);
    expect(record.mock.calls.map(([kind]) => kind)).toEqual([
      'validator',
      'hook',
    ]);
    expect(update.mock.calls[0][0].value).toEqual({ title: 'Hi' });
  });

  it('answers 422 validation with the fields, and runs no hook and no write', async () => {
    const { save, update } = setup(
      {
        fields: [
          field('string', 'title', {
            validators: [required(), { name: 'rec' }],
          }),
          field('string', 'publishDate', {
            validators: [{ name: 'after', args: ['startDate'] }],
          }),
        ],
        hooks: [{ name: 'rec' }],
      },
      [customPlugin({ rec: recording, after }), recordingHooks]
    );
    const response = await save({
      title: '',
      publishDate: '2026-01-01',
      startDate: '2026-02-01',
    });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: {
        code: 'validation',
        message: 'Some fields are not valid. Fix them and try again.',
        fieldErrors: {
          title: ['title is required'],
          publishDate: ['Must be after startDate'],
        },
      },
    });
    expect(record).not.toHaveBeenCalledWith('hook');
    expect(update).not.toHaveBeenCalled();
  });

  it('runs the four built-ins with no setup, keyed by address', async () => {
    const { save, update } = setup({
      fields: [
        field('string', 'a', { validators: [required()] }),
        field('string', 'b', { validators: [{ name: 'min', args: [3] }] }),
        field('string', 'c', { validators: [{ name: 'max', args: [2] }] }),
        field('string', 'd', {
          validators: [{ name: 'pattern', args: ['^x$'] }],
        }),
      ],
    });
    const response = await save({ a: '', b: 'ab', c: 'abc', d: 'y' });
    expect(response.status).toBe(422);
    expect((await response.json()).error.fieldErrors).toEqual({
      a: ['a is required'],
      b: ['b must be at least 3 characters'],
      c: ['c must be at most 2 characters'],
      d: ['d is invalid'],
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('writes a valid document once, as the browser sent it', async () => {
    const { save, update } = setup({
      fields: [field('string', 'title', { validators: [required()] })],
    });
    const response = await save({ title: 'Hello', extra: 1 });
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0].value).toEqual({ title: 'Hello', extra: 1 });
  });

  it('lists every message of every failing field in one 422', async () => {
    const { save } = setup({
      fields: [
        field('string', 'title', {
          validators: [required(), { name: 'min', args: [3] }],
        }),
        field('string', 'slug', { validators: [required()] }),
      ],
    });
    const response = await save({ title: '', slug: '' });
    const { fieldErrors } = (await response.json()).error;
    expect(fieldErrors.title).toHaveLength(1);
    expect(Object.keys(fieldErrors)).toEqual(['title', 'slug']);
  });

  it('keys list items by index and gives each rule its own siblings', async () => {
    const { save } = setup(
      {
        fields: [
          field('array', 'authors', {
            fields: [
              field('string', 'name'),
              field('string', 'alias', {
                validators: [{ name: 'differ', args: ['name'] }],
              }),
            ],
          }),
        ],
      },
      [
        customPlugin({
          differ:
            (other) =>
            (value, { siblings }) =>
              value && value === siblings[String(other)] ? 'Must differ' : null,
        }),
      ]
    );
    const response = await save({
      authors: [
        { name: 'a', alias: 'x' },
        { name: 'b', alias: 'b' },
      ],
    });
    expect((await response.json()).error.fieldErrors).toEqual({
      'authors.1.alias': ['Must differ'],
    });
  });

  it('checks fields inside objects, `of` items and one template of a blocks list', async () => {
    const { save } = setup({
      fields: [
        field('object', 'seo', {
          fields: [
            field('object', 'og', {
              fields: [field('string', 'title', { validators: [required()] })],
            }),
          ],
        }),
        field('array', 'tags', {
          of: field('string', 'tag', { validators: [required()] }),
        }),
        field('array', 'blocks', {
          templates: [
            {
              name: 'hero',
              fields: [
                field('string', 'headline', { validators: [required()] }),
              ],
            },
            { name: 'cta', fields: [field('string', 'label')] },
          ],
        }),
      ],
    });
    const response = await save({
      seo: { og: {} },
      tags: ['a', ''],
      blocks: [{ _template: 'cta' }, { _template: 'hero', headline: '' }],
    });
    expect(
      Object.keys((await response.json()).error.fieldErrors).sort()
    ).toEqual(['blocks.1.headline', 'seo.og.title', 'tags.1']);
  });

  it('skips hidden, disabled and read-only fields and their children, and never fails a boolean', async () => {
    const { save, update } = setup({
      fields: [
        field('string', 'a', { hidden: true, validators: [required()] }),
        field('string', 'b', { disabled: true, validators: [required()] }),
        field('object', 'c', {
          readOnly: true,
          fields: [field('string', 'inner', { validators: [required()] })],
        }),
        field('boolean', 'flag', { validators: [required()] }),
      ],
    });
    expect((await save({})).status).toBe(200);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('treats the stored source of an empty rich-text body as empty, and never measures it', async () => {
    const { save } = setup({
      fields: [
        field('rich-text', 'body', {
          validators: [required(), { name: 'min', args: [100] }],
        }),
      ],
    });
    for (const body of [undefined, '', '\n  \n']) {
      const response = await save(body === undefined ? {} : { body });
      expect(response.status).toBe(422);
      expect((await response.json()).error.fieldErrors).toEqual({
        body: ['body is required'],
      });
    }
    expect((await save({ body: 'Some text' })).status).toBe(200);
  });

  it('does not walk deeper than the schema', async () => {
    const { save } = setup({
      fields: [field('string', 'title', { validators: [required()] })],
    });
    const deep: Record<string, unknown> = {};
    let cursor = deep;
    for (let depth = 0; depth < 5000; depth += 1) {
      cursor.next = {};
      cursor = cursor.next as Record<string, unknown>;
    }
    const response = await save({ title: deep });
    expect(response.status).toBe(200);
  });

  it('answers a generic 500 for a validator that throws or returns a non-message', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { save, update } = setup(
      {
        fields: [
          field('string', 'a', { validators: [{ name: 'boom' }] }),
          field('string', 'b', { validators: [{ name: 'later' }] }),
        ],
      },
      [
        customPlugin({
          boom: () => () => {
            throw new Error('secret internals');
          },
          later: () => (() => Promise.resolve('x')) as never,
        }),
      ]
    );
    const thrown = await save({ a: 'x', b: 'y' });
    expect(thrown.status).toBe(500);
    expect(await thrown.text()).not.toContain('secret internals');
    const returned = await save({ a: undefined, b: 'y' });
    expect(returned.status).toBe(500);
    expect(update).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
  });

  it('does not route the reserved validators key', async () => {
    const { handler } = setup({ fields: [] });
    const response = await handler(
      new Request('http://localhost/api/tina/content/validators', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
    );
    expect(response.status).toBe(404);
  });
});

describe('composition of validators', () => {
  const composeError = async (...extra: ReturnType<typeof definePlugin>[]) => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { save } = setup({ fields: [] }, extra);
    const response = await save({});
    const [, cause] = consoleError.mock.calls[0] ?? [];
    return {
      status: response.status,
      message: String((cause as Error)?.message),
    };
  };

  it('fails, naming the plugin, for a validators plugin with no server segment', async () => {
    const result = await composeError(
      definePlugin({
        name: 'acme:rules',
        validators: ['acme.x'],
        client: async () => ({ default: {} }),
      })
    );
    expect(result.status).toBe(500);
    expect(result.message).toContain('acme:rules');
    expect(result.message).toContain('acme.x');
  });

  it('fails for a declared name with no server factory', async () => {
    const result = await composeError(
      customPlugin({ one: recording }, ['one', 'two'])
    );
    expect(result.message).toContain('"two"');
  });

  it('fails for a server factory the manifest does not declare', async () => {
    const result = await composeError(
      customPlugin({ one: recording, extra: recording }, ['one'])
    );
    expect(result.message).toContain('"extra"');
  });

  it('fails for a client-only override of a built-in name', async () => {
    const result = await composeError(
      definePlugin({
        name: 'acme:required',
        provides: ['validator'],
        validators: ['required'],
        overrides: [{ capability: 'validator', key: 'required' }],
        client: async () => ({ default: {} }),
      })
    );
    expect(result.message).toContain('acme:required');
  });

  it('needs no schema for the core validators alone, and needs one for a custom validator', async () => {
    const core = setup({ fields: [] }, [], { withSchema: false });
    expect((await core.save({})).status).toBe(200);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const custom = setup({ fields: [] }, [customPlugin({ one: recording })], {
      withSchema: false,
    });
    expect((await custom.save({})).status).toBe(500);
    expect(String(consoleError.mock.calls[0]?.[1])).toContain(
      'custom validator'
    );
  });
});
