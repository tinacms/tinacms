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

import popupWindow from './popupWindow'
export const GITHUB_AUTH_CODE_KEY = 'github_auth_code'
export const authenticate = (
  clientId: string,
  codeExchangeRoute: string,
  scope: string = 'public_repo'
): Promise<void> => {
  const authState = Math.random()
    .toString(36)
    .substring(7)

  const url = `https://github.com/login/oauth/authorize?scope=${scope}&client_id=${clientId}&state=${authState}`

  return new Promise(resolve => {
    // @ts-ignore
    let authTab: Window | undefined
    window.addEventListener('storage', function(e: StorageEvent) {
      if (e.key == GITHUB_AUTH_CODE_KEY) {
        fetch(`${codeExchangeRoute}?code=${e.newValue}&state=${authState}`)
          .then(response => response.json())
          .then(data => {
            const token = data.signedToken || null
            if (token) {
              // for implementations using the csrf mitigation
              localStorage.setItem('tinacms-github-token', token)
            } else {
              console.warn(
                'Deprecation Notice: You are using an old authentication flow, please migrate to the new one (see https://tinacms.org/blog/upgrade-notice-improved-github-security)'
              )
            }
            if (authTab) {
              authTab.close()
            }
            resolve()
          })
      }
    })
    authTab = popupWindow(url, '_blank', window, 1000, 700)
  })
}
