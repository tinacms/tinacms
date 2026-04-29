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
      const assetsURL = `https://${config.assetsHost}/${config.clientId}`;
      const cleanMediaRoot = cleanUpSlashes(schema.config.media.tina.mediaRoot);

      if (typeof value === 'string' && value.includes(assetsURL)) {
        return `${cleanMediaRoot}${stripStagingPrefix(
          value.replace(assetsURL, '')
        )}`;
      }
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (!v || typeof v !== 'string') return v;
          const strippedURL = v.replace(assetsURL, '');
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

const stagingPrefix = (config: {
  branch?: string;
  mediaBranch?: string;
}): string =>
  config.branch && config.branch !== config.mediaBranch
    ? `/__staging/${encodeURIComponent(config.branch)}`
    : '';

// Matches `/__staging/<encoded-branch>/…` and captures everything after the branch segment.
const STAGING_SEGMENT = /^\/__staging\/[^/]+(\/.*)$/;

const stripStagingPrefix = (path: string): string => {
  const match = path.match(STAGING_SEGMENT);
  return match ? match[1] : path;
};

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
