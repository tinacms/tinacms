/**

*/
import chalk from 'chalk'
import { logger } from '../../logger'

export async function successMessage(ctx: any, next: () => void, options) {
  logger.info(`Tina setup ${chalk.underline.green('done')} ✅\n`)

  logger.info('Next Steps: \n')

  logger.info(`${chalk.bold('Run your site with Tina')}`)
  logger.info(`  yarn dev \n`)

  logger.info(`${chalk.bold('Start Editing')}`)
  logger.info(`  Go to 'http://localhost:3000/admin' \n`)

  logger.info(`${chalk.bold('Read the docs')}`)
  logger.info(
    `  Check out 'https://tina.io/docs/introduction/tina-init/#adding-tina' for help getting started with Tina \n`
  )

  logger.info(`Enjoy Tina! 🦙`)

  next()
}
