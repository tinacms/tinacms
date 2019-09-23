require('dotenv').config() // load process.env values
import { initServer } from './cmds/apps/initServer'
import { login } from './cmds/login'

import * as commander from 'commander'
//@ts-ignore
import { version } from '../package.json'
import { isAuthenticated } from './config'
import { initConfig } from './cmds/initConfig'
import { create } from './cmds/apps/create'

export function init(args: any) {
  const program = new commander.Command()

  program.version(version)

  program
    .command('auth')
    .description('log in to forestry account')
    .action(async () => {
      await login()
    })

  program
    .command('config:init')
    .description('initialize the local project with a forestry config')
    .action(async () => {
      await initConfig()
      process.exit(1)
    })

  program
    .command('apps')
    .description('list the forestry apps that this user has access to - (STUB)')
    .action(() => {
      console.log('TODO - LIST APPS HERE')
      process.exit(1)
    })

  program
    .command('apps:info <app>')
    .description('log info about the forestry app - (STUB)')
    .action(app => {
      console.log('TODO - LOG APP INFO HERE FOR: ' + app)
      process.exit(1)
    })

  program
    .command('apps:destroy <app>')
    .description('destroy the specified forestry app - (STUB)')
    .action(app => {
      console.log(`TODO - DESTROY ${app} IN FORESTRY HERE`)
      process.exit(1)
    })

  program
    .command('apps:create')
    .description('Creates an application in forestry')
    .action(async () => await verifyAuthorized(create))

  program
    .command('apps:init')
    .description('Set up the cloud development server')
    .action(async () => await verifyAuthorized(initServer))

  // error on unknown commands
  program.on('command:*', function() {
    console.error(
      'Invalid command: %s\nSee --help for a list of available commands.',
      args.join(' ')
    )
    process.exit(1)
  })

  program.parse(args)
}

function verifyAuthorized(callback: any) {
  if (isAuthenticated()) {
    return callback()
  } else {
    console.log('you must be logged in to perform this action')
  }
}
