import { describe, expect, it } from 'vitest';
import { defineConfig } from '../../config';
import { localMediaPlugin } from '../../plugins/media/local/local-media.plugin';
import { tinaCloud } from '../../plugins/tinacloud/tinacloud.plugin';
import { createTinaStore } from '../../store/create-store';
import {
  type PluginManifest,
  definePlugin,
  resolveClientSegments,
} from '../plugin';
import type { MediaSlice } from './contract';
import { resolveMediaUrl } from './resolve-media-url';

const contentPlugin = definePlugin({
  name: 'test:content',
  provides: ['content'],
});

const configWith = (...plugins: PluginManifest[]) =>
  defineConfig({
    plugins: [contentPlugin, ...plugins],
    schema: { collections: [] },
  });

const tinaCloudPlugin = tinaCloud({
  clientId: 'abc',
  getToken: () => 'secret',
});

const mountedMedia = async (plugin: PluginManifest) => {
  const store = createTinaStore(await resolveClientSegments([plugin]));
  const media = () => store.getState().media as unknown as MediaSlice;
  return { store, media };
};

describe('resolveMediaUrl', () => {
  it('serves a local media path from the media root', () => {
    expect(
      resolveMediaUrl(configWith(localMediaPlugin()), 'posts/my hero.jpg')
    ).toBe('/uploads/posts/my%20hero.jpg');
    expect(
      resolveMediaUrl(
        configWith(localMediaPlugin({ mediaRoot: 'media' })),
        'hero.jpg'
      )
    ).toBe('/media/hero.jpg');
  });

  it('ignores transforms for local media', () => {
    expect(
      resolveMediaUrl(configWith(localMediaPlugin()), 'hero.jpg', {
        width: 400,
      })
    ).toBe('/uploads/hero.jpg');
  });

  it('serves a TinaCloud media path from the CDN, with transforms', () => {
    const config = configWith(tinaCloudPlugin);
    expect(resolveMediaUrl(config, 'posts/hero.jpg')).toBe(
      'https://assets.tina.io/abc/posts/hero.jpg'
    );
    expect(
      resolveMediaUrl(config, 'hero.jpg', { width: 400, height: 300 })
    ).toBe('https://assets.tina.io/abc/hero.jpg?fit=crop&max-w=400&max-h=300');
  });

  it('uses the plugin that overrides media', () => {
    const custom = definePlugin({
      name: 'test:media',
      provides: ['media'],
      overrides: [{ capability: 'media' }],
      media: { resolveUrl: (path) => `https://cdn.test/${path}` },
    });
    expect(
      resolveMediaUrl(configWith(localMediaPlugin(), custom), 'hero.jpg')
    ).toBe('https://cdn.test/hero.jpg');
  });

  it('fails when no media plugin is installed', () => {
    expect(() => resolveMediaUrl(configWith(), 'hero.jpg')).toThrow(
      /media-capability-missing/
    );
  });

  it('fails when the media plugin has no manifest resolver', () => {
    const bare = definePlugin({ name: 'test:media', provides: ['media'] });
    expect(() => resolveMediaUrl(configWith(bare), 'hero.jpg')).toThrow(
      /Plugin "test:media" provides "media" but sets no `media.resolveUrl`/
    );
  });

  it('reads a TinaCloud branch from its staging folder', () => {
    expect(
      resolveMediaUrl(configWith(tinaCloudPlugin), 'hero.jpg', {
        branch: 'feat/x',
        width: 75,
      })
    ).toBe(
      'https://assets.tina.io/abc/__staging/feat/x/__file/hero.jpg?fit=crop&max-w=75'
    );
  });

  it('ignores the branch for local media', () => {
    expect(
      resolveMediaUrl(configWith(localMediaPlugin()), 'hero.jpg', {
        branch: 'feat/x',
      })
    ).toBe('/uploads/hero.jpg');
  });

  it.each([
    ['localMediaPlugin()', localMediaPlugin()],
    ['tinaCloud()', tinaCloudPlugin],
  ])('gives the same URL as the %s editor slice', async (_name, plugin) => {
    const { media } = await mountedMedia(plugin);
    const config = configWith(plugin);
    for (const options of [undefined, { width: 75, height: 75 }]) {
      expect(resolveMediaUrl(config, 'posts/my hero.jpg', options)).toBe(
        media().resolveUrl('posts/my hero.jpg', options)
      );
    }
  });

  it('gives the TinaCloud slice URL for the branch in the store', async () => {
    const { store, media } = await mountedMedia(tinaCloudPlugin);
    store.setState({ branch: { name: 'feat/x' } });
    const branch = media().mediaBranch?.();
    expect(branch).toBe('feat/x');
    expect(
      resolveMediaUrl(configWith(tinaCloudPlugin), 'posts/hero.jpg', {
        branch,
        width: 400,
      })
    ).toBe(media().resolveUrl('posts/hero.jpg', { width: 400 }));
  });
});
