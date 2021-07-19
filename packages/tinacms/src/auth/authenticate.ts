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

import popupWindow from './popupWindow'

const TINA_LOGIN_EVENT = 'tinaCloudLogin'
export const AUTH_TOKEN_KEY = 'tinacms-auth'

const BASE_TINA_URL = process.env.BASE_TINA_URL || `tina.io`

export type TokenObject = {
  id_token: string
  access_token: string
  refresh_token: string
}
export const authenticate = (
  clientId: string,
  organizationId: string
): Promise<TokenObject> => {
  return new Promise((resolve) => {
    // @ts-ignore
    let authTab: Window | undefined

    // TODO - Grab this from the URL instead of passing through localstorage
    window.addEventListener('message', function (e: MessageEvent) {
      if (e.data.source === TINA_LOGIN_EVENT) {
        if (authTab) {
          authTab.close()
        }
        resolve({
          id_token: e.data.id_token,
          access_token: e.data.access_token,
          refresh_token: e.data.refresh_token,
        })
      }
    })
    authTab = popupWindow(
      `https://${organizationId}.${BASE_TINA_URL}/signin?clientId=${clientId}`,
      '_blank',
      window,
      1000,
      700
    )
  })
}
