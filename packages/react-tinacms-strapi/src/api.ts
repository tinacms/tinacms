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

import Cookies from 'js-cookie'
import { STRAPI_JWT } from './strapi-client'

export async function fetchGraphql(query: string, variables = {}) {
  const jwt = Cookies.get(STRAPI_JWT)
  const headers: any = {
    'Content-Type': 'application/json',
  }

  if (jwt) headers['Authorization'] = `Bearer ${jwt}`

  const response = await fetch(`${process.env.STRAPI_URL}/graphql`, {
    method: 'post',
    headers: {
      ...headers,
    },
    body: JSON.stringify({ query: query, variables: variables }),
  })
  return response.json()
}
