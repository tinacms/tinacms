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

import { auditDocuments } from './audit'
import { logger } from '../../logger'
import chalk from 'chalk'
import prompts from 'prompts'
import { Telemetry } from '@tinacms/metrics'
import { Database } from '@tinacms/graphql'
import { AuditIssue } from './issue'

const rootPath = process.cwd()

interface AuditCtx {
  issues: AuditIssue[]
  database: Database
}

export const audit = async (ctx: AuditCtx, next: () => void, options) => {
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

  ctx.issues = []

  for (let i = 0; i < collections.length; i++) {
    const collectionIssues = await auditDocuments({
      collection: collections[i],
      database,
      rootPath,
      useDefaultValues: options.useDefaultValues,
    })

    ctx.issues = [...ctx.issues, ...collectionIssues]
  }

  next()
}

export const printFinalMessage = async (
  ctx: AuditCtx,
  next: () => void,
  _options
) => {
  const warnings = ctx.issues.filter((issue) => issue.level == 'warning')
  const errors = ctx.issues.filter((issue) => issue.level == 'error')

  if (errors.length > 0) {
    logger.error(
      chalk.redBright(
        `‼️ Audit ${chalk.bold('failed')} with ${errors.length} error(s)`
      )
    )
  } else if (warnings.length > 0) {
    logger.warn(
      chalk.yellowBright(`⚠️ Audit passed with ${warnings.length} warning(s)`)
    )
  } else {
    logger.info(chalk.greenBright('✅ Audit passed'))
  }
  next()
}
