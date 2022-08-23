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

import { AuditIssue } from './issue'
import { validateRichText } from './validations/validateRichText'
import { validateMutations } from './validations/validateMutations'
import { AuditArgs, Resolver } from './auditArgs'

const iterateCollectionDocuments = async (
  collectionName: string,
  resolve: Resolver,
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
    const result = await resolve({ query, variables: {} })
    endCursor = result.data[rootNode].pageInfo.endCursor
    hasNextPage = result.data[rootNode].pageInfo.hasNextPage

    const documents: any[] = result.data[rootNode].edges

    for (let i = 0; i < documents.length; i++) {
      await action(documents[i].node)
    }
  } while (hasNextPage)
}

const auditDocument = async (node, args: AuditArgs): Promise<AuditIssue[]> => {
  const richTextIssues = validateRichText(node)
  const mutationIssues = await validateMutations(node, args)
  return [...richTextIssues, ...mutationIssues]
}

export const auditDocuments = async (args: AuditArgs) => {
  const { collection, resolve } = args

  let issues: AuditIssue[] = []

  await iterateCollectionDocuments(collection.name, resolve, async (doc) => {
    const docIssues = await auditDocument(doc, args)
    issues = [...issues, ...docIssues]
  })

  return issues
}
