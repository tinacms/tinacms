import { describe, expect, it } from 'vitest';
import { defineConfig } from './config';
import { definePlugin } from './core/plugin';
import { corePlugins } from './plugins/fields';

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
});

const schema = { collections: [] };

const namesOf = (plugins: { name: string }[]) =>
  plugins.map((plugin) => plugin.name);

describe('defineConfig', () => {
  it('installs the built-in field plugins without being asked', () => {
    const { plugins } = defineConfig({ plugins: [contentPlugin], schema });
    expect(namesOf(plugins)).toEqual([...namesOf(corePlugins), 'test:content']);
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

  // Which Data Layer you are on has no sane default, so it is the one required entry.
  it('rejects a config with no content provider', () => {
    expect(() => defineConfig({ schema })).toThrow(
      /provides the "content" capability/
    );
  });

  // The graph pass runs here rather than at boot, so a broken config fails when
  // tina/config.ts is imported.
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
