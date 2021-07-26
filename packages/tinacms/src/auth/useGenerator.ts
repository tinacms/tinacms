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

import * as crypto from 'crypto-js'

const randomString = (length: number = 40) => {
  let state = ''
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++)
    state += possible.charAt(Math.floor(Math.random() * possible.length))
  return state
}

function generateCodeVerifier() {
  return randomString(128)
}

function base64URL(string) {
  crypto.enc.Base64.stringify(string)
  return string
    .toString(crypto.enc.Base64)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function generateCodeChallenge(code_verifier) {
  return base64URL(crypto.SHA256(code_verifier))
}

export const useGenerator = () => {
  const codeVerifier = generateCodeVerifier()
  return {
    state: randomString(),
    codeChallenge: generateCodeChallenge(codeVerifier),
    codeVerifier,
  }
}
