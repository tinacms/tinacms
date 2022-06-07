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
import {
  resolveMediaRelativeToCloud,
  resolveMediaCloudToRelative,
} from './media-utils'

describe('resolveMedia', () => {
  const relativeAssetURL = `/MySweetImage.png`
  const tinaCloudAssetURL = `https://assets-host.com/0000-1111-2222-3333/MySweetImage.png`

  /**
   * When using `useRelativeMedia: true`, the URL should not be changed.
   */
  it('resolves relative media when useRelativeMedia: true', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: true,
    }
    const resolvedURL = resolveMediaRelativeToCloud(relativeAssetURL, config)
    expect(resolvedURL).toEqual(resolvedURL)
  })

  /**
   * When using `useRelativeMedia: false`, the relative URL should be changed to a Cloud URL.
   */
  it('resolves relative media to cloud media when useRelativeMedia: false', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      clientId: '0000-1111-2222-3333',
      assetsHost: 'assets-host.com',
    }
    const resolvedURL = resolveMediaRelativeToCloud(relativeAssetURL, config)
    expect(resolvedURL).toEqual(tinaCloudAssetURL)
  })

  /**
   * When using `useRelativeMedia: false`, the Cloud URL should be changed to relative URL.
   */
  it('resolves cloud media to relative media when useRelativeMedia: false', () => {
    const config: GraphQLConfig = {
      useRelativeMedia: false,
      clientId: '0000-1111-2222-3333',
      assetsHost: 'assets-host.com',
    }
    const resolvedURL = resolveMediaCloudToRelative(tinaCloudAssetURL, config)
    expect(tinaCloudAssetURL).toEqual(resolvedURL)
  })
})
