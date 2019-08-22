import { writeConfig } from '../../config'
import axios from 'axios'
import * as open from 'open'
import { randomBytes, createHash } from 'crypto'
import { createExpressServer } from '../initServer/retrieveAuthToken'

const AUTH_CALLBACK_PORT = 4568
export async function login() {
  const clientId = 'IgXPpOyz7U6fLPUwChRYIbEY2dmO2ppU'
  const baseUrl = 'https://forestryio.auth0.com'

  var verifier = base64URLEncode(randomBytes(32))
  var challenge = base64URLEncode(sha256(verifier))

  const callback = encodeURIComponent(
    `http://localhost:${AUTH_CALLBACK_PORT}/auth/callback`
  )

  const authUrl =
    `${baseUrl}/authorize?client_id=${clientId}&redirect_uri=${callback}&response_type=code&code_challenge_method=S256&code_challenge=${challenge}` +
    `&scope=offline_access&audience=${encodeURIComponent(
      'https://api.forestry.io'
    )}`

  let app = createExpressServer()
  app.get('/auth/callback', async (req, res) => {
    const body = await axios.post(`${baseUrl}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: clientId,
      code_verifier: verifier,
      code: req.query.code,
      redirect_uri: `http://localhost:${AUTH_CALLBACK_PORT}/auth/callback`,
    })

    writeConfig(JSON.stringify({ auth: body.data }))

    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(
      '<html><body>You are now authorized! You can now close this window.</body></html>'
    )
    res.end()
  })
  let server = app.listen(AUTH_CALLBACK_PORT, () => {
    console.log('------------------------------------------')
    console.log('waiting for the auth response')
    console.log('------------------------------------------')
  })

  open(authUrl)
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
