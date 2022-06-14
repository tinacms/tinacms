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

import { logger } from '../../logger'
import childProcess from 'child_process'
import { dangerText } from '../../utils/theme'

interface Options {
  command?: string
}

export const startSubprocess = async (_ctx, next, { command }: Options) => {
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
