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
      `mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
        createDocument(
          collection: $collection,
          relativePath: $relativePath,
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
      `mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
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
