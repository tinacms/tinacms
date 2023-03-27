import { Command, Option } from 'clipanion'
import { logger } from '../../../logger'
import { initStaticTina } from '../../../cmds/init'

export class InitCommand extends Command {
  static paths = [['init']]
  pathToForestryConfig = Option.String('--forestryPath', {
    description:
      'Specify the relative path to the .forestry directory, if importing an existing forestry site.',
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Add Tina to an existing project`,
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occured during tinacms init')
    console.error(error)
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    await initStaticTina({
      pathToForestryConfig: this.pathToForestryConfig || process.cwd(),
      noTelemetry: this.noTelemetry,
    })
    process.exit()
  }
}
