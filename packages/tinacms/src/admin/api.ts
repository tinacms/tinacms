/**

*/

import type { TinaCMS } from '@tinacms/toolkit'
import type { TinaSchema } from '@tinacms/schema-tools'
import type { Client } from '../internalClient'
import type { Collection, DocumentForm } from './types'

export interface FilterArgs {
  filterField: string
  startsWith?: string
  before?: string
  after?: string
  booleanEquals?: boolean
}

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

  fetchCollections() {
    return this.schema.getCollections()
  }
  async renameDocument({ collection, relativePath, newRelativePath }) {
    await this.api.request(
      `#graphql
              mutation RenameDocument($collection: String!, $relativePath: String! $newRelativePath: String!) {
                updateDocument(collection: $collection, relativePath: $relativePath, params: {relativePath: $newRelativePath}){
    __typename
  }
              }
            `,
      { variables: { collection, relativePath, newRelativePath } }
    )
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
    order?: 'asc' | 'desc',
    filterArgs?: FilterArgs
  ) {
    let filter = null
    const filterField = filterArgs?.filterField
    if (filterField) {
      // if we have a filterField, we'll create an empty filter object
      filter = {
        [collectionName]: {
          [filterField]: {},
        },
      }
    }
    // If we have a filterField and a startsWith value, we'll add a filter
    if (filterField && filterArgs?.startsWith) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        startsWith: filterArgs.startsWith,
      }
    }
    if (filterField && filterArgs?.before) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        before: filterArgs.before,
      }
    }
    if (filterField && filterArgs?.after) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        after: filterArgs.after,
      }
    }
    if (
      filterField &&
      filterArgs?.booleanEquals !== null &&
      filterArgs?.booleanEquals !== undefined
    ) {
      filter[collectionName][filterField] = {
        ...(filter[collectionName][filterField] || {}),
        eq: filterArgs.booleanEquals,
      }
    }

    if (includeDocuments === true) {
      const sort = sortKey || this.schema.getIsTitleFieldName(collectionName)
      const response: { collection: Collection } =
        order === 'asc'
          ? await this.api.request(
              `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String, $filter: DocumentFilter){
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, after: $after, first: $limit, filter: $filter) @include(if: $includeDocuments) {
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
                  limit: 50,
                  after,
                  filter,
                },
              }
            )
          : await this.api.request(
              `#graphql
      query($collection: String!, $includeDocuments: Boolean!, $sort: String,  $limit: Float, $after: String, $filter: DocumentFilter){
        collection(collection: $collection){
          name
          label
          format
          templates
          documents(sort: $sort, before: $after, last: $limit, filter: $filter) @include(if: $includeDocuments) {
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
                  limit: 50,
                  after,
                  filter,
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
      mutation($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
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
