import { Command, Option } from 'clipanion'
import { logger } from '../../../logger'
import { updateMediaCollection } from '../../../cmds/media'

export class MediaCommand extends Command {
  static paths = [['media', 'update']]
  rootPath = Option.String('--rootPath', {
    description:
      'Specify the root directory to run the CLI from (defaults to current working directory)',
  })
  datalayerPort = Option.String('--datalayer-port', '9000', {
    description:
      'Specify a port to run the datalayer server on. (default 9000)',
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Manage media assets in TinaCMS`,
  })

  async catch(error: any): Promise<void> {
    logger.error('Error occurred during media command')
    console.error(error)
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    const rootPath = this.rootPath || process.cwd()
    const isMediaUpdate = Boolean(this.path.find((x) => x === 'update'))
    if (isMediaUpdate) {
      await updateMediaCollection({
        datalayerPort: this.datalayerPort,
        rootPath,
        noTelemetry: this.noTelemetry,
      })
    }
    process.exit()
  }
}
