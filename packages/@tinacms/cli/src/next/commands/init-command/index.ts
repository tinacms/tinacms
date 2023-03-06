import { Command, Option } from 'clipanion'
import { logger } from '../../../logger'
import { initStaticTina } from '../../../cmds/init'

export class InitCommand extends Command {
  static paths = [['init']]
  rootPath = Option.String('--rootPath', {
    description: 'Specify the root directory to run the CLI from',
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Add Tina Cloud to an existing project`,
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms init')
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    await initStaticTina({
      rootPath: this.rootPath,
      noTelemetry: this.noTelemetry,
    })
    process.exit()
  }
}
