import { describe, expect, it } from 'vitest';
import { composeConfig, defineConfig } from './config';
import { definePlugin } from './core/plugin';
import type { FieldSchema } from './core/schema/types';
import { corePlugins, t } from './plugins/fields';

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
});

const mediaPlugin = definePlugin({ name: 'test:media', provides: ['media'] });

const schema = { collections: [] };

const namesOf = (plugins: { name: string }[]) =>
  plugins.map((plugin) => plugin.name);

describe('defineConfig', () => {
  it('installs the built-in field plugins without being asked', () => {
    const { plugins } = defineConfig({
      plugins: [contentPlugin, mediaPlugin],
      schema,
    });
    expect(namesOf(plugins)).toEqual([
      ...namesOf(corePlugins),
      'test:content',
      'test:media',
    ]);
  });

  it('lets a plugin of the same name replace a built-in', () => {
    const customString = definePlugin({
      name: 'tina:field:string',
      provides: ['field'],
      field: { type: 'string', contractVersion: 1 },
    });
    const { plugins } = defineConfig({
      plugins: [contentPlugin, customString],
      schema,
    });
    expect(
      plugins.filter((plugin) => plugin.name === 'tina:field:string')
    ).toEqual([customString]);
  });

  it('rejects a config with no content provider', () => {
    expect(() => defineConfig({ schema })).toThrow(
      /provides the "content" capability/
    );
  });

  it('rejects a capability conflict at config time', () => {
    const second = definePlugin({
      name: 'other:content',
      provides: ['content'],
    });
    expect(() =>
      defineConfig({ plugins: [contentPlugin, second], schema })
    ).toThrow(/Two plugins provide the "content" capability/);
  });

  it('rejects a dependency no installed plugin provides', () => {
    const needsMedia = definePlugin({
      name: 'test:image',
      provides: ['field'],
      field: { type: 'image', contractVersion: 1 },
      dependsOn: ['media'],
    });
    expect(() =>
      defineConfig({ plugins: [contentPlugin, needsMedia], schema })
    ).toThrow(/depends on the "media" capability/);
  });
});

describe('core plugins with unmet dependencies', () => {
  const imageCore = definePlugin({
    name: 'test:field:image',
    provides: ['field'],
    field: { type: 'image', contractVersion: 1 },
    dependsOn: ['media'],
  });

  const schemaWith = (fields: FieldSchema[]) => ({
    collections: [{ name: 'post', format: 'md' as const, fields }],
  });

  it('leaves out a core plugin whose dependency nothing provides', () => {
    const { plugins } = composeConfig({ plugins: [contentPlugin], schema }, [
      imageCore,
    ]);
    expect(namesOf(plugins)).toEqual(['test:content']);
  });

  it('keeps a core plugin once a plugin provides its dependency', () => {
    const { plugins } = composeConfig(
      { plugins: [contentPlugin, mediaPlugin], schema },
      [imageCore]
    );
    expect(namesOf(plugins)).toEqual([
      'test:field:image',
      'test:content',
      'test:media',
    ]);
  });

  it('leaves out a core plugin that needs one left out before it', () => {
    const searchCore = definePlugin({
      name: 'test:search',
      provides: ['search'],
      dependsOn: ['media'],
    });
    const needsSearch = definePlugin({
      name: 'test:needs-search',
      dependsOn: ['search'],
    });
    const { plugins } = composeConfig({ plugins: [contentPlugin], schema }, [
      needsSearch,
      searchCore,
    ]);
    expect(namesOf(plugins)).toEqual(['test:content']);
  });

  it('accepts a used field type that a user plugin provides', () => {
    const cloudImage = definePlugin({
      name: 'acme:field:image',
      provides: ['field'],
      field: { type: 'image', contractVersion: 1 },
    });
    const { plugins } = composeConfig(
      {
        plugins: [contentPlugin, cloudImage],
        schema: schemaWith([{ name: 'hero', type: 'image' }]),
      },
      [imageCore]
    );
    expect(namesOf(plugins)).toEqual(['test:content', 'acme:field:image']);
  });

  it.each([
    ['without media', [contentPlugin]],
    ['with media', [contentPlugin, mediaPlugin]],
  ])('lets a user plugin replace the core one by name, %s', (_label, base) => {
    const replacement = definePlugin({
      name: 'test:field:image',
      provides: ['field'],
      field: { type: 'image', contractVersion: 1 },
    });
    const { plugins } = composeConfig(
      {
        plugins: [...base, replacement],
        schema: schemaWith([{ name: 'hero', type: 'image' }]),
      },
      [imageCore]
    );
    expect(plugins.filter((plugin) => plugin.field?.type === 'image')).toEqual([
      replacement,
    ]);
  });

  it.each<[string, FieldSchema[]]>([
    ['at the top level', [{ name: 'hero', type: 'image' }]],
    [
      'inside an object',
      [t.object({ name: 'hero', fields: [{ name: 'src', type: 'image' }] })],
    ],
    [
      'inside an array',
      [t.array({ name: 'gallery', fields: [{ name: 'src', type: 'image' }] })],
    ],
    [
      'inside a template',
      [
        {
          name: 'body',
          type: 'rich-text',
          templates: [
            { name: 'figure', fields: [{ name: 'src', type: 'image' }] },
          ],
        },
      ],
    ],
  ])(
    'names the missing capability for a field type used %s',
    (_where, fields) => {
      expect(() =>
        composeConfig(
          { plugins: [contentPlugin], schema: schemaWith(fields) },
          [imageCore]
        )
      ).toThrow(
        '`image` fields need a media plugin, e.g. localMediaPlugin(). Add a ' +
          'plugin that provides the "media" capability to `plugins`.'
      );
    }
  );
});

describe('the built-in image field', () => {
  const imageSchema = {
    collections: [
      {
        name: 'post',
        format: 'md' as const,
        fields: [t.image({ name: 'hero' })],
      },
    ],
  };

  it('installs only alongside a media plugin', () => {
    expect(
      namesOf(defineConfig({ plugins: [contentPlugin], schema }).plugins)
    ).not.toContain('tina:field:image');
    expect(
      namesOf(
        defineConfig({ plugins: [contentPlugin, mediaPlugin], schema }).plugins
      )
    ).toContain('tina:field:image');
  });

  it('asks for a media plugin when the schema uses t.image', () => {
    expect(() =>
      defineConfig({ plugins: [contentPlugin], schema: imageSchema })
    ).toThrow(
      /`image` fields need a media plugin, e\.g\. localMediaPlugin\(\)/
    );
  });
});

describe('defineConfig schema validation', () => {
  it.each([
    ['a schema with no collections', {} as never],
    ['collections that are not an array', { collections: {} } as never],
  ])('rejects %s', (_label, badSchema) => {
    expect(() =>
      defineConfig({ plugins: [contentPlugin], schema: badSchema })
    ).toThrow(/collections` must be an array/);
  });
});
