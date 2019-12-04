import {
  AUTH_COOKIE_KEY,
  VIRTUAL_SERVICE_DOMAIN,
  TINA_CONNECTOR_ID,
} from '../../contants'
import jwksClient from 'jwks-rsa'
import * as jwt from 'jsonwebtoken'

export function authenticate(req: any, res: any, next: any) {
  const token = req.cookies[AUTH_COOKIE_KEY]

  const decoded = jwt.decode(token, {
    complete: true,
  }) as any

  if (!decoded) return next()

  const client = jwksClient({
    strictSsl: true,
    jwksUri: `https://api.${VIRTUAL_SERVICE_DOMAIN}/dex/keys`,
  })

  client.getSigningKey(decoded.header.kid, (err: any, key: any) => {
    if (err) {
      return next()
    }

    const signingKey = key.publicKey || key.rsaPublicKey

    jwt.verify(
      token,
      signingKey,
      // { audience: 'urn:foo' },
      function(err: any, decoded: string | object) {
        let user: any
        if (!err && typeof decoded === 'object') {
          user = { ...decoded }
        }
        // @ts-ignore
        req.user = user
        next()
      }
    )
  })
}

export function redirectNonAuthenticated(req: any, res: any, next: any) {
  if (req.user) {
    next()
  } else {
    const token = req.query.token
    //redirect if no token supplied
    if (!token) {
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
      res.redirect(
        `https://api.${VIRTUAL_SERVICE_DOMAIN}/auth-proxy/redirect?connector_id=${TINA_CONNECTOR_ID}&origin=${encodeURIComponent(
          removeTrailingSlash(fullUrl)
        )}`
      )
      return
    }

    res.cookie(AUTH_COOKIE_KEY, token)
    res.redirect(req.originalUrl.split('?').shift())
  }
}

export function authorize(req: any, res: any, next: any) {
  // TODO - Verify within our API
  next()
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/$/, '')
}
