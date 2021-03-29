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

import { CSRF_TOKEN_KEY } from '../constants'
import { v4 as uuidv4 } from 'uuid'
import { AES } from 'crypto-js'
import qs from 'qs'
import axios from 'axios'
import { serialize } from 'cookie'

export const createAuthHandler = (
  clientId: string,
  secret: string,
  signingKey: string
) => (req: any, res: any) => {
  if (!signingKey) {
    const message =
      'next-tinacms-github: createAuthHandler was called without a signing key.'
    console.error(message)
    return res.status(500).json({ message })
  }

  createAccessToken(clientId, secret, req.query.code, req.query.state).then(
    (tokenResp: any) => {
      const { access_token, error } = qs.parse(tokenResp.data)
      if (error) {
        res.status(400).json({ error })
      } else {
        // Generate the csrf token
        const csrfToken = uuidv4()

        // Sign the amalgamated token
        const unsignedToken = `${csrfToken}.${access_token}`
        const signedToken = AES.encrypt(unsignedToken, signingKey).toString()

        // Set the csrf token as an httpOnly cookie
        res.setHeader(
          'Set-Cookie',
          serialize(CSRF_TOKEN_KEY, csrfToken, {
            path: '/',
            httpOnly: true,
          })
        )

        // Return the amalgamated token
        res.status(200).json({ signedToken })
      }
    }
  )
}

const createAccessToken = (
  clientId: string,
  clientSecret: string,
  code: string,
  state: string
) => {
  return axios.post(
    `https://github.com/login/oauth/access_token`,
    qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      state,
    })
  )
}
