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

import { ACCESS_TOKEN_KEY } from '../constants'

const qs = require('qs')
const axios = require('axios')
import { serialize } from 'cookie'

export const createAuthHandler = (clientId: string, secret: string) => (
  req: any,
  res: any
) => {
  createAccessToken(clientId, secret, req.query.code, req.query.state).then(
    (tokenResp: any) => {
      const { access_token, error } = qs.parse(tokenResp.data)
      if (error) {
        res.status(400).json({ error })
      } else {
        res.setHeader(
          'Set-Cookie',
          serialize(ACCESS_TOKEN_KEY, access_token, {
            path: '/',
            httpOnly: true,
          })
        )
        res.status(200).json({})
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
