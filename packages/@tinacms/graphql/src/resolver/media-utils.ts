/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
