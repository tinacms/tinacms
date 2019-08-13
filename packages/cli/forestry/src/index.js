import minimist from 'minimist'
import { initServer } from './cmds/initServer'
import { createAccount } from './cmds/createAccount'
import { login } from './cmds/login'

export function init() {
  const args = minimist(process.argv.slice(2))
  const cmd = args._[0]

  switch (cmd) {
    case 'create-account':
      createAccount(args)
      break
    case 'login':
      login(args)
      break
    case 'init-server':
      initServer(args)
      break
    default:
      console.error(`"${cmd}" is not a valid command!`)
      break
  }
}
