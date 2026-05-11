/**

*/

import { Schema } from '@tinacms/schema-tools';
import type { GraphQLConfig } from '../types';
import {
  resolveMediaRelativeToCloud,
  resolveMediaCloudToRelative,
} from './media-utils';
import { describe, it, expect } from 'vitest';

describe('resolveMedia', () => {
  const schema: Schema<true> = {
    config: {
      branch: '',
      clientId: '',
      token: '',
      build: {
        outputFolder: '',
        publicFolder: '',
      },
      schema: { collections: [] },
      media: {
        tina: {
          publicFolder: 'public',
          mediaRoot: 'uploads',
        },
      },
    },
    collections: [],
  };
  const assetsHost = `assets.tinajs.dev`;
  const clientId = `a03ff3e2-1c3a-41af-8afd-ba0d58853191`;
  const relativeURL = '/uploads/llama.png';
  const cloudURL = `https://${assetsHost}/${clientId}/llama.png`;

  /**
   * When using `useRelativeMedia: true`, the URL should not be changed.
   */
  it('resolves to relative media when useRelativeMedia: true', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: true,
    };

    const resolvedURL = resolveMediaRelativeToCloud(
      relativeURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(relativeURL);
  });

  /**
   * When using `useRelativeMedia: false`, the relative URL should be changed to a Cloud URL.
   */
  it('resolves relative media to cloud media when useRelativeMedia: false', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    };

    const resolvedURL = resolveMediaRelativeToCloud(
      relativeURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(cloudURL);
  });

  /**
   * When using `useRelativeMedia: false`, the Cloud URL should be changed to relative URL.
   */
  it('resolves cloud media to relative media when useRelativeMedia: false', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    };

    const resolvedURL = resolveMediaCloudToRelative(cloudURL, config, schema);
    expect(resolvedURL).toEqual(relativeURL);
  });

  /**
   * A empty value should return empty, regardless of `useRelativeMedia`
   */
  it('resolves to empty when provided an empty value', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    };

    const aURL = resolveMediaCloudToRelative('', config, schema);
    expect(aURL).toEqual('');

    const bURL = resolveMediaRelativeToCloud('', config, schema);
    expect(bURL).toEqual('');
  });

  /**
   * When `branch` equals `mediaBranch`, the URL should be the production CDN URL.
   */
  it('resolves to production cloud URL when branch equals mediaBranch', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
      branch: 'main',
      mediaBranch: 'main',
    };

    const resolvedURL = resolveMediaRelativeToCloud(
      relativeURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(cloudURL);
  });

  /**
   * When `branch` differs from `mediaBranch`, the URL should include the staging prefix.
   */
  it('resolves to staging-prefixed cloud URL when branch differs from mediaBranch', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
      branch: 'feat/x',
      mediaBranch: 'main',
    };

    const resolvedURL = resolveMediaRelativeToCloud(
      relativeURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(
      `https://${assetsHost}/${clientId}/__staging/feat/x/__file/llama.png`
    );
  });

  /**
   * When `branch` is unset, the URL should be the production CDN URL.
   */
  it('resolves to production cloud URL when branch is unset', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
      mediaBranch: 'main',
    };

    const resolvedURL = resolveMediaRelativeToCloud(
      relativeURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(cloudURL);
  });

  /**
   * Array values on a non-`mediaBranch` should each receive the staging prefix.
   */
  it('applies staging prefix to every entry of an array value', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
      branch: 'feat/x',
      mediaBranch: 'main',
    };

    const resolved = resolveMediaRelativeToCloud(
      ['/uploads/a.png', '/uploads/b.png'],
      config,
      schema
    );
    expect(resolved).toEqual([
      `https://${assetsHost}/${clientId}/__staging/feat/x/__file/a.png`,
      `https://${assetsHost}/${clientId}/__staging/feat/x/__file/b.png`,
    ]);
  });

  /**
   * Round-trip: a staging cloud URL should be stripped back to the relative path.
   */
  it('strips staging prefix when converting cloud URL back to relative', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
      branch: 'feat/x',
      mediaBranch: 'main',
    };

    const stagingURL = `https://${assetsHost}/${clientId}/__staging/feat/x/__file/llama.png`;
    const resolvedURL = resolveMediaCloudToRelative(stagingURL, config, schema);
    expect(resolvedURL).toEqual(relativeURL);
  });

  /**
   * Production cloud URLs (no `__staging/` segment) should still strip cleanly.
   */
  it('leaves production cloud URLs untouched when stripping', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
      branch: 'feat/x',
      mediaBranch: 'main',
    };

    const resolvedURL = resolveMediaCloudToRelative(cloudURL, config, schema);
    expect(resolvedURL).toEqual(relativeURL);
  });

  /**
   * A cloud URL whose host doesn't match `config.assetsHost` (e.g. content
   * uploaded against a different stage, or against the dashboard's hardcoded
   * default) should still strip cleanly. The `<clientId>/…` path prefix is the
   * invariant — the host segment can vary across stages.
   */
  it('strips cloud URL whose host differs from config.assetsHost', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    };

    const otherStageURL = `https://assets.tina.io/${clientId}/llama.png`;
    const resolvedURL = resolveMediaCloudToRelative(
      otherStageURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(relativeURL);
  });

  /**
   * Array values containing cloud URLs from a mix of stages should each be
   * stripped to a relative path regardless of which host they were uploaded
   * against.
   */
  it('strips array values with mixed cloud-URL hosts', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    };

    const resolved = resolveMediaCloudToRelative(
      [
        `https://${assetsHost}/${clientId}/a.png`,
        `https://assets.tina.io/${clientId}/b.png`,
        `https://assets-other-stage.tinajs.dev/${clientId}/c.png`,
      ],
      config,
      schema
    );
    expect(resolved).toEqual([
      '/uploads/a.png',
      '/uploads/b.png',
      '/uploads/c.png',
    ]);
  });

  /**
   * Cross-host stripping should still respect the `__staging/{branch}` prefix,
   * so editorial-branch content migrated between stages round-trips correctly.
   */
  it('strips staging prefix from cross-host cloud URLs', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
      branch: 'feat/x',
      mediaBranch: 'main',
    };

    const otherStageStagingURL = `https://assets.tina.io/${clientId}/__staging/feat/x/__file/llama.png`;
    const resolvedURL = resolveMediaCloudToRelative(
      otherStageStagingURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(relativeURL);
  });

  /**
   * URLs whose path doesn't begin with the configured client id (e.g. a
   * non-TinaCloud asset URL or content from a different project) must be left
   * alone.
   */
  it('does not strip URLs that do not match the configured clientId', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    };

    const otherClientURL =
      'https://assets.tina.io/00000000-0000-0000-0000-000000000000/llama.png';
    const resolvedURL = resolveMediaCloudToRelative(
      otherClientURL,
      config,
      schema
    );
    expect(resolvedURL).toEqual(otherClientURL);
  });

  /**
   * Missing `media: { tina: { ... }}` config should return the value, regardless of `useRelativeMedia`
   */
  it('persists value when no `tina` config is provided regardless of `useRelativeMedia`', () => {
    const otherSchema: Schema<true> = {
      config: {
        branch: '',
        clientId: '',
        token: '',
        build: {
          outputFolder: '',
          publicFolder: '',
        },
        schema: { collections: [] },
        // @ts-ignore
        media: {},
      },
      collections: [],
    };
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      assetsHost,
      clientId,
    };

    const resolvedURL = resolveMediaCloudToRelative(
      `https://assets.other-cloud-media-service.com/112233/llama.png`,
      config,
      otherSchema
    );

    expect(resolvedURL).toEqual(
      `https://assets.other-cloud-media-service.com/112233/llama.png`
    );
  });
});
