import minimist from 'minimist'
import { initServer } from './cmds/initServer'

export function init() {
  const args = minimist(process.argv.slice(2))
  const cmd = args._[0]

  switch (cmd) {
    case 'init-server':
      initServer(args)
      break
    default:
      console.error(`"${cmd}" is not a valid command!`)
      break
  }
}
