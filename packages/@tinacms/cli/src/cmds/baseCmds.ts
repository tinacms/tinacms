/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { audit, printFinalMessage } from './audit'

import 'dotenv/config'
import { command, Command } from '../command'
import chalk from 'chalk'
import { logger } from '../logger'
import { startServer } from './start-server'
import { waitForDB } from './statusChecks/waitForIndexing'
import { startSubprocess } from './startSubprocess'
import {
  buildSetupCmdServerStart,
  buildSetupCmdBuild,
  buildCmdBuild,
  buildSetupCmdAudit,
  auditCmdBuild,
} from '../buildTina'
import { initStaticTina } from './init'
import { attachPath } from '../buildTina/attachPath'
import { warnText } from '../utils/theme'
import { checkClientInfo } from './statusChecks/checkClientInformation'

export const CMD_START_SERVER = 'server:start'
export const CMD_DEV = 'dev'
export const INIT = 'init'
export const AUDIT = 'audit'
export const CMD_BUILD = 'build'

const startServerPortOption = {
  name: '--port <port>',
  key: 'port',
  defaultValue: '4001',
  description: 'Specify a port to run the server on. (default 4001)',
} as const
const rootPathOption = {
  name: '--rootPath <rootPath>',
  key: 'rootPath',
  description:
    'Specify the root directory to run the CLI from (defaults to current working directory)',
} as const
const experimentalDatalayer = {
  name: '--experimentalData',
  key: 'experimentalData',
  description: 'Build the server with additional data querying capabilities',
  defaultValue: false,
} as const
const isomorphicGitBridge = {
  name: '--isomorphicGitBridge',
  key: 'isomorphicGitBridge',
  description: 'Enable Isomorphic Git Bridge Implementation',
  defaultValue: false,
} as const
const schemaFileType = {
  name: '--schemaFileType [fileType]',
  key: 'schemaFileType',
  description: 'The file type to use for the Tina schema',
} as const
const subCommand = {
  name: '-c, --command <command>',
  key: 'command',
  description: 'The sub-command to run',
} as const
const noWatchOption = {
  name: '--noWatch',
  key: 'noWatch',
  defaultValue: false,
  description: "Don't regenerate config on file changes",
} as const
const noSDKCodegenOption = {
  name: '--noSDK',
  key: 'noSDK',
  defaultValue: false,
  description: "Don't generate the generated client SDK",
} as const
const cleanOption = {
  name: '--clean',
  key: 'clean',
  defaultValue: false,
  description:
    'Updates all content files to remove any data not explicitly permitted by the current schema definition',
} as const
const useDefaultValuesOption = {
  name: '--useDefaultValues',
  key: 'useDefaultValues',
  defaultValue: false,
  description:
    'Adds default values to the graphQL mutation so that default values can be filled into existing documents (useful for adding a field with `required: true`)',
} as const
const noTelemetryOption = {
  name: '--noTelemetry',
  key: 'noTelemetry',
  defaultValue: false,
  description: 'Disable anonymous telemetry that is collected',
} as const
const watchFileOption = {
  name: '-w, --watchFolders [folders...]',
  key: 'watchFolders',
  defaultValue: [] as string[],
  description:
    'a list of folders (relative to where this is being run) that the cli will watch for changes',
} as const
const verboseOption = {
  name: '-v, --verbose',
  key: 'verbose',
  description: 'increase verbosity of logged output',
  defaultValue: false,
} as const
const developmentOption = {
  name: '--dev',
  key: 'dev',
  defaultValue: false,
  description: 'Uses NODE_ENV=development when compiling client and schema',
} as const
const localOption = {
  name: '--local',
  key: 'local',
  description: 'Uses the local file system graphql server',
  defaultValue: false,
} as const

const checkOptions = async <C extends object>({
  context,
  options,
}: {
  context: C
  options: { [key: string]: unknown; experimentalData?: boolean }
}): Promise<C> => {
  if (options?.experimentalData) {
    logger.warn(
      warnText(
        'Warning: you are using the `--experimentalData`flag. This flag is not needed and can safely be removed. It will be deprecated in a future version'
      )
    )
  }
  return context
}

export const baseCmds: Command[] = [
  command({
    command: CMD_START_SERVER,
    description: 'Start Filesystem Graphql Server',
    options: [
      startServerPortOption,
      subCommand,
      experimentalDatalayer,
      isomorphicGitBridge,
      noWatchOption,
      noSDKCodegenOption,
      noTelemetryOption,
      watchFileOption,
      verboseOption,
      developmentOption,
      localOption,
      rootPathOption,
    ],
    action: async (options) => {
      attachPath({ context: {}, options }).then((context) => {
        logger.warn(
          warnText(
            'server:start will be deprecated in the future, please use `tinacms dev` instead'
          )
        )
        checkOptions({ context: context, options }).then((context) =>
          buildSetupCmdServerStart({ context, options }).then((context) =>
            startServer({ context, options }).then((context) =>
              startSubprocess({ context, options })
            )
          )
        )
      })
    },
  }),
  command({
    command: CMD_DEV,
    description: 'Builds tina and starts the dev server.',
    options: [
      startServerPortOption,
      subCommand,
      isomorphicGitBridge,
      noWatchOption,
      noSDKCodegenOption,
      noTelemetryOption,
      watchFileOption,
      verboseOption,
      rootPathOption,
    ],
    action: async (options) => {
      attachPath({ context: {}, options }).then((context) =>
        checkOptions({ context, options }).then((context) =>
          buildSetupCmdServerStart({
            context,
            options,
          }).then((context) =>
            startServer({ context, options }).then((context) =>
              startSubprocess({ context, options })
            )
          )
        )
      )
    },
  }),
  command({
    command: CMD_BUILD,
    description: 'Build Tina',
    options: [
      experimentalDatalayer,
      isomorphicGitBridge,
      noSDKCodegenOption,
      noTelemetryOption,
      verboseOption,
      developmentOption,
      localOption,
      rootPathOption,
    ],
    action: async (options) => {
      attachPath({ context: {}, options }).then((context) =>
        checkOptions({ context, options }).then((context) =>
          buildSetupCmdBuild({ context, options }).then((context) =>
            buildCmdBuild({ context, options }).then((context) =>
              checkClientInfo({ context, options }).then((context) =>
                waitForDB({ context, options })
              )
            )
          )
        )
      )
    },
  }),
  command({
    command: INIT,
    options: [
      rootPathOption,
      experimentalDatalayer,
      isomorphicGitBridge,
      noTelemetryOption,
      schemaFileType,
    ],
    description: 'Add Tina Cloud to an existing project',
    action: async (options) => {
      attachPath({ context: {}, options }).then((context) =>
        checkOptions({ context, options }).then((context) =>
          initStaticTina({ context, options })
        )
      )
    },
  }),
  command({
    options: [
      rootPathOption,
      cleanOption,
      useDefaultValuesOption,
      noTelemetryOption,
      verboseOption,
    ],
    command: AUDIT,
    description: 'Audit your schema and the files to check for errors',
    action: async (options) => {
      attachPath({ context: {}, options }).then((context) =>
        buildSetupCmdAudit({ context, options }).then((context) =>
          auditCmdBuild({ context, options }).then((context) => {
            logger.level = 'info'
            logger.info(
              chalk.hex('#eb6337').bgWhite('Welcome to tina audit 🦙')
            )
            audit({ context, options }).then((context) =>
              printFinalMessage({ context, options })
            )
          })
        )
      )
    },
  }),
]
