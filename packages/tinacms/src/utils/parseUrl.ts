import UrlPattern from 'url-pattern'
export const TINA_HOST = 'content.tinajs.io'

export const parseURL = (url: string): { branch; isLocalClient; clientId } => {
  if (url.includes('localhost')) {
    return { branch: null, isLocalClient: true, clientId: null }
  }

  const params = new URL(url)
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

  if (params.host !== TINA_HOST) {
    throw new Error(
      `The only supported hosts are ${TINA_HOST} or localhost, but received ${params.host}.`
    )
  }

  return {
    branch,
    clientId,
    isLocalClient: false,
  }
}
