/**

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
  // This is a local URL
  if (url.startsWith('/')) {
    return {
      branch: null,
      isLocalClient: true,
      clientId: null,
      host: null,
    }
  }
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
  const isTinaCloud =
    params.host.includes('tinajs.dev') ||
    params.host.includes('tina.io') ||
    params.host.includes('tinajs.io')

  if (!isTinaCloud) {
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
