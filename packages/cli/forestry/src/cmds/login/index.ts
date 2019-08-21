import { writeConfig } from '../../config'
import { promptCredentials } from './prompt-credentials'
import axios from 'axios'
import * as open from 'open'
import { randomBytes, createHash } from 'crypto'
import { createExpressServer } from '../initServer/retrieveAuthToken'
var request = require('request')

const FORESTRY_API = ''
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
    `&scope=offline_access`

  let app = createExpressServer()
  app.get('/auth/callback', async (req, res) => {
    console.log('reached callback ' + callback)
    const code = req.query.code

    var options = {
      method: 'POST',
      url: `${baseUrl}/oauth/token`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {
        grant_type: 'authorization_code',
        client_id: clientId,
        code_verifier: verifier,
        code: code,
        redirect_uri: `http://localhost:${AUTH_CALLBACK_PORT}/auth/callback`,
      },
    }

    console.log(JSON.stringify(options))

    request(options, function(error: any, response: any, body: any) {
      if (error) throw new Error(error)

      console.log(body)
    })
  })
  let server = app.listen(AUTH_CALLBACK_PORT, () => {
    console.log('------------------------------------------')
    console.log('waiting for the auth response')
    console.log('------------------------------------------')
  })

  open(authUrl)

  const fieldValues = await promptCredentials()
  const { token } = await axios.post<any, { token: string }>(
    `${FORESTRY_API}/login`,
    fieldValues
  )
  writeConfig({ token })

  // TODO - Post to forestry and grab token
  // TODO - Store token in ~/.forestry credentials file
  // TODO - Display the below warning when login fails
  console.log(`Failed to log in ${fieldValues.email} - Not yet implemented`)
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
