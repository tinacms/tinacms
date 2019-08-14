require('dotenv').config()
import clear from 'clear'
import figlet from 'figlet'
import open from 'open'
import inquirer from 'inquirer'
import express from 'express'
import cors from 'cors'
import chalk from 'chalk'
import { isAuthenticated } from '../config'

const providerDetails = {
  ['github']: {
    baseUrl: 'https://github.com',
    clientId: process.env.GITHUB_CLIENT_ID,
  },
  ['gitlab']: {
    baseUrl: 'https://gitlab.com',
    clientId: process.env.GITLAB_CLIENT_ID,
  },
}

const createAuthServer = gitProvider => {
  let app = express()
  app.use(
    cors({
      origin: function(origin, callback) {
        // TODO: Only accept from localhost.
        callback(null, true)
      },
    })
  )
  app.get(`/${gitProvider}/callback`, (req, res) => {
    console.log('receieved my auth callback')
    console.log(`code: ${req.query.code}`)
    res.send(`<p>Authorizing with ${gitProvider}</p>`)
  })
  app.listen(4568, () => {
    console.log('------------------------------------------')
    console.log('wait for the auth response')
    console.log('------------------------------------------')
  })
}

export async function initServer(options) {
  if (!isAuthenticated()) {
    console.log('you must be logged in to perform this action')
    return
  }

  clear()
  console.log(
    chalk.green(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
  )

  const questions = [
    {
      name: 'gitProvider',
      type: 'list',
      message: 'Choose a git provider:',
      choices: ['github', new inquirer.Separator(), 'gitlab'],
    },
    {
      name: 'private',
      type: 'confirm',
      message: 'Is your repo private?:',
    },
  ]

  const answers = await inquirer.prompt(questions)

  createAuthServer(answers.gitProvider)

  let query = '&response_type=token'
  if (answers.gitProvider === 'github') {
    query += '&scope=public_repo,write:repo_hook,user:email'
    if (answers.private) {
      query += '&scope=repo,write:repo_hook,user:email'
    }
  }
  const { clientId, baseUrl } = providerDetails[answers.gitProvider]
  const authUrl = `${baseUrl}/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    `http://localhost:4568/${answers.gitProvider}/callback`
  )}${query}`

  open(authUrl)
}
