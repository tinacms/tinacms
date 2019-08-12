#!/usr/bin/env node

const clear = require('clear')
const chalk = require('chalk')
const figlet = require('figlet')
const path = require('path')
const program = require('commander')

clear()
console.log(
  chalk.red(figlet.textSync('Forestry', { horizontalLayout: 'full' }))
)
