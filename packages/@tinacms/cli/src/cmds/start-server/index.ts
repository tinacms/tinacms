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

import childProcess from 'child_process'
import path from 'path'
import { buildSchema } from '@tinacms/graphql'
import { genTypes } from '../query-gen'
import { compile } from '../compile'
import chokidar from 'chokidar'
import { dangerText } from '../../utils/theme'
import { logger } from '../../logger'

interface Options {
  port?: number
  command?: string
  experimental?: boolean
  noWatch?: boolean
}

const gqlPackageFile = require.resolve('@tinacms/graphql')

export async function startServer(
  _ctx,
  _next,
  { port = 4001, command, experimental, noWatch }: Options
) {
  const startSubprocess = () => {
    if (typeof command === 'string') {
      const commands = command.split(' ')
      const firstCommand = commands[0]
      const args = commands.slice(1) || []
      const ps = childProcess.spawn(firstCommand, args, {
        stdio: 'inherit',
        shell: true,
      })
      ps.on('error', (code) => {
        logger.error(
          dangerText(
            `An error has occurred in the Next.js child process. Error message below`
          )
        )
        logger.error(`name: ${code.name}
message: ${code.message}

stack: ${code.stack || 'No stack was provided'}`)
      })
      ps.on('close', (code) => {
        logger.info(`child process exited with code ${code}`)
        process.exit(code)
      })
    }
  }
  const rootPath = process.cwd()
  let ready = false
  if (!noWatch && !process.env.CI) {
    chokidar
      .watch(`${rootPath}/**/*.{ts,gql,graphql}`, {
        ignored: `${path.resolve(rootPath)}/.tina/__generated__/**/*`,
      })
      .on('ready', async () => {
        console.log('Generating Tina config')
        try {
          await build()
          ready = true
          startSubprocess()
        } catch (e) {
          logger.info(dangerText(`${e.message}`))
          process.exit(0)
        }
      })
      .on('all', async () => {
        if (ready) {
          logger.info('Tina change detected, regenerating config')
          try {
            await build()
          } catch (e) {
            logger.info(
              dangerText(
                'Compilation failed with errors. Server has not been restarted.'
              ) + `see error below \n ${e.message}`
            )
          }
        }
      })
  }

  const build = async () => {
    await compile(null, null)
    const schema = await buildSchema(rootPath)
    await genTypes({ schema }, () => {}, {})
  }

  const state = {
    server: null,
    sockets: [],
  }

  let isReady = false

  const start = async () => {
    const s = require('./server')
    state.server = await s.default(experimental)

    state.server.listen(port, () => {
      logger.info(`Started Filesystem GraphQL server on port: ${port}`)
      logger.info(`Visit the playground at http://localhost:${port}/altair/`)
    })
    state.server.on('error', function (e) {
      if (e.code === 'EADDRINUSE') {
        logger.error(dangerText(`Port 4001 already in use`))
        process.exit()
      }
      throw e
    })
    state.server.on('connection', (socket) => {
      state.sockets.push(socket)
    })
  }

  const restart = async () => {
    logger.info('Detected change to gql package, restarting...')
    delete require.cache[gqlPackageFile]

    state.sockets.forEach((socket) => {
      if (socket.destroyed === false) {
        socket.destroy()
      }
    })
    state.sockets = []
    state.server.close(() => {
      logger.info('Server closed')
      start()
    })
  }

  if (!noWatch && !process.env.CI) {
    chokidar
      .watch([gqlPackageFile])
      .on('ready', async () => {
        isReady = true
        start()
      })
      .on('all', async () => {
        if (isReady) {
          restart()
        }
      })
  } else {
    if (process.env.CI) {
      logger.info('Detected CI environment, omitting watch commands...')
    }
    start()
    startSubprocess()
  }
}
