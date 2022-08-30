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
import {
  checkDeps,
  initTina,
  installDeps,
  successMessage,
  tinaSetup,
} from './init'

import 'dotenv/config'
import { Command } from '../command'
import { chain } from '../middleware'
import chalk from 'chalk'
import { compileClient } from './compile'
import { logger } from '../logger'
import { startServer } from './start-server'
import { waitForDB } from './waitForDB'
import { startSubprocess } from './startSubprocess'
import {
  buildCmdBuild,
  buildSetupCmdServerStart,
  buildSetupCmdBuild,
  auditCmdBuild,
  buildSetupCmdAudit,
} from '../buildTina'
import { attachPath } from '../buildTina/attachPath'
import { warnText } from '../utils/theme'

export const CMD_START_SERVER = 'server:start'
export const CMD_DEV = 'dev'
export const INIT = 'init'
export const AUDIT = 'audit'
export const CMD_BUILD = 'build'

const startServerPortOption = {
  name: '--port <port>',
  description: 'Specify a port to run the server on. (default 4001)',
}
const experimentalDatalayer = {
  name: '--experimentalData',
  description: 'Build the server with additional data querying capabilities',
}
const isomorphicGitBridge = {
  name: '--isomorphicGitBridge',
  description: 'Enable Isomorphic Git Bridge Implementation',
}
const schemaFileType = {
  name: '--schemaFileType [fileType]',
  description: 'The file type to use for the Tina schema',
}
const subCommand = {
  name: '-c, --command <command>',
  description: 'The sub-command to run',
}
const noWatchOption = {
  name: '--noWatch',
  description: "Don't regenerate config on file changes",
}
const noSDKCodegenOption = {
  name: '--noSDK',
  description: "Don't generate the generated client SDK",
}
const cleanOption = {
  name: '--clean',
  description:
    'Updates all content files to remove any data not explicitly permitted by the current schema definition',
}

const useDefaultValuesOption = {
  name: '--useDefaultValues',
  description:
    'Adds default values to the graphQL mutation so that default values can be filled into existing documents (useful for adding a field with `required: true`)',
}
const noTelemetryOption = {
  name: '--noTelemetry',
  description: 'Disable anonymous telemetry that is collected',
}
const watchFileOption = {
  name: '-w, --watchFolders [folders...]',
  description:
    'a list of folders (relative to where this is being run) that the cli will watch for changes',
}
const verboseOption = {
  name: '-v, --verbose',
  description: 'increase verbosity of logged output',
  defaultValue: false,
}
const developmentOption = {
  name: '--dev',
  description: 'Uses NODE_ENV=development when compiling client and schema',
}
const localOption = {
  name: '--local',
  description: 'Uses the local file system graphql server',
  defaultValue: false,
}

const checkOptions = async (_ctx: any, next: () => void, options: any) => {
  if (options?.experimentalData) {
    logger.warn(
      warnText(
        'Warning: you are using the `--experimentalData`flag. This flag is not needed and can safely be removed. It will be deprecated in a future version'
      )
    )
  }
  next()
}

export const baseCmds: Command[] = [
  {
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
    ],
    action: (options) =>
      chain(
        [
          attachPath,
          async (ctx, next, _) => {
            logger.warn(
              warnText(
                'server:start will be deprecated in the future, please use `tinacms dev` instead'
              )
            )
            next()
          },
          checkOptions,
          buildSetupCmdServerStart,
          startServer,
          startSubprocess,
        ],
        options
      ),
  },
  {
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
    ],
    action: (options) =>
      chain(
        [
          attachPath,
          checkOptions,
          buildSetupCmdServerStart,
          startServer,
          startSubprocess,
        ],
        options
      ),
  },
  {
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
    ],
    action: (options) =>
      chain(
        [
          attachPath,
          checkOptions,
          buildSetupCmdBuild,
          buildCmdBuild,
          compileClient,
          waitForDB,
        ],
        options
      ),
  },
  {
    command: INIT,
    options: [
      experimentalDatalayer,
      isomorphicGitBridge,
      noTelemetryOption,
      schemaFileType,
    ],
    description: 'Add Tina Cloud to an existing project',
    action: (options) =>
      chain(
        [
          attachPath,
          checkOptions,
          checkDeps,
          initTina,
          installDeps,
          buildSetupCmdBuild,
          buildCmdBuild,
          tinaSetup,
          successMessage,
        ],
        options
      ),
  },
  {
    options: [
      cleanOption,
      useDefaultValuesOption,
      noTelemetryOption,
      verboseOption,
    ],
    command: AUDIT,
    description: 'Audit your schema and the files to check for errors',
    action: (options) =>
      chain(
        [
          attachPath,
          buildSetupCmdAudit,
          auditCmdBuild,
          async (_ctx, next) => {
            logger.level = 'info'
            logger.info(
              chalk.hex('#eb6337').bgWhite('Welcome to tina audit 🦙')
            )
            next()
          },
          audit,
          printFinalMessage,
        ],
        options
      ),
  },
]
