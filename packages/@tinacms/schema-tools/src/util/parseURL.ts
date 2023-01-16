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

import UrlPattern from 'url-pattern'
export const TINA_HOST = 'content.tinajs.io'

export const parseURL = (
  url: string
): {
  branch: string | null
  isLocalClient: boolean
  clientId: string | null
  host: string | null
} => {
  if (url.includes('localhost')) {
    return {
      branch: null,
      isLocalClient: true,
      clientId: null,
      host: 'localhost',
    }
  }

  const params = new URL(url)

  // This is a self-hosted URL
  if (!['tinajs.dev', 'tina.io'].find((item) => params.host.includes(item))) {
    return {
      branch: null,
      isLocalClient: true,
      clientId: null,
      host: params.host,
    }
  }

  const pattern = new UrlPattern('/content/:clientId/github/*', {
    escapeChar: ' ',
  })
  const result = pattern.match(params.pathname)
  const branch = result?._
  const clientId = result?.clientId

  if (!branch || !clientId) {
    throw new Error(
      `Invalid URL format provided. Expected: https://content.tinajs.io/content/<ClientID>/github/<Branch> but but received ${url}`
    )
  }

  // TODO if !result || !result.clientId || !result.branch, throw an error

  return {
    host: params.host,
    branch,
    clientId,
    isLocalClient: false,
  }
}
