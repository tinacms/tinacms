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
import { logText } from '../../utils/theme'

const POLLING_INTERVAL = 5000

const STATUS_INPROGRESS = 'inprogress'
const STATUS_COMPLETE = 'complete'
const STATUS_FAILED = 'failed'

interface IndexStatusResponse {
  status: 'inprogress' | 'complete' | 'failed' | 'unknown'
  timestamp: number
  error?: string
}

class IndexFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IndexFailedError'
  }
}

export const waitForDB = async (ctx, next, options: { verbose?: boolean }) => {
  if (options.verbose) {
    logger.info(logText('Waiting for DB...'))
  }

  if (!ctx.client) {
    if (options.verbose) {
      logger.info(logText('client is unavailable, skipping...'))
    }
    return next()
  }

  const client = ctx.client

  const { host, clientId, branch, isLocalClient } = client.parseURL()

  if (isLocalClient) {
    if (options.verbose) {
      logger.info(logText('client is local, skipping...'))
    }
    return next()
  }

  const pollForStatus = async () => {
    try {
      if (options.verbose) {
        logger.info(logText('Polling for status...'))
      }
      const headers = new Headers()
      headers.append('Content-Type', 'application/json')
      if (client.readonlyToken) {
        headers.append('X-API-KEY', client.readonlyToken)
      }

      const response = await fetch(
        `https://${host}/db/${clientId}/status/${branch}`,
        {
          method: 'GET',
          headers,
        }
      )
      const { status, error } = (await response.json()) as IndexStatusResponse

      const statusMessage = `DB responded with: '${status}'`

      // Index Complete
      if (status === STATUS_COMPLETE) {
        if (options.verbose) {
          logger.info(logText(`${statusMessage}`))
        }
        return next()

        // Index Inprogress
      } else if (status === STATUS_INPROGRESS) {
        if (options.verbose) {
          logger.info(logText(`${statusMessage}, trying again in 5 seconds`))
        }
        setTimeout(pollForStatus, POLLING_INTERVAL)

        // Index Failed
      } else if (status === STATUS_FAILED) {
        throw new IndexFailedError(
          `Attempting to index DB responded with status 'failed', ${error}`
        )

        // Index Unknown
      } else {
        if (options.verbose) {
          logger.info(logText(`${statusMessage}`))
        }
        return next()
      }
    } catch (e) {
      if (e instanceof IndexFailedError) {
        throw e
      } else {
        throw new Error(
          `Unable to query DB for indexing status, encountered error: ${e.message}`
        )
      }
    }
  }

  pollForStatus()
}
