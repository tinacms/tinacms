import { initServer } from './cmds/initServer'
import { createAccount } from './cmds/createAccount'
import { login } from './cmds/login'
import commander from 'commander'
import { version } from '../package.json'

export function init(args) {
  const program = new commander.Command()

  program.version(version)
  program
    .command('create-account')
    .description('create a forestry account')
    .action(() => {
      createAccount()
    })

  program
    .command('login')
    .description('log in to forestry account')
    .action(() => {
      login()
    })

  program
    .command('init-server')
    .description('Set up the cloud development server')
    .action(() => {
      initServer()
    })

  // error on unknown commands
  program.on('command:*', function() {
    console.error(
      'Invalid command: %s\nSee --help for a list of available commands.',
      program.args.join(' ')
    )
    process.exit(1)
  })

  program.parse(args)
}
