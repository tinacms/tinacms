require('dotenv').config()
import { writeConfig } from '../../config'
import { waitForAuth } from './waitForAuth'
import { createExpressServer } from '../initServer/retrieveAuthToken'

export async function login() {
  let app = createExpressServer()

  let server = app.listen(process.env.AUTH_CALLBACK_PORT, () => {
    console.log('------------------------------------------')
    console.log('waiting for the auth response')
    console.log('------------------------------------------')
  })

  const auth = await waitForAuth(app)
  server.close()
  writeConfig(JSON.stringify({ auth }))

  console.log('You are now authenticated')
}
