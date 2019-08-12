#!/usr/bin/env node

const clear = require('clear')
const chalk = require('chalk')
const figlet = require('figlet')
const path = require('path')
const program = require('commander')

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
    validate: function(value) {
      if (value != 'github' && value != 'gitlab') {
        return true
      } else {
        return 'Please choose a valid git provider '
      }
    },
  },
  {
    name: 'private',
    type: 'confirm',
    message: 'Is your repo private?:',
  },
]
return inquirer.prompt(questions)
