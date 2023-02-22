/**

*/

import type { GraphQLConfig } from '../types'
import type { TinaCloudSchemaEnriched } from '@tinacms/schema-tools'

/**
 * Strips away the Tina Cloud Asset URL from an `image` value
 *
 * @param {string} value
 * @param {GraphQLConfig} config
 * @returns {string}
 */

export const resolveMediaCloudToRelative = (
  value: string,
  config: GraphQLConfig = { useRelativeMedia: true },
  schema: TinaCloudSchemaEnriched
) => {
  if (config && value) {
    if (config.useRelativeMedia === true) {
      return value
    }

    if (hasTinaMediaConfig(schema) === true) {
      const assetsURL = `https://${config.assetsHost}/${config.clientId}`
      if (typeof value === 'string' && value.includes(assetsURL)) {
        const cleanMediaRoot = cleanUpSlashes(
          schema.config.media.tina.mediaRoot
        )
        const strippedURL = value.replace(assetsURL, '')
        return `${cleanMediaRoot}${strippedURL}`
      }

      return value
    }

    return value
  } else {
    return value
  }
}

/**
 * Adds Tina Cloud Asset URL to an `image` value
 *
 * @param {string} value
 * @param {GraphQLConfig} config
 * @returns {string}
 */

export const resolveMediaRelativeToCloud = (
  value: string,
  config: GraphQLConfig = { useRelativeMedia: true },
  schema: TinaCloudSchemaEnriched
) => {
  if (config && value) {
    if (config.useRelativeMedia === true) {
      return value
    }

    if (hasTinaMediaConfig(schema) === true) {
      const cleanMediaRoot = cleanUpSlashes(schema.config.media.tina.mediaRoot)
      const strippedValue = value.replace(cleanMediaRoot, '')
      return `https://${config.assetsHost}/${config.clientId}${strippedValue}`
    }

    return value
  } else {
    return value
  }
}

const cleanUpSlashes = (path: string): string => {
  if (path) {
    return `/${path.replace(/^\/+|\/+$/gm, '')}`
  }
  return ''
}

const hasTinaMediaConfig = (schema: TinaCloudSchemaEnriched): boolean => {
  if (
    schema.config?.media?.tina?.publicFolder &&
    schema.config?.media?.tina?.mediaRoot
  ) {
    return true
  }

  return false
}
