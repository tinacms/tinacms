import { logger } from '../../logger'
import { logText, successText } from '../../utils/theme'

export const checkClientInfo = async (
  ctx,
  next,
  options: { verbose?: boolean }
) => {
  const client = ctx.client

  if (options.verbose) {
    logger.info(logText('Checking client information...'))
  }

  try {
    await client.request({
      query: `query {
        collections {
          name
        }
      }`,
    })
    logger.info(successText('Client information is valid'))
  } catch (e) {
    console.warn(
      'Error when checking client information. Please check you have the correct client ID, URL and read only token configured. For more information see https://tina.io/docs/tina-cloud/connecting-site/'
    )
    throw e
  }

  next()
}
