import prompts from 'prompts'
import { Telemetry } from '@tinacms/metrics'
import { neutralText } from '../../../utils/theme'
import { resolve } from '@tinacms/graphql'
import type { Database, Collection } from '@tinacms/graphql'
import { logger } from '../../../logger'
import { assertShape } from '@tinacms/graphql'
import chalk from 'chalk'

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

type AuditArgs = {
  collection: Collection<true>
  database: Database
  documents: { node: { path: string } }[]
  useDefaultValues: boolean
  verbose?: boolean
}

export const auditDocuments = async (args: AuditArgs) => {
  const { collection, database, useDefaultValues, documents } = args
  let error = false
  for (let i = 0; i < documents.length; i++) {
    const node = documents[i].node
    const relativePath = node.path.replace(`${collection.path}/`, '')
    const documentQuery = `query {
        document(collection: "${collection.name}", relativePath: "${relativePath}") {
          __typename
          ...on Document {
            _values
          }
        }
      }`
    const docResult = await resolve({
      database,
      query: documentQuery,
      variables: {},
      silenceErrors: true,
      verbose: args.verbose || false,
      isAudit: true,
    })

    if (docResult.errors) {
      error = true
      docResult.errors.forEach((err) => {
        logger.error(chalk.red(err.message))
        // @ts-ignore FIXME: this doesn't seem right
        if (err.originalError.originalError) {
          logger.error(
            // @ts-ignore FIXME: this doesn't seem right
            chalk.red(`    ${err.originalError.originalError.message}`)
          )
        }
      })
    } else {
      const topLevelDefaults = {}

      // TODO: account for when collection is a string
      if (useDefaultValues && typeof collection.fields !== 'string') {
        collection.fields
          .filter((x) => !x.list)
          .forEach((x) => {
            const value = x.ui as any
            if (typeof value !== 'undefined') {
              topLevelDefaults[x.name] = value.defaultValue
            }
          })
      }
      const tinaSchema = await database.getSchema()
      const values = mergeValuesWithDefaults(
        docResult.data.document._values,
        topLevelDefaults
      )
      const params = tinaSchema.transformPayload(collection.name, values)

      const mutation = `mutation($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
        updateDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`

      const mutationRes = await resolve({
        database,
        query: mutation,
        variables: {
          params,
          collection: collection.name,
          relativePath: relativePath,
        },
        isAudit: true,
        silenceErrors: true,
        verbose: args.verbose || false,
      })
      if (mutationRes.errors) {
        mutationRes.errors.forEach((err) => {
          error = true
          logger.error(chalk.red(err.message))
        })
      }
    }
  }
  return error
}

export const mergeValuesWithDefaults = (
  document: object,
  defaults?: object
) => {
  return { ...defaults, ...filterObject(document) }
}

// SRC: https://stackoverflow.com/questions/39977214/merge-in-es6-es7object-assign-without-overriding-undefined-values
function filterObject(obj) {
  const ret = {}
  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .forEach((key) => (ret[key] = obj[key]))
  return ret
}
