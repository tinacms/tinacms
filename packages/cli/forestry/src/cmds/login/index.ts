require('dotenv').config()
import { writeConfig } from '../../config'
import { waitForAuth } from './waitForAuth'
import * as express from 'express'
import * as cors from 'cors'

export async function login() {
  let app = createExpressServer()

  let server = app.listen(process.env.AUTH_CALLBACK_PORT, () => {
    console.log('------------------------------------------')
    console.log('waiting for the auth response')
    console.log('------------------------------------------')
  })

  const auth = await waitForAuth(app)
  server.close()
  writeConfig({ auth })

  console.log('You are now authenticated')
}

const createExpressServer = () => {
  let app = express()

  app.use(
    cors({
      origin: function(origin, callback) {
        // TODO: Only accept from localhost.
        callback(null, true)
      },
    })
  )

  return app
}
