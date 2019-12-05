/**

Copyright 2019 Forestry.io Inc

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
import jwksClient from 'jwks-rsa'
import * as jwt from 'jsonwebtoken'

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

const VIRTUAL_SERVICE_DOMAIN = process.env.VIRTUAL_SERVICE_DOMAIN || 'tina.io'
const JWKS_URI = process.env.JWKS_URI || 'https://api.tina.io/dex/keys'
const CONNECTOR_ID =
  process.env.CONNECTOR_ID || '1714dd58-a2a5-4bee-99d4-07b0b3fcb2a7'

const AUTH_COOKIE_KEY = 'tina-auth'

export function authenticate(req: any, res: any, next: any) {
  const token = req.cookies[AUTH_COOKIE_KEY]

  const decoded = jwt.decode(token, {
    complete: true,
  }) as any

  if (!decoded) return next()

  const client = jwksClient({
    strictSsl: true,
    jwksUri: JWKS_URI,
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
    if (token) {
      res.cookie(AUTH_COOKIE_KEY, token)
      res.redirect(req.originalUrl.split('?').shift())
    } else {
      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
      res.redirect(
        `https://api.${VIRTUAL_SERVICE_DOMAIN}/auth-proxy/redirect?connector=${CONNECTOR_ID}&origin=${encodeURIComponent(
          removeTrailingSlash(fullUrl)
        )}`
      )
    }
  }
}

export function authorize(req: any, res: any, next: any) {
  // TODO - Verify within our API
  next()
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/$/, '')
}
