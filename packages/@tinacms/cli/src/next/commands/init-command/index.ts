import { Command, Option } from 'clipanion'
import { logger } from '../../../logger'
import { initStaticTina } from '../../../cmds/init'

export class InitCommand extends Command {
  static paths = [['init']]
  pathToForestryConfig = Option.String('--forestryPath', {
    description:
      'Specify the relative path to the .forestry directory, if importing an existing forestry site.',
  })
  rootPath = Option.String('--rootPath', {
    description:
      'Specify the root directory to run the CLI from (defaults to current working directory)',
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
    const rootPath = this.rootPath || process.cwd()
    await initStaticTina({
      rootPath: rootPath,
      pathToForestryConfig: this.pathToForestryConfig || rootPath,
      noTelemetry: this.noTelemetry,
    })
    process.exit()
  }
}
