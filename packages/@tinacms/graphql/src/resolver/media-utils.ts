/**

*/

import type { GraphQLConfig } from '../types'
import type { Schema } from '@tinacms/schema-tools'

/**
 * Strips away the Tina Cloud Asset URL from an `image` value
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
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (!v || typeof v !== 'string') return v
          const cleanMediaRoot = cleanUpSlashes(
            schema.config.media.tina.mediaRoot
          )
          const strippedURL = v.replace(assetsURL, '')
          return `${cleanMediaRoot}${strippedURL}`
        })
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
      return value
    }

    if (hasTinaMediaConfig(schema) === true) {
      const cleanMediaRoot = cleanUpSlashes(schema.config.media.tina.mediaRoot)
      if (typeof value === 'string') {
        const strippedValue = value.replace(cleanMediaRoot, '')
        return `https://${config.assetsHost}/${config.clientId}${strippedValue}`
      }
      if (Array.isArray(value)) {
        return value.map((v) => {
          if (!v || typeof v !== 'string') return v
          const strippedValue = v.replace(cleanMediaRoot, '')
          return `https://${config.assetsHost}/${config.clientId}${strippedValue}`
        })
      }
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

const hasTinaMediaConfig = (schema: Schema<true>): boolean => {
  if (!schema.config?.media?.tina) return false

  // If they don't have both publicFolder and mediaRoot, they don't have a Tina Media config
  if (
    typeof schema.config?.media?.tina?.publicFolder !== 'string' &&
    typeof schema.config?.media?.tina?.mediaRoot !== 'string'
  )
    return false

  return true
}
