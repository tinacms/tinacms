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
import type { Collection, DocumentForm } from './types'

export class TinaAdminApi {
  api: {
    request: (query: string, { variables }: { variables: object }) => any
    isAuthenticated: () => boolean
  }
  schema: any
  constructor(cms: TinaCMS) {
    this.api = cms.api.tina
    this.schema = cms.api.tina.schema
  }

  async isAuthenticated() {
    return await this.api.isAuthenticated()
  }

  async fetchCollections() {
    try {
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
  async fetchCollection(collectionName: string, includeDocuments: boolean) {
    if (includeDocuments === true) {
      const response: { collection: Collection } = await this.api.request(
        `#graphql
      query($collection: String!, $includeDocuments: Boolean!){
        collection(collection: $collection){
          name
          label
          format
          templates
          documents @include(if: $includeDocuments) {
            totalCount
            edges {
              node {
                ... on Document {
                  _sys {
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
        { variables: { collection: collectionName, includeDocuments } }
      )

      return response.collection
    } else {
      try {
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
            _sys {
              breadcrumbs
              filename
            }
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
