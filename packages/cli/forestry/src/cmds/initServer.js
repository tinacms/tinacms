require('dotenv').config()
import clear from 'clear'
import figlet from 'figlet'
import open from 'open'
import inquirer from 'inquirer'
import express from 'express'
import cors from 'cors'
import chalk from 'chalk'

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
    createCallbackServer: app => {
      return new Promise(resolve => {
        let gitProviderToken = ''

        app.get(`/github/callback`, async (req, res) => {
          gitProviderToken = req.query.code
          console.log(`code: ${gitProviderToken}`)
          res.send(`<p>Authorizing with Github</p>`)

          open(
            `https://github.com/apps/${
              process.env.GITHUB_APP_ID
            }/installations/new`
          )

          //The user may not have to confirm additional permissions, so give them a way out early
          await inquirer.prompt([
            {
              name: 'confirmPermissions',
              type: 'confirm',
              message: 'Once you have granted access to your rpeo, hit enter:',
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

export async function initServer() {
  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )

  const answers = await inquirer.prompt([
    {
      name: 'gitProvider',
      type: 'list',
      message: 'Choose a git provider:',
      choices: ['github', new inquirer.Separator(), 'gitlab'],
    },
  ])

  const { clientId, baseUrl } = providerDetails[answers.gitProvider]
  const authUrl = `${baseUrl}/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    `http://localhost:4568/${answers.gitProvider}/callback`
  )}&response_type=token`

  let app = createExpressServer()
  let server = app.listen(4568, () => {
    console.log('------------------------------------------')
    console.log('wait for the auth response')
    console.log('------------------------------------------')
  })

  //TODO - potential race condition with the line below?
  open(authUrl)
  const token = await providerDetails[answers.gitProvider].createCallbackServer(
    app
  )
  console.log(
    'TODO - send this to our dev-server starter: ' +
      JSON.stringify({
        token,
        repo: 'TODO',
        branch: 'TODO',
        secrets: 'TODO',
      })
  )
  server.close()
}
