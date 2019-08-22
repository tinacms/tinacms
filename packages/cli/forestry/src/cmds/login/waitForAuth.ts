require('dotenv').config()
import * as express from 'express'
import axios from 'axios'
import { createHash, randomBytes } from 'crypto'
import * as open from 'open'

const AUTH0_BASE_URL = 'https://forestryio.auth0.com'
const CALLBACK_ROUTE = '/auth/callback'

export const waitForAuth = (app: express.Express) => {
  var verifier = base64URLEncode(randomBytes(32))
  const authUrl = createAuthURL(verifier)

  const authResult = new Promise(resolve => {
    app.get(CALLBACK_ROUTE, async (req, res) => {
      const body = await axios.post(`${AUTH0_BASE_URL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        code_verifier: verifier,
        code: req.query.code,
        redirect_uri: `http://localhost:${
          process.env.AUTH_CALLBACK_PORT
        }${CALLBACK_ROUTE}`,
      })

      resolve(body.data)

      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write(
        '<html><body>You are now authorized! You can now close this window.</body></html>'
      )
      res.end()
    })
  })

  open(authUrl)
  return authResult
}

function createAuthURL(verifier: string) {
  var challenge = base64URLEncode(sha256(verifier))
  const callback = encodeURIComponent(
    `http://localhost:${process.env.AUTH_CALLBACK_PORT}${CALLBACK_ROUTE}`
  )

  return (
    `${AUTH0_BASE_URL}/authorize?client_id=${
      process.env.AUTH0_CLIENT_ID
    }&redirect_uri=${callback}&response_type=code&code_challenge_method=S256&code_challenge=${challenge}` +
    `&scope=offline_access&audience=${encodeURIComponent(
      'https://api.forestry.io'
    )}`
  )
}

function base64URLEncode(str: Buffer) {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function sha256(buffer: string) {
  return createHash('sha256')
    .update(buffer)
    .digest()
}
