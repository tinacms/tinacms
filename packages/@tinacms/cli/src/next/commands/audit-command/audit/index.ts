/**

*/

import { auditDocuments } from './audit'
import { logger } from '../../../../logger'
import chalk from 'chalk'
import prompts from 'prompts'
import { Telemetry } from '@tinacms/metrics'
import { neutralText } from '../../../../utils/theme'
import { Database } from '@tinacms/graphql'

const rootPath = process.cwd()

export const audit = async ({
  database,
  clean,
  useDefaultValues,
  noTelemetry,
  verbose,
}: {
  database: Database
  clean?: boolean
  useDefaultValues?: boolean
  noTelemetry?: boolean
  verbose?: boolean
}) => {
  const telemetry = new Telemetry({ disabled: noTelemetry })
  await telemetry.submitRecord({
    event: {
      name: 'tinacms:cli:audit:invoke',
      clean: Boolean(clean),
      useDefaults: Boolean(useDefaultValues),
    },
  })
  if (clean) {
    logger.info(
      `You are using the \`--clean\` option. This will modify your content as if a user is submitting a form. Before running this you should have a ${chalk.bold(
        'clean git tree'
      )} so unwanted changes can be undone.\n\n`
    )
    const res = await prompts({
      name: 'useClean',
      type: 'confirm',
      message: `Do you want to continue?`,
    })
    if (!res.useClean) {
      logger.warn(chalk.yellowBright('⚠️ Audit not complete'))
      process.exit(0)
    }
  }
  if (useDefaultValues && !clean) {
    logger.warn(
      chalk.yellowBright(
        'WARNING: using the `--useDefaultValues` without the `--clean` flag has no effect. Please re-run audit and add the `--clean` flag'
      )
    )
  }

  const schema = await database.getSchema()
  const collections = schema.getCollections()
  let error = false

  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i]
    // Not a huge fan of querying the database from outside of GraphQL
    // but this allows us to return the list of items unhydrated, so errors
    // in a single document don't cause the entire list query to fail
    const docs = await database.query(
      { collection: collection.name, first: -1, filterChain: [] },
      (item) => ({ path: item })
    )
    logger.info(
      `Checking ${neutralText(collection.name)} collection. ${
        docs.edges.length
      } Documents`
    )

    const returnError = await auditDocuments({
      collection,
      database,
      rootPath,
      useDefaultValues: useDefaultValues,
      documents: docs.edges,
      verbose: verbose,
    })
    error = error || returnError
  }
  if (error) {
    logger.error(
      chalk.redBright(`‼️ Audit ${chalk.bold('failed')} with errors`)
    )
    // } else if (warning) {
    //   logger.warn(chalk.yellowBright('⚠️ Audit passed with warnings'))
  } else {
    logger.info(chalk.greenBright('✅ Audit passed'))
  }
}
