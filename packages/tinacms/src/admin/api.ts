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

import type { TinaCMS } from '@tinacms/toolkit'
import type { TinaSchema } from '@tinacms/schema-tools'
import type { Client } from '../internalClient'
import type { Collection, DocumentForm } from './types'

export class TinaAdminApi {
  api: Client
  useDataLayer: boolean
  schema: TinaSchema
  constructor(cms: TinaCMS) {
    this.api = cms.api.tina
    this.schema = cms.api.tina.schema
  }

  async isAuthenticated() {
    return await this.api.isAuthenticated()
  }

  async fetchCollections() {
    try {
      // TODO: fix this type
      // @ts-ignore
      const collections: Collection[] = this.schema.getCollections()
      return collections
    } catch (e) {
      console.error(`[TinaAdminAPI] Unable to fetchCollections(): ${e.message}`)
      return []
    }
  }
  async deleteDocument({
    collection,
    relativePath,
  }: {
    collection: string
    relativePath: string
  }) {
    await this.api.request(
      `#graphql
      mutation DeleteDocument($collection: String!, $relativePath: String!  ){
  deleteDocument(collection: $collection, relativePath: $relativePath){
    __typename
  }
}`,
      { variables: { collection, relativePath } }
    )
  }
  async fetchCollection(
    collectionName: string,
    includeDocuments: boolean,
    after?: string,
    sortKey?: string,
    order?: 'asc' | 'desc'
  ) {
    if (includeDocuments === true) {
      const sort = sortKey || this.schema.getIsTitleFieldName(collectionName)
      const response: { collection: Collection } =
        order === 'asc'
          ? await this.api.request(
              `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String){
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, after: $after, first: $limit) @include(if: $includeDocuments) {
            totalCount
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              node {
                ... on Document {
                  _sys {
                    title
                    template
                    breadcrumbs
                    path
                    basename
                    relativePath
                    filename
                    extension
                  }
                }
              }
            }
          }
        }
      }`,
              {
                variables: {
                  collection: collectionName,
                  includeDocuments,
                  sort,
                  limit: 10,
                  after,
                },
              }
            )
          : await this.api.request(
              `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String){
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, before: $after, last: $limit) @include(if: $includeDocuments) {
            totalCount
            pageInfo {
              hasPreviousPage
              hasNextPage
              startCursor
              endCursor
            }
            edges {
              node {
                ... on Document {
                  _sys {
                    title
                    template
                    breadcrumbs
                    path
                    basename
                    relativePath
                    filename
                    extension
                  }
                }
              }
            }
          }
        }
      }`,
              {
                variables: {
                  collection: collectionName,
                  includeDocuments,
                  sort,
                  limit: 10,
                  after,
                },
              }
            )

      return response.collection
    } else {
      try {
        // TODO: fix this type
        // @ts-ignore
        const collection: Collection = this.schema.getCollection(collectionName)
        return collection
      } catch (e) {
        console.error(
          `[TinaAdminAPI] Unable to fetchCollection(): ${e.message}`
        )
        return undefined
      }
    }
  }

  async fetchDocument(collectionName: string, relativePath: string) {
    const response: { document: DocumentForm } = await this.api.request(
      `#graphql
      query($collection: String!, $relativePath: String!) {
        document(collection:$collection, relativePath:$relativePath) {
          ... on Document {
            _values
          }
        }
      }`,
      { variables: { collection: collectionName, relativePath } }
    )

    return response
  }

  async createDocument(
    collectionName: string,
    relativePath: string,
    params: Object
  ) {
    const response = await this.api.request(
      `#graphql
      mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
        createDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`,
      {
        variables: {
          collection: collectionName,
          relativePath,
          params,
        },
      }
    )

    return response
  }

  async updateDocument(
    collectionName: string,
    relativePath: string,
    params: Object
  ) {
    const response = await this.api.request(
      `#graphql
      mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
        updateDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`,
      {
        variables: {
          collection: collectionName,
          relativePath,
          params,
        },
      }
    )

    return response
  }
}
