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

const axios = require('axios')

export const createProxy = (authTokenKey: string) => (req: any, res: any) => {
  const { headers, ...data } = JSON.parse(req.body)

  axios({
    ...data,
    headers: {
      ...headers,
      Authorization: 'token ' + req.cookies[authTokenKey],
    },
  })
    .then((resp: any) => {
      res.status(resp.status).json(resp.data)
    })
    .catch((err: any) => {
      res.status(err.response.status).json(err.response.data)
    })
}
