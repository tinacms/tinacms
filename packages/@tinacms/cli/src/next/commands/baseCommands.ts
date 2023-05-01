import { Command, Option } from 'clipanion'

/**
 * Base Command for Dev and build
 */
export abstract class BaseCommand extends Command {
  experimentalDataLayer = Option.Boolean('--experimentalData', {
    description:
      'DEPRECATED - Build the server with additional data querying capabilities',
  })
  isomorphicGitBridge = Option.Boolean('--isomorphicGitBridge', {
    description: 'DEPRECATED - Enable Isomorphic Git Bridge Implementation',
  })
  port = Option.String('-p,--port', '4001', {
    description: 'Specify a port to run the server on. (default 4001)',
  })
  datalayerPort = Option.String('--datalayer-port', '9000', {
    description:
      'Specify a port to run the datalayer server on. (default 9000)',
  })
  subCommand = Option.String('-c,--command', {
    description: 'The sub-command to run',
  })
  rootPath = Option.String('--rootPath', {
    description:
      'Specify the root directory to run the CLI from (defaults to current working directory)',
  })
  verbose = Option.Boolean('-v,--verbose', false, {
    description: 'increase verbosity of logged output',
  })
  noSDK = Option.Boolean('--noSDK', false, {
    description:
      "DEPRECATED - This should now be set in the config at client.skip = true'. Don't generate the generated client SDK",
  })
  noTelemetry = Option.Boolean('--noTelemetry', false, {
    description: 'Disable anonymous telemetry that is collected',
  })
  abstract execute(): Promise<number | void>
}
