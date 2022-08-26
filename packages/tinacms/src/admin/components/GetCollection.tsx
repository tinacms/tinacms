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

import React, { useEffect, useState } from 'react'
import type { TinaCMS } from '@tinacms/toolkit'
import type { TinaSchema } from '@tinacms/schema-tools'
import { TinaAdminApi } from '../api'
import LoadingPage from '../components/LoadingPage'
import type { Collection } from '../types'

export const useGetCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true,
  after: string = '',
  sortKey?: string
) => {
  const api = new TinaAdminApi(cms)
  const schema = cms.api.tina.schema as TinaSchema
  const collectionExtra = schema.getCollection(collectionName)
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [resetState, setResetSate] = useState(0)

  useEffect(() => {
    const fetchCollection = async () => {
      if (await api.isAuthenticated()) {
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
            after,
            validSortKey,
            order
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

    setLoading(true)
    fetchCollection()
  }, [cms, collectionName, resetState, after, sortKey])

  const reFetchCollection = () => setResetSate((x) => x + 1)

  return { collection, loading, error, reFetchCollection, collectionExtra }
}

const GetCollection = ({
  cms,
  collectionName,
  includeDocuments = true,
  startCursor,
  sortKey,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  includeDocuments?: boolean
  startCursor?: string
  sortKey?: string
  children: any
}) => {
  const { collection, loading, error, reFetchCollection, collectionExtra } =
    useGetCollection(
      cms,
      collectionName,
      includeDocuments,
      startCursor || '',
      sortKey
    ) || {}

  if (error) {
    return null
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <>{children(collection, loading, reFetchCollection, collectionExtra)}</>
  )
}

export default GetCollection
