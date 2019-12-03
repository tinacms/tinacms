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
import * as express from 'express'
import cookieParser from 'cookie-parser'
import { VIRTUAL_SERVICE_DOMAIN } from './contants'

exports.onCreateDevServer = ({ app }: any) => {
  app.use(router())
}

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

const AUTH_COOKIE_KEY = 'tina-auth'

function router() {
  const router = express.Router()

  router.use(cookieParser())

  router.use(express.json())

  router.use(function authentication(req, res, next) {
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
            user = { authorized: true, ...decoded }
          } else {
            user = { authorized: false }
          }
          // @ts-ignore
          req.user = user
          next()
        }
      )
    })
  })

  router.use(function authorization(req, res, next) {
    // TODO
    next()
  })

  router.post('/___tina/teams/auth', (req: any, res: any) => {
    if (!req.user) {
      //invalid token
      res.status(401).json({
        message: 'unauthorized',
      })
    } else {
      res.json({
        decoded: req.user,
      })
    }
  })

  return router
}
