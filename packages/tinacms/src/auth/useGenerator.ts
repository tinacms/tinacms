/**

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
