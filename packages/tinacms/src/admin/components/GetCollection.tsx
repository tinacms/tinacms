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
import { TinaAdminApi } from '../api'
import LoadingPage from '../components/LoadingPage'
import type { Collection } from '../types'

export const useGetCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true
) => {
  const api = new TinaAdminApi(cms)
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined
  )
  // A dummy var  to tell the the the hook to update collections
  const [x, setRefresh] = useState(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const fetchCollection = async () => {
      if (await api.isAuthenticated()) {
        try {
          const response = await api.fetchCollection(
            collectionName,
            includeDocuments
          )
          setCollection(response.collection)
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetCollection failed: ${error.message}`,
            30 * 1000 // 30 seconds
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
  }, [cms, collectionName, x])

  return {
    collection,
    loading,
    error,
    refresh: () => {
      setRefresh((x) => x + 1)
    },
  }
}

const GetCollection = ({
  cms,
  collectionName,
  includeDocuments = true,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  includeDocuments?: boolean
  children: any
}) => {
  const { collection, loading, error, refresh } = useGetCollection(
    cms,
    collectionName,
    includeDocuments
  )

  if (error) {
    return null
  }

  if (loading) {
    return <LoadingPage />
  }

  return <>{children(collection, loading, refresh)}</>
}

export default GetCollection
