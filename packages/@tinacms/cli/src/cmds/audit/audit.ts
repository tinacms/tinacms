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
import p from 'path'
import { logger } from '../../logger'
import { assertShape } from '@tinacms/graphql'
import chalk from 'chalk'

type AuditArgs = {
  collection: TinaCloudCollection
  database: Database
  rootPath: string
  useDefaultValues: boolean
}

const interateCollectionDocuments = async (
  collectionName: string,
  database: Database,
  action: (doc) => Promise<void>
) => {
  let endCursor
  let hasNextPage = true
  do {
    const rootNode = `${collectionName}Connection`
    const queryParams = endCursor ? `(after: "${endCursor}")` : ''
    const query = `query {
      ${rootNode}${queryParams} {
          edges {
            node {
              __typename
              ...on Document {
                _values
                _sys {
                  extension
                  path
                  relativePath
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
      `
    const result = await resolve({
      database,
      query,
      variables: {},
    })
    endCursor = result.data[rootNode].pageInfo.endCursor
    hasNextPage = result.data[rootNode].pageInfo.hasNextPage

    const documents: any[] = result.data[rootNode].edges

    for (let i = 0; i < documents.length; i++) {
      await action(documents[i].node)
    }
  } while (hasNextPage)
}

const auditDocument = async (
  node,
  args: AuditArgs
): Promise<{ warnings: string[]; errors: string[] }> => {
  let errors: string[] = []
  let warnings: string[] = []

  Object.keys(node._values)
    .map((fieldName) => node._values[fieldName])
    .filter((field) => {
      return field?.type == 'root'
    })
    .forEach((field) => {
      const errorMessages = field.children
        .filter((f) => f.type == 'invalid_markdown')
        .map((f) => f.message)

      errorMessages.forEach((errorMessage) => {
        warnings.push(errorMessage)
      })
    })

  const topLevelDefaults = {}

  // TODO: account for when collection is a string
  if (args.useDefaultValues && typeof args.collection.fields !== 'string') {
    args.collection.fields
      .filter((x) => !x.list)
      .forEach((x) => {
        const value = x.ui as any
        if (typeof value !== 'undefined') {
          topLevelDefaults[x.name] = value.defaultValue
        }
      })
  }
  const params = transformDocumentIntoMutationRequestPayload(
    node._values,
    {
      includeCollection: true,
      includeTemplate: typeof args.collection.templates !== 'undefined',
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
    database: args.database,
    query: mutation,
    variables: {
      params,
      collection: args.collection.name,
      relativePath: node._sys.relativePath,
    },
    silenceErrors: true,
    verbose: true,
  })
  if (mutationRes.errors) {
    mutationRes.errors.forEach((err) => {
      errors.push(err.message)
    })
  }

  return { errors, warnings }
}

export const auditDocuments = async (args: AuditArgs) => {
  const { collection, database, rootPath, useDefaultValues } = args

  let error = false
  let warning = false

  await interateCollectionDocuments(collection.name, database, async (doc) => {
    const fullPath = p.join(args.rootPath, doc._sys.path)
    logger.info(`Checking document: ${fullPath}`)

    const auditResult = await auditDocument(doc, args)
    auditResult.warnings.forEach((errMessage) => {
      logger.warn(chalk.yellowBright(errMessage))
    })
    auditResult.errors.forEach((errMessage) => {
      logger.error(chalk.red(errMessage))
    })

    error = error || auditResult.errors.length > 0
    warning = warning || auditResult.warnings.length > 0
  })

  return { error, warning }
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
