import Progress from 'progress'
import { Config, parseURL } from '@tinacms/schema-tools'
import fetch, { Headers } from 'node-fetch'

import { logger } from '../../../logger'
import { spin } from '../../../utils/spinner'
import { logText } from '../../../utils/theme'
import { sleepAndCallFunc } from '../../../utils/sleep'

const POLLING_INTERVAL = 5000

const STATUS_INPROGRESS = 'inprogress'
const STATUS_COMPLETE = 'complete'
const STATUS_FAILED = 'failed'

export interface IndexStatusResponse {
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

export const waitForDB = async (
  config: Config<true>,
  apiUrl: string,
  verbose?: boolean
) => {
  const token = config.token
  const { clientId, branch, isLocalClient, host } = parseURL(apiUrl)

  // Can't check status if we're not using Tina Cloud
  if (isLocalClient || !host || !clientId || !branch) {
    if (verbose) {
      logger.info(logText('Not using Tina Cloud, skipping DB check'))
    }
    return
  }

  const bar = new Progress(
    'Checking indexing process in Tina Cloud... :prog',
    1
  )

  const pollForStatus = async () => {
    try {
      if (verbose) {
        logger.info(logText('Polling for status...'))
      }
      const headers = new Headers()
      headers.append('Content-Type', 'application/json')

      if (token) {
        headers.append('X-API-KEY', token)
      }

      const response = await fetch(
        `https://${host}/db/${clientId}/status/${branch}`,
        {
          method: 'GET',
          headers,
          cache: 'no-cache',
        }
      )
      const { status, error } = (await response.json()) as IndexStatusResponse

      const statusMessage = `Indexing status: '${status}'`

      // Index Complete
      if (status === STATUS_COMPLETE) {
        bar.tick({
          prog: '✅',
        })

        // Index Inprogress
      } else if (status === STATUS_INPROGRESS) {
        if (verbose) {
          logger.info(logText(`${statusMessage}, trying again in 5 seconds`))
        }
        await sleepAndCallFunc({ fn: pollForStatus, ms: POLLING_INTERVAL })

        // Index Failed
      } else if (status === STATUS_FAILED) {
        throw new IndexFailedError(
          `Attempting to index but responded with status 'failed'. To retry the indexing process, click the "Reindex" button for '${branch}' in the Tina Cloud configuration for this project.  ${error}`
        )

        // Index Unknown
      } else {
        throw new IndexFailedError(
          `Attempting to index but responded with status 'unknown'. To retry the indexing process, click the "Reindex" button for '${branch}' in the Tina Cloud configuration for this project.  ${error}`
        )
      }
    } catch (e) {
      if (e instanceof IndexFailedError) {
        bar.tick({
          prog: '❌',
        })
        throw e
      } else {
        throw new Error(
          `Unable to query DB for indexing status, encountered error: ${e.message}`
        )
      }
    }
  }

  await spin({
    text: 'Checking indexing process in Tina Cloud...',
    waitFor: pollForStatus,
  })
}
