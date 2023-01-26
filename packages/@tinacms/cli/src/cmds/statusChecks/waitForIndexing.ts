/**

*/

import Progress from 'progress'
import { parseURL, TinaCloudSchema } from '@tinacms/schema-tools'

import { logger } from '../../logger'
import { spin } from '../../utils/spinner'
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

export const waitForDB = async (
  ctx: {
    schema?: TinaCloudSchema<true>
    apiUrl: string
    isSelfHostedDatabase?: boolean
  },
  next,
  options: { verbose?: boolean }
) => {
  const token = ctx.schema.config.token
  if (ctx.isSelfHostedDatabase) {
    return next()
  }
  const { clientId, branch, isLocalClient, host } = parseURL(ctx.apiUrl)

  if (isLocalClient) {
    return next()
  }
  const bar = new Progress(
    'Checking indexing process in Tina Cloud... :prog',
    1
  )

  const pollForStatus = async () => {
    try {
      if (options.verbose) {
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
          `Attempting to index but responded with status 'failed', To retry the indexing process, click “Reset Repository Cache” in tina cloud advance settings.  ${error}`
        )

        // Index Unknown
      } else {
        throw new IndexFailedError(
          `Attempting to index but responded with status 'unknown', To retry the indexing process, click “Reset Repository Cache” in tina cloud advance settings.  ${error}`
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

  spin({
    text: 'Checking indexing process in Tina Cloud...',
    waitFor: pollForStatus,
  })
}
