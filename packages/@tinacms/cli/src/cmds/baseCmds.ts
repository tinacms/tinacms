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

import { attachSchema, genTypes } from './query-gen'
import { audit, printFinalMessage } from './audit'
import {
  checkDeps,
  initTina,
  installDeps,
  successMessage,
  tinaSetup,
} from './init'

import { Command } from '../command'
import { chain } from '../middleware'
import chalk from 'chalk'
import { compile } from './compile'
import { logger } from '../logger'
import { startServer } from './start-server'

export const CMD_GEN_TYPES = 'schema:types'
export const CMD_START_SERVER = 'server:start'
export const CMD_COMPILE_MODELS = 'schema:compile'
export const INIT = 'init'
export const AUDIT = 'audit'

const startServerPortOption = {
  name: '--port <port>',
  description: 'Specify a port to run the server on. (default 4001)',
}
const experimentalDatalayer = {
  name: '--experimentalData',
  description: 'Build the server with additional data querying capabilities',
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
}

export const baseCmds: Command[] = [
  {
    command: CMD_START_SERVER,
    description: 'Start Filesystem Graphql Server',
    options: [
      startServerPortOption,
      subCommand,
      experimentalDatalayer,
      noWatchOption,
      noSDKCodegenOption,
      noTelemetryOption,
      watchFileOption,
    ],
    action: (options) => chain([startServer], options),
  },
  {
    command: CMD_COMPILE_MODELS,
    description: 'Compile schema into static files for the server',
    options: [experimentalDatalayer, noTelemetryOption],
    action: (options) => chain([compile], options),
  },
  {
    command: CMD_GEN_TYPES,
    description:
      "Generate a GraphQL query for your site's schema, (and optionally Typescript types)",
    options: [experimentalDatalayer, noSDKCodegenOption, noTelemetryOption],
    action: (options) => chain([attachSchema, genTypes], options),
  },
  {
    command: INIT,
    options: [experimentalDatalayer, noTelemetryOption, schemaFileType],
    description: 'Add Tina Cloud to an existing project',
    action: (options) =>
      chain(
        [
          checkDeps,
          initTina,
          installDeps,
          async (_ctx, next, options) => {
            await compile(_ctx, next, options)
            next()
          },
          attachSchema,
          genTypes,
          tinaSetup,
          successMessage,
        ],
        options
      ),
  },
  {
    options: [cleanOption, useDefaultValuesOption, noTelemetryOption],
    command: AUDIT,
    description: 'Audit your schema and the files to check for errors',
    action: (options) =>
      chain(
        [
          // Disable the output of the compile step
          async (_ctx, next) => {
            logger.level = 'error'
            next()
          },
          async (_ctx, next) => {
            await compile(_ctx, next, options)
            next()
          },
          attachSchema,
          genTypes,
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
