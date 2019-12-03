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

const AUTH_COOKIE_KEY = 'tina-auth'

function router() {
  const router = express.Router()

  router.use(cookieParser())
  router.use(express.json())

  router.post('/___tina/teams/auth', (req: any, res: any) => {
    const token = req.cookies[AUTH_COOKIE_KEY]

    const client = jwksClient({
      strictSsl: true,
      jwksUri: `https://api.${VIRTUAL_SERVICE_DOMAIN}/dex/keys`,
    })

    const decoded = jwt.decode(token, {
      complete: true,
    }) as any

    if (!decoded) {
      //invalid token
      res.status(401).json({
        message: 'unauthorized',
      })
      return
    }
    client.getSigningKey(decoded.header.kid, (err: any, key: any) => {
      if (err) {
        res.status(401).json({
          message: 'unauthorized',
        })
        return
      }

      const signingKey = key.publicKey || key.rsaPublicKey
      jwt.verify(
        token,
        signingKey,
        // { audience: 'urn:foo' },
        function(err: any, decoded: string | object) {
          if (!err) {
            res.json({
              decoded,
            })
          } else {
            res.status(401).json({
              message: 'unauthorized',
            })
          }
        }
      )
    })
  })

  return router
}
