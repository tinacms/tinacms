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
      `https://${assetsHost}/${clientId}/__staging/feat%2Fx/llama.png`
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
      `https://${assetsHost}/${clientId}/__staging/feat%2Fx/a.png`,
      `https://${assetsHost}/${clientId}/__staging/feat%2Fx/b.png`,
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

    const stagingURL = `https://${assetsHost}/${clientId}/__staging/feat%2Fx/llama.png`;
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
