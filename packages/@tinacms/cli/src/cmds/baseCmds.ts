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

import { Command } from '../command'
import { chain } from '../middleware'
import { genTypes, attachSchema } from './query-gen'
import { startServer } from './start-server'
import { compile } from './compile'
import { initTina, installDeps, tinaSetup, successMessage } from './init'

export const CMD_GEN_TYPES = 'schema:types'
export const CMD_START_SERVER = 'server:start'
export const CMD_COMPILE_MODELS = 'schema:compile'
export const INIT = 'init'

const startServerPortOption = {
  name: '--port <port>',
  description: 'Specify a port to run the server on. (default 4001)',
}
const experimentalDatalayer = {
  name: '--experimentalData',
  description: 'Build the server with additional data querying capabilities',
}
const subCommand = {
  name: '-c, --command <command>',
  description: 'The sub-command to run',
}
const noWatchOption = {
  name: '--noWatch',
  description: "Don't regenerate config on file changes",
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
    ],
    action: (options) => chain([startServer], options),
  },
  {
    command: CMD_COMPILE_MODELS,
    description: 'Compile schema into static files for the server',
    options: [experimentalDatalayer],
    action: (options) => chain([compile], options),
  },
  {
    command: CMD_GEN_TYPES,
    description:
      "Generate a GraphQL query for your site's schema, (and optionally Typescript types)",
    options: [experimentalDatalayer],
    action: (options) => chain([attachSchema, genTypes], options),
  },
  {
    command: INIT,
    options: [experimentalDatalayer],
    description: 'Add Tina Cloud to an existing project',
    action: (options) =>
      chain(
        [
          initTina,
          installDeps,
          async (_ctx, next) => {
            await compile(_ctx, next)
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
]
