/**

*/

import React, { useEffect, useState } from 'react'
import type { TinaCMS } from '@tinacms/toolkit'
import { useNavigate } from 'react-router-dom'
import type { Collection, TinaSchema } from '@tinacms/schema-tools'
import { FilterArgs, TinaAdminApi } from '../api'
import LoadingPage from '../components/LoadingPage'
import type { CollectionResponse, DocumentForm } from '../types'
import { FullscreenError } from './FullscreenError'
import { handleNavigate } from '../pages/CollectionListPage'

export const useGetCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true,
  folder: { loading: boolean; fullyQualifiedName: string },
  after: string = '',
  sortKey?: string,
  filterArgs?: FilterArgs
) => {
  const api = new TinaAdminApi(cms)
  const schema = cms.api.tina.schema as TinaSchema
  const collectionExtra = schema.getCollection(collectionName)
  const [collection, setCollection] = useState<
    CollectionResponse | Collection | undefined
  >(undefined)
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

    if (cancelled) return

    setLoading(true)
    fetchCollection()

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
    sortKey,
  ])

  const reFetchCollection = () => setResetSate((x) => x + 1)

  return { collection, loading, error, reFetchCollection, collectionExtra }
}

export const useSearchCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true,
  folder: { loading: boolean; fullyQualifiedName: string },
  after: string = '',
  search?: string
) => {
  const api = new TinaAdminApi(cms)
  const schema = cms.api.tina.schema as TinaSchema
  const collectionExtra = schema.getCollection(collectionName)
  const [collection, setCollection] = useState<
    CollectionResponse | Collection | undefined
  >(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [resetState, setResetSate] = useState(0)

  useEffect(() => {
    let cancelled = false

    const searchCollection = async () => {
      if ((await api.isAuthenticated()) && !folder.loading && !cancelled) {
        try {
          const response = (await cms.api.search.query(
            `${search} AND _collection:${collectionName}`,
            {
              limit: 15,
              cursor: after,
            }
          )) as {
            results: { _id: string }[]
            nextCursor: string
            prevCursor: string
          }
          const docs = (await Promise.allSettled<
            Promise<{ document: DocumentForm }>
          >(
            response.results.map((result) => {
              const [collection, relativePath] = result._id.split(':')
              return api.fetchDocument(collection, relativePath, false)
            })
          )) as {
            status: 'fulfilled' | 'rejected'
            value: { document: DocumentForm }
          }[]
          const edges = docs
            .filter((p) => p.status === 'fulfilled' && !!p.value?.document)
            .map((result) => ({ node: result.value.document })) as any[]
          const c = await api.fetchCollection(collectionName, false, '')
          setCollection({
            format: collection.format,
            label: collection.label,
            name: collectionName,
            templates: collection.templates,
            documents: {
              pageInfo: {
                hasNextPage: !!response.nextCursor,
                hasPreviousPage: !!response.prevCursor,
                startCursor: '',
                endCursor: response.nextCursor || '',
              },
              edges,
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
    searchCollection()

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
    search
      ? useSearchCollection(
          cms,
          collectionName,
          includeDocuments,
          folder,
          startCursor || '',
          search
        )
      : useGetCollection(
          cms,
          collectionName,
          includeDocuments,
          folder,
          startCursor || '',
          sortKey,
          filterArgs
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

    const collectionResponse = collection as CollectionResponse
    if (
      !allowCreate &&
      !allowDelete &&
      // Check there is only one document
      collectionResponse.documents?.edges?.length === 1 &&
      // Check to make sure the file is not a folder
      collectionResponse.documents?.edges[0]?.node?.__typename !== 'Folder'
    ) {
      const doc = collectionResponse.documents.edges[0].node
      handleNavigate(
        navigate,
        cms,
        collectionResponse,
        collectionDefinition,
        doc
      )
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
