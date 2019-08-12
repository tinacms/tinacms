#!/usr/bin/env node
require('dotenv').config()
const clear = require('clear')
const chalk = require('chalk')
const figlet = require('figlet')
const path = require('path')
const program = require('commander')
const open = require('open')
const inquirer = require('inquirer')

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

inquirer.prompt(questions).then(() => {
  const baseUrl = 'https://github.com'
  const appID = process.env.GITHUB_CLIENT_ID

  const authUrl = `${baseUrl}/login/oauth/authorize?client_id=${appID}&redirect_uri=${encodeURIComponent(
    'https://forestry.io'
  )}&response_type=token`

  open(authUrl)
})
