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

import type { Collection, DocumentForm, GetDocumentFields } from './types'

export class TinaAdminApi {
  /**
   * cms.api.tina
   */
  api: {
    request: (query: string, { variables }: { variables: object }) => any
  }
  constructor(TinaApi) {
    this.api = TinaApi
  }

  async fetchCollections() {
    const response: { getCollections: Collection[] } = await this.api.request(
      `query{ getCollections { label, name } }`,
      { variables: {} }
    )

    return response
  }

  async fetchCollection(collectionName: string, includeDocuments: boolean) {
    const response: { getCollection: Collection } = await this.api.request(
      `
      query($collection: String!, $includeDocuments: Boolean!){
        getCollection(collection: $collection){
          name
          label
          format
          templates
          documents @include(if: $includeDocuments) {
            totalCount
            edges {
              node {
                ... on Document {
                  sys {
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

    return response
  }

  async fetchDocument(collectionName: string, relativePath: string) {
    const response: { getDocument: DocumentForm } = await this.api.request(
      `
      query($collection: String!, $relativePath: String!) {
        getDocument(collection:$collection, relativePath:$relativePath) {
          ... on Document {
            form
            values
          }
        }
      }`,
      { variables: { collection: collectionName, relativePath } }
    )

    return response
  }

  async fetchDocumentFields() {
    const response: GetDocumentFields = await this.api.request(
      `query { getDocumentFields }`,
      { variables: {} }
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
