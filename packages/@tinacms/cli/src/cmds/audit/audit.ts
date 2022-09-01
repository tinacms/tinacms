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

import { resolve } from '@tinacms/graphql'
import type { Database, TinaCloudCollection } from '@tinacms/graphql'
import path from 'path'
import { logger } from '../../logger'
import { assertShape } from '@tinacms/graphql'
import chalk from 'chalk'

type AuditArgs = {
  collection: TinaCloudCollection
  database: Database
  rootPath: string
  documents: { node: { path: string } }[]
  useDefaultValues: boolean
  verbose?: boolean
}
export const auditCollection = async (args: AuditArgs) => {
  let warning = false
  const { collection } = args
  logger.info(`Checking collection ${collection.name}`)

  const format = collection.format
  args.documents.forEach((x) => {
    const docFormat = path.extname(x.node.path)
    if (docFormat.replace('.', '') !== format) {
      warning = true
      logger.warn(
        chalk.yellowBright(
          `WARNING: there is a file with extension \`${docFormat}\` but in your schema it is defined to be \`.${format}\`\n\n\location: ${x.node.path}`
        )
      )
    }
  })
  return warning
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
      const params = transformDocumentIntoMutationRequestPayload(
        docResult.data.document._values,
        {
          includeCollection: true,
          includeTemplate: typeof collection.templates !== 'undefined',
        },
        topLevelDefaults
      )

      const mutation = `mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
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

// TODO: move this to its own package
export const transformDocumentIntoMutationRequestPayload = (
  document: {
    _collection: string
    __typename?: string
    _template: string
    [key: string]: unknown
  },
  /** Whether to include the collection and template names as top-level keys in the payload */
  instructions: { includeCollection?: boolean; includeTemplate?: boolean },
  defaults?: any
) => {
  const { _collection, __typename, _template, ...rest } = document

  const params = transformParams(rest)
  const paramsWithTemplate = instructions.includeTemplate
    ? { [_template]: params }
    : params

  return instructions.includeCollection
    ? { [_collection]: { ...defaults, ...filterObject(paramsWithTemplate) } }
    : { ...defaults, ...filterObject(paramsWithTemplate) }
}

const transformParams = (data: unknown) => {
  if (['string', 'number', 'boolean'].includes(typeof data)) {
    return data
  }
  if (Array.isArray(data)) {
    return data.map((item) => transformParams(item))
  }
  try {
    assertShape<{ _template: string; __typename?: string }>(data, (yup) =>
      // @ts-ignore No idea what yup is trying to tell me:  Type 'RequiredStringSchema<string, Record<string, any>>' is not assignable to type 'AnySchema<any, any, any>
      yup.object({ _template: yup.string().required() })
    )
    const { _template, __typename, ...rest } = data
    const nested = transformParams(rest)
    return { [_template]: nested }
  } catch (e) {
    if (e.message === 'Failed to assertShape - _template is a required field') {
      if (!data) {
        return undefined
        return []
      }
      const accum = {}
      Object.entries(data).map(([keyName, value]) => {
        accum[keyName] = transformParams(value)
      })
      return accum
    } else {
      if (!data) {
        return undefined
        return []
      }
      throw e
    }
  }
}

// SRC: https://stackoverflow.com/questions/39977214/merge-in-es6-es7object-assign-without-overriding-undefined-values
function filterObject(obj) {
  const ret = {}
  Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .forEach((key) => (ret[key] = obj[key]))
  return ret
}
