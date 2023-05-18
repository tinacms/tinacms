/**

*/

import React, { useEffect, useState } from 'react'
import type { TinaCMS } from '@tinacms/toolkit'
import { useNavigate } from 'react-router-dom'
import type { TinaSchema } from '@tinacms/schema-tools'
import { FilterArgs, TinaAdminApi } from '../api'
import LoadingPage from '../components/LoadingPage'
import type { CollectionResponse } from '../types'
import { FullscreenError } from './FullscreenError'
import { handleNavigate } from '../pages/CollectionListPage'

export const useGetCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true,
  folder: { loading: boolean; fullyQualifiedName: string },
  after: string = '',
  sortKey?: string,
  filterArgs?: FilterArgs,
  search?: string
) => {
  const api = new TinaAdminApi(cms)
  const schema = cms.api.tina.schema as TinaSchema
  const collectionExtra = schema.getCollection(collectionName)
  const [collection, setCollection] = useState<CollectionResponse | undefined>(
    undefined
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [resetState, setResetSate] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetchCollection = async () => {
      if ((await api.isAuthenticated()) && !folder.loading && !cancelled) {
        const { name, order } = JSON.parse(sortKey || '{}')
        const validSortKey = collectionExtra.fields
          ?.map((x) => x.name)
          .includes(name)
          ? name
          : undefined
        try {
          const collection = await api.fetchCollection(
            collectionName,
            includeDocuments,
            filterArgs?.filterField ? '' : folder.fullyQualifiedName,
            after,
            validSortKey,
            order,
            filterArgs
          )
          setCollection(collection)
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetCollection failed: ${error.message}`
          )
          console.error(error)
          setCollection(undefined)
          setError(error)
        }

        setLoading(false)
      }
    }

    const searchCollection = async () => {
      if ((await api.isAuthenticated()) && !folder.loading && !cancelled) {
        try {
          const response = await cms.searchClient.query(
            `${search} AND _collection:${collectionName}`,
            {
              limit: 15,
              cursor: after,
            }
          )
          const docs = await Promise.allSettled(
            response.results.map((result) => {
              const [collection, relativePath] = result._id.split(':')
              return api.fetchDocument(collection, relativePath, false)
            })
          )
          setCollection({
            // TODO populate these?
            format: '',
            label: '',
            name: collectionName,
            slug: '',
            templates: [],
            documents: {
              pageInfo: {
                hasNextPage: !!response.nextCursor,
                hasPreviousPage: !!response.prevCursor,
                startCursor: '',
                endCursor: response.nextCursor || '',
              },
              edges: docs
                .filter((p) => p.status === 'fulfilled')
                .map((result) => ({ node: (result as any).value?.document })),
            },
          })
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetCollection failed: ${error.message}`
          )
          console.error(error)
          setCollection(undefined)
          setError(error)
        }

        setLoading(false)
      }
    }

    if (cancelled) return

    setLoading(true)
    if (search) {
      searchCollection()
    } else {
      fetchCollection()
    }
    // TODO: useDebounce
    return () => {
      cancelled = true
    }
  }, [
    cms,
    collectionName,
    folder.loading,
    folder.fullyQualifiedName,
    resetState,
    after,
    search,
    sortKey,
  ])

  const reFetchCollection = () => setResetSate((x) => x + 1)

  return { collection, loading, error, reFetchCollection, collectionExtra }
}

const GetCollection = ({
  cms,
  collectionName,
  folder,
  includeDocuments = true,
  startCursor,
  sortKey,
  children,
  filterArgs,
  search,
}: {
  cms: TinaCMS
  collectionName: string
  folder: { loading: boolean; fullyQualifiedName: string }
  includeDocuments?: boolean
  startCursor?: string
  sortKey?: string
  children: any
  filterArgs?: FilterArgs
  search?: string
}) => {
  const navigate = useNavigate()
  const { collection, loading, error, reFetchCollection, collectionExtra } =
    useGetCollection(
      cms,
      collectionName,
      includeDocuments,
      folder,
      startCursor || '',
      sortKey,
      filterArgs,
      search
    ) || {}
  useEffect(() => {
    if (loading) return

    // get the collection definition
    const collectionDefinition = cms.api.tina.schema.getCollection(
      collection.name
    )

    // check if the collection allows create or delete
    const allowCreate = collectionDefinition?.ui?.allowedActions?.create ?? true
    const allowDelete = collectionDefinition?.ui?.allowedActions?.delete ?? true

    if (
      !allowCreate &&
      !allowDelete &&
      // Check there is only one document
      collection.documents?.edges?.length === 1 &&
      // Check to make sure the file is not a folder
      collection.documents?.edges[0]?.node?.__typename !== 'Folder'
    ) {
      const doc = collection.documents.edges[0].node
      handleNavigate(navigate, cms, collection, collectionDefinition, doc)
    }
  }, [collection?.name || '', loading])

  if (error) {
    return <FullscreenError />
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <>{children(collection, loading, reFetchCollection, collectionExtra)}</>
  )
}

export default GetCollection
