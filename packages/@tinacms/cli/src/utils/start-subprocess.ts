import { logger } from '../logger'
import childProcess from 'child_process'
import { dangerText } from './theme'

export const startSubprocess2 = async ({ command }: { command: string }) => {
  if (typeof command === 'string') {
    const commands = command.split(' ')
    const firstCommand = commands[0]
    const args = commands.slice(1) || []
    const ps = childProcess.spawn(firstCommand, args, {
      stdio: 'inherit',
      shell: true,
    })
    ps.on('error', (code) => {
      logger.error(
        dangerText(
          `An error has occurred in the Next.js child process. Error message below`
        )
      )
      logger.error(`name: ${code.name}
message: ${code.message}

stack: ${code.stack || 'No stack was provided'}`)
    })
    ps.on('close', (code) => {
      logger.info(`child process exited with code ${code}`)
      process.exit(code)
    })
    return ps
  }
}
