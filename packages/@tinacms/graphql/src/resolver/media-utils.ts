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
  if (config && value) {
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
  if (config && value) {
    if (config.useRelativeMedia === true) {
      return value
    } else {
      return `https://${config.assetsHost}/${config.clientId}${value}`
    }
  } else {
    return value
  }
}
