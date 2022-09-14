import Progress from 'progress'
import { logger } from '../../logger'
import { logText, successText } from '../../utils/theme'

export const checkClientInfo = async (
  ctx,
  next,
  _options: { verbose?: boolean }
) => {
  const client = ctx.client

  const bar = new Progress('Checking clientId, token and branch. :prog', 1)

  try {
    await client.request({
      query: `query {
        collections {
          name
        }
      }`,
    })
    bar.tick({
      prog: '✅',
    })
  } catch (e) {
    bar.tick({
      prog: '❌',
    })
    console.warn(
      'Error when checking client information. Please check you have the correct client ID, URL and read only token configured. For more information see https://tina.io/docs/tina-cloud/connecting-site/'
    )
    throw e
  }

  next()
}
