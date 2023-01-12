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
import jwksClient from 'jwks-rsa'
import * as path from 'path'
import * as jwt from 'jsonwebtoken'
const fetch = require('node-fetch')

const VIRTUAL_SERVICE_DOMAIN = process.env.VIRTUAL_SERVICE_DOMAIN || 'tina.io'
const JWKS_URI = process.env.JWKS_URI || 'https://api.tina.io/dex/keys'
const CONNECTOR_ID =
  process.env.CONNECTOR_ID || '1714dd58-a2a5-4bee-99d4-07b0b3fcb2a7'
const TINA_TEAMS_API_URL =
  process.env.TINA_TEAMS_API_URL || 'https://api.tina.io/v1'

const AUTH_COOKIE_KEY = 'tina-auth'
const TINA_TEAMS_NAMESPACE = process.env.TINA_TEAMS_NAMESPACE

interface TinaTeamsUser {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  at_hash: string
  email: string
  email_verified: boolean
  name: string
  federated_claims: {
    connector_id: string
    user_id: string
  }
}

const NO_COOKIES_ERROR = `@einsteinindustries/tinacms-teams \`authenticate\` middleware could not find cookies on the request.

Try adding the \`cookie-parser\` middleware to your express app.

https://github.com/expressjs/cookie-parser
`

export function authenticate(req: any, _res: any, next: any) {
  if (!req.cookies) {
    throw new Error(NO_COOKIES_ERROR)
  }
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
  if (!TINA_TEAMS_NAMESPACE) {
    const missingNamespaceError = path.join(
      __dirname + '/../public/missing-namespace.html'
    )
    res.status(422)
    res.sendFile(missingNamespaceError)
  } else {
    const unauthorizedView = path.join(
      __dirname + '/../public/unauthorized.html'
    )
    fetch(
      `${TINA_TEAMS_API_URL}/sites/${encodeURIComponent(
        TINA_TEAMS_NAMESPACE
      )}/${encodeURIComponent(req.get('host'))}/access`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + req.cookies[AUTH_COOKIE_KEY] },
      }
    )
      .then((result: any) => {
        if (result.ok) {
          next()
        } else {
          res.status(401)
          res.sendFile(unauthorizedView)
        }
      })
      .catch(() => {
        res.status(401)
        res.sendFile(unauthorizedView)
      })
  }
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/$/, '')
}
