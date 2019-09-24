import * as express from 'express'
import * as cors from 'cors'
import * as open from 'open'
import * as inquirer from 'inquirer'

const AUTH_CALLBACK_PORT = 4568
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

const providerDetails = {
  ['github']: {
    baseUrl: 'https://github.com',
    clientId: process.env.GITHUB_CLIENT_ID,
    createCallbackServer: (app: express.Express) => {
      return new Promise(resolve => {
        let gitProviderToken = ''

        app.get(`/github/callback`, async (req, res) => {
          gitProviderToken = req.query.code
          res.send(`<p>Authorizing with Github</p>`)

          open(
            `https://github.com/apps/${
              process.env.GITHUB_APP_NAME
            }/installations/new`
          )

          //The user may not have to confirm additional permissions, so give them a way out early
          await inquirer.prompt([
            {
              name: 'confirmPermissions',
              type: 'confirm',
              message: 'Once you have granted access to your repo, enter y',
            },
          ])
          resolve(gitProviderToken)
        })
        app.get('/github/installation-callback', async (req, res) => {
          console.log('github app installation complete ')

          res.send(
            `<p>Installed Github app, installation id:${
              req.query.installation_id
            }</p>`
          )

          resolve(gitProviderToken)
        })
      })
    },
  },
  ['gitlab']: {
    baseUrl: 'https://gitlab.com',
    clientId: process.env.GITLAB_CLIENT_ID,
    createCallbackServer: () => {
      console.log('todo - gitlab callback')
      return Promise.resolve()
    },
  },
}

export const retrieveAuthToken = async (gitProvider: string) => {
  //@ts-ignore
  const { clientId, baseUrl } = providerDetails[gitProvider]
  const authUrl = `${baseUrl}/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    `http://localhost:${AUTH_CALLBACK_PORT}/${gitProvider}/callback`
  )}&response_type=token`

  let app = createExpressServer()
  let server = app.listen(AUTH_CALLBACK_PORT, () => {
    console.log('------------------------------------------')
    console.log('waiting for the auth response')
    console.log('------------------------------------------')
  })

  //TODO - potential race condition with the line below?
  open(authUrl)
  //@ts-ignore
  const token = await providerDetails[gitProvider].createCallbackServer(app)

  server.close()

  return token
}
