#!/usr/bin/env node
require('dotenv').config()
const clear = require('clear')
const chalk = require('chalk')
const figlet = require('figlet')
const path = require('path')
const program = require('commander')
const open = require('open')
const inquirer = require('inquirer')
const express = require('express')
const cors = require('cors')

clear()
console.log(
  chalk.red(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
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

const providerDetails = {
  ['github']: {
    baseUrl: 'https://github.com',
    clientId: process.env.GITHUB_CLIENT_ID,
  },
  ['gitlab']: {
    baseUrl: 'https://github.com',
    clientId: process.env.GITLAB_CLIENT_ID,
  },
}

inquirer.prompt(questions).then(answers => {
  const { clientId, baseUrl } = providerDetails[answers.gitProvider]

  let app = express()
  app.use(
    cors({
      origin: function(origin, callback) {
        // TODO: Only accept from localhost.
        callback(null, true)
      },
    })
  )
  app.get('/github/callback', (req, res) => {
    console.log('receieved my auth callback')
    console.log(`code: ${req.query.code}`)
    res.send('<p>Authorizing with Github</p>')
  })
  app.listen(4568, () => {
    console.log('------------------------------------------')
    console.log('wait for the auth response')
    console.log('------------------------------------------')
  })

  const authUrl = `${baseUrl}/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    `http://localhost:4568/${answers.gitProvider}/callback`
  )}&response_type=token&scope=${answers.private ? 'private' : 'public'}`

  open(authUrl)
})
