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
import popupWindow from './popupWindow'

export interface ProviderAuthProps {
  provider: string
  onAuthSuccess(): void
}

export const STRAPI_JWT = 'tina_strapi_jwt'

export class StrapiClient {
  strapiUrl: string
  constructor(strapiUrl: string) {
    if (!strapiUrl) {
      throw new Error('Missing strapiURL in StrapiClient constructor')
    }
    this.strapiUrl = strapiUrl
  }

  get jwt(): string {
    return Cookies.get(STRAPI_JWT) || ''
  }

  set jwt(value: string) {
    Cookies.set(STRAPI_JWT, value)
  }

  async authenticate(username: string, password: string) {
    const response = await fetch(`${this.strapiUrl}/auth/local`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, password: password }),
    })

    if (response.status === 200) {
      const responseJson = await response.json()

      this.jwt = responseJson.jwt
    }

    return response
  }

  startProviderAuth({ provider, onAuthSuccess }: ProviderAuthProps) {
    const previousCookie = this.jwt

    // poll the cookie value for a change. close the auth window on change
    // there are no native JS events that support this behaviour
    const cookiePollInterval = window.setInterval(() => {
      const currentCookie = this.jwt
      if (currentCookie && currentCookie != previousCookie) {
        if (authTab) authTab.close()
        onAuthSuccess()
        clearInterval(cookiePollInterval)
      }
    }, 1000)

    const authTab = popupWindow(
      `${this.strapiUrl}/connect/${provider}`,
      '_blank',
      window,
      1000,
      700
    )
  }

  async fetchGraphql(query: string, variables = {}) {
    const jwt = this.jwt
    const headers: any = {
      'Content-Type': 'application/json',
    }

    if (jwt) headers['Authorization'] = `Bearer ${jwt}`

    const response = await fetch(`${this.strapiUrl}/graphql`, {
      method: 'post',
      headers: {
        ...headers,
      },
      body: JSON.stringify({ query: query, variables: variables }),
    })

    return response.json()
  }
}

export function fetchGraphql(url: string, query: string, variables = {}) {
  return new StrapiClient(url).fetchGraphql(query, variables)
}
