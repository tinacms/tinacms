import { Command, Option } from 'clipanion'
import { logger, summary } from '../../../logger'
import { initStaticTina } from '../../../cmds/init'

export class InitCommand extends Command {
  static paths = [['init']]
  rootPath = Option.String('--rootPath', {
    description: 'Specify the root directory to run the CLI from',
  })
  verbose = Option.Boolean('-v, --verbose', false, {
    description: 'increase verbosity of logged output',
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })
  static usage = Command.Usage({
    category: `Commands`,
    description: `Audit config and content files`,
  })

  async catch(error: any): Promise<void> {
    console.error(error)
    logger.error('Error occured during tinacms audit')
    process.exit(1)
  }

  async execute(): Promise<number | void> {
    await initStaticTina({
      rootPath: this.rootPath,
      noTelemetry: this.noTelemetry,
    })
    // summary({
    //   heading: 'Tina Dev Server is running...',
    //   items: [
    //     {
    //       emoji: '🦙',
    //       heading: 'Tina Config',
    //       subItems: [
    //         {
    //           key: 'API url',
    //           value: 'Good',
    //         },
    //       ],
    //     },
    //   ],
    // })
    process.exit()
  }
}
