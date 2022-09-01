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

import { createDatabase } from '@tinacms/graphql'

import {
  AuditFileSystemBridge,
  FilesystemBridge,
  AuditFilesystemStore,
  FilesystemStore,
} from '@tinacms/datalayer'
import { auditCollection, auditDocuments } from './audit'
import { logger } from '../../logger'
import chalk from 'chalk'
import prompts from 'prompts'
import { Telemetry } from '@tinacms/metrics'
import { neutralText } from '../../utils/theme'

const rootPath = process.cwd()

export const audit = async (ctx: any, next: () => void, options) => {
  const telemetry = new Telemetry({ disabled: options.noTelemetry })
  await telemetry.submitRecord({
    event: {
      name: 'tinacms:cli:audit:invoke',
      clean: Boolean(options.clean),
      useDefaults: Boolean(options.useDefaultValues),
    },
  })
  if (options.clean) {
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
  if (options.useDefaultValues && !options.clean) {
    logger.warn(
      chalk.yellowBright(
        'WARNING: using the `--useDefaultValues` without the `--clean` flag has no effect. Please re-run audit and add the `--clean` flag'
      )
    )
  }

  const database = ctx.database
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
    logger.info(`Checking ${neutralText(collection.name)} collection`)

    const returnError = await auditDocuments({
      collection,
      database,
      rootPath,
      useDefaultValues: options.useDefaultValues,
      documents: docs.edges,
      verbose: ctx.verbose,
    })
    error = error || returnError
  }
  ctx.error = error

  next()
}

export const printFinalMessage = async (
  ctx: any,
  next: () => void,
  _options
) => {
  if (ctx.error) {
    logger.error(
      chalk.redBright(`‼️ Audit ${chalk.bold('failed')} with errors`)
    )
  } else if (ctx.warning) {
    logger.warn(chalk.yellowBright('⚠️ Audit passed with warnings'))
  } else {
    logger.info(chalk.greenBright('✅ Audit passed'))
  }
  next()
}
