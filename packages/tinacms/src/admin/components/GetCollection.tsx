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
  includeDocuments: boolean = true,
  after: string = ''
) => {
  const api = new TinaAdminApi(cms)
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [resetState, setResetSate] = useState(0)

  useEffect(() => {
    const fetchCollection = async () => {
      if (await api.isAuthenticated()) {
        try {
          const collection = await api.fetchCollection(
            collectionName,
            includeDocuments,
            after
          )
          setCollection(collection)
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
  }, [cms, collectionName, resetState, after])

  const reFetchCollection = () => setResetSate((x) => x + 1)

  return { collection, loading, error, reFetchCollection }
}

const GetCollection = ({
  cms,
  collectionName,
  includeDocuments = true,
  startCurser,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  includeDocuments?: boolean
  startCurser: string
  children: any
}) => {
  const { collection, loading, error, reFetchCollection } = useGetCollection(
    cms,
    collectionName,
    includeDocuments,
    startCurser
  )
  // keep prevPage and currentPage up to date
  // useEffect(() => {
  //   const startCurser = collection?.documents?.pageInfo?.startCursor || ''
  //   const endCursor = collection?.documents?.pageInfo?.endCursor || ''
  //   const params = new URLSearchParams()
  //   // params.append('prevPage', )
  //   // navigate('?' + params.toString())
  // }, [
  //   collection?.documents?.pageInfo?.startCursor || '',
  //   collection?.documents?.pageInfo?.endCursor || '',
  // ])

  if (error) {
    return null
  }

  if (loading) {
    return <LoadingPage />
  }

  return <>{children(collection, loading, reFetchCollection)}</>
}

export default GetCollection
