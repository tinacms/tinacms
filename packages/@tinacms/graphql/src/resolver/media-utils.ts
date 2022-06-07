import { GraphQLConfig } from '../types'

/**
 * Strips away the Tina Cloud Asset URL from an `image` value
 *
 * @param {string} value
 * @param {GraphQLConfig} config
 * @returns {string}
 */

export const resolveMediaCloudToRelative = (
  value: string,
  config: GraphQLConfig = { useRelativeMedia: true }
) => {
  if (config) {
    if (config.useRelativeMedia === true) {
      return value
    } else {
      const assetsURL = `https://${config.assetsHost}/${config.clientId}`
      if (typeof value === 'string' && value.includes(assetsURL)) {
        return value.replace(assetsURL, '')
      } else {
        return value
      }
    }
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
  config: GraphQLConfig = { useRelativeMedia: true }
) => {
  if (config) {
    if (config.useRelativeMedia === true) {
      return value
    } else {
      return `https://${config.assetsHost}/${config.clientId}/${value}`
    }
  } else {
    return value
  }
}
