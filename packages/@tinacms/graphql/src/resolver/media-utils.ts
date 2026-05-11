/**
 * @license
 * Copyright 2023 Forestry.io Holdings, Inc.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Schema } from '@tinacms/schema-tools';
import type { GraphQLConfig } from '../types';

/**
 * Strips away the TinaCloud Asset URL from an `image` value
 *
 * @param {string | string[]} value
 * @param {GraphQLConfig} config
 * @returns {string}
 */

export const resolveMediaCloudToRelative = (
  value: string | string[],
  config: GraphQLConfig = { useRelativeMedia: true },
  schema: Schema<true>
) => {
  if (config && value) {
    if (config.useRelativeMedia === true) {
      return value;
    }

    if (hasTinaMediaConfig(schema) === true) {
      const cleanMediaRoot = cleanUpSlashes(schema.config.media.tina.mediaRoot);
      const cloudUrl = cloudUrlPattern(config.clientId);

      if (typeof value === 'string' && cloudUrl.test(value)) {
        return `${cleanMediaRoot}${stripStagingPrefix(
          value.replace(cloudUrl, '')
        )}`;
      }
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (!v || typeof v !== 'string') return v;
          if (!cloudUrl.test(v)) return v;
          const strippedURL = v.replace(cloudUrl, '');
          return `${cleanMediaRoot}${stripStagingPrefix(strippedURL)}`;
        });
      }

      return value;
    }

    return value;
  } else {
    return value;
  }
};

/**
 * Adds TinaCloud Asset URL to an `image` value
 *
 * @param {string | string[]} value
 * @param {GraphQLConfig} config
 * @returns {string}
 */

export const resolveMediaRelativeToCloud = (
  value: string | string[],
  config: GraphQLConfig = { useRelativeMedia: true },
  schema: Schema<true>
) => {
  if (config && value) {
    if (config.useRelativeMedia === true) {
      return value;
    }

    if (hasTinaMediaConfig(schema) === true) {
      const cleanMediaRoot = cleanUpSlashes(schema.config.media.tina.mediaRoot);
      const prefix = stagingPrefix(config);
      if (typeof value === 'string') {
        const strippedValue = value.replace(cleanMediaRoot, '');
        return `https://${config.assetsHost}/${config.clientId}${prefix}${strippedValue}`;
      }
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (!v || typeof v !== 'string') return v;
          const strippedValue = v.replace(cleanMediaRoot, '');
          return `https://${config.assetsHost}/${config.clientId}${prefix}${strippedValue}`;
        });
      }
    }

    return value;
  } else {
    return value;
  }
};

// Branches may contain `/` (e.g. `feat/my-branch`). Storing them URL-encoded
// would break the CDN read path because CloudFront decodes paths before
// downstream components see them — the write would have `%2F` literal in the
// S3 key but every read would look for the decoded `/` form. Instead we let
// the branch contribute its natural `/` segments and use a `__file` prefix to
// delimit where the (possibly multi-segment) branch ends and the file path
// begins.
const stagingPrefix = (config: {
  branch?: string;
  mediaBranch?: string;
}): string =>
  config.branch && config.branch !== config.mediaBranch
    ? `/__staging/${config.branch}/__file`
    : '';

// Matches `/__staging/<branch (possibly multi-segment)>/__file/<rest>` and
// captures everything after the `__file` segment. Non-greedy so the branch
// can span multiple `/` segments.
const STAGING_SEGMENT = /^\/__staging\/.+?\/__file(\/.*)$/;

const stripStagingPrefix = (path: string): string => {
  const match = path.match(STAGING_SEGMENT);
  return match ? match[1] : path;
};

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Matches a TinaCloud cloud URL for the given client. The host segment varies
// across stages (e.g. `assets.tina.io`, `assets-{stage}.tinajs.dev`); the
// `<clientId>/…` path prefix is the durable invariant.
const cloudUrlPattern = (clientId: string): RegExp =>
  new RegExp(`^https://[^/]+/${escapeRegExp(clientId)}`);

const cleanUpSlashes = (path: string): string => {
  if (path) {
    return `/${path.replace(/^\/+|\/+$/gm, '')}`;
  }
  return '';
};

const hasTinaMediaConfig = (schema: Schema<true>): boolean => {
  if (!schema.config?.media?.tina) return false;

  // If they don't have both publicFolder and mediaRoot, they don't have a Tina Media config
  if (
    typeof schema.config?.media?.tina?.publicFolder !== 'string' &&
    typeof schema.config?.media?.tina?.mediaRoot !== 'string'
  )
    return false;

  return true;
};
