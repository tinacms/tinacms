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
export const CMD_AUDIT = 'schema:audit'
export const CMD_DUMP = 'schema:dump'
export const CMD_MIGRATE = 'schema:migrate'
export const CMD_START_SERVER = 'server:start'
export const CMD_START_PLAYGROUND = 'server:playground'
export const CMD_COMPILE_MODELS = 'schema:compile'
export const INIT = 'init'

const startServerPortOption = {
  name: '--port <port>',
  description: 'Specify a port to run the server on. (default 4001)',
}
const auditFixOption = {
  name: '--fix',
  description: 'Fix errors in the .tina folder configuration',
}
const schemaDumpOption = {
  name: '--folder <folder>',
  description: 'Dump the schema into the given path',
}
const migrateDryRunOption = {
  name: '--dry-run',
  description: 'Audit the .forestry config without migrating',
}
const subCommand = {
  name: '-c, --command <command>',
  description: 'The sub-command to run',
}
const experimentalCommand = {
  name: '--experimental',
  description: 'Run the unstable version of this service',
}
const pathOption = {
  name: '--root',
  description:
    'Specify to use the .tina folder in the root of your repository for the schema',
}

export const baseCmds: Command[] = [
  {
    command: CMD_START_SERVER,
    description: 'Start Filesystem Graphql Server',
    options: [startServerPortOption, subCommand, experimentalCommand],
    action: (options) => chain([startServer], options),
  },
  {
    command: CMD_COMPILE_MODELS,
    description: 'Compile schema into static files for the server',
    options: [experimentalCommand],
    action: (options) => chain([compile], options),
  },
  {
    command: CMD_GEN_TYPES,
    description:
      "Generate a GraphQL query for your site's schema, (and optionally Typescript types)",
    options: [experimentalCommand],
    action: (options) => chain([attachSchema, genTypes], options),
  },
  {
    command: INIT,
    options: [experimentalCommand],
    description: 'Add Tina Cloud to an existing project',
    action: (options) =>
      chain(
        [
          initTina,
          installDeps,
          async (_ctx, next) => {
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
  /**
   * These have become outdated and it's not clear if we'll bring them forward.
   */
  // {
  //   command: CMD_AUDIT,
  //   description: "Audit .tina schema",
  //   options: [auditFixOption],
  //   action: (options) => chain([audit], options),
  // },
  // {
  //   command: CMD_MIGRATE,
  //   description: "Migrate .forestry to .tina",
  //   options: [migrateDryRunOption],
  //   action: (options) => chain([migrate], options),
  // },
  // {
  //   command: CMD_DUMP,
  //   description: "Dump JSON schema into specified path",
  //   options: [schemaDumpOption],
  //   action: (options) => chain([dump], options),
  // },
]
