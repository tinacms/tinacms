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

import { CSRF_TOKEN_KEY, WORKING_REPO_KEY, HEAD_BRANCH_KEY } from '../constants'
import { AES, enc } from 'crypto-js'

export const previewHandler = (signingKey: string) => (req: any, res: any) => {
  const expectedCSRFToken = req.cookies[CSRF_TOKEN_KEY]

  // Parse out the amalgamated token
  const token = (req.headers['authorization'] || '').split(' ')[1] || null

  if (token && expectedCSRFToken) {
    const decryptedToken = AES.decrypt(token, signingKey).toString(enc.Utf8)

    const [csrfToken, authToken] = decryptedToken.split('.')

    if (csrfToken == expectedCSRFToken) {
      const previewData = {
        working_repo_full_name: req.cookies[WORKING_REPO_KEY],
        github_access_token: authToken,
        head_branch:
          req.cookies[HEAD_BRANCH_KEY] || process.env.BASE_BRANCH || 'master',
      }
      res.setPreviewData(previewData)
      res.status(200).end()
    } else {
      res.status(401).json({ message: 'Invalid CSRF Token: Please try again' })
    }
  } else {
    res.status(401).json({ message: 'Missing Credentials: Please try again' })
  }
}
