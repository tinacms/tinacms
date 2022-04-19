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

import type { Collection } from '../types'
import { TinaAdminApi } from '../api'
import type { TinaCMS } from '@tinacms/toolkit'

export const useGetCollections = (cms: TinaCMS) => {
  const api = new TinaAdminApi(cms)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)

  useEffect(() => {
    const fetchCollections = async () => {
      if (await api.isAuthenticated()) {
        try {
          const collections = await api.fetchCollections()
          setCollections(collections)
        } catch (error) {
          console.error(error)
          setCollections([])
          setError(error)
          throw new Error(
            `[${error.name}] GetCollections failed: ${error.message}`
          )
        }

        setLoading(false)
      }
    }

    setLoading(true)
    fetchCollections()
  }, [cms])

  return { collections, loading, error }
}

const GetCollections = ({ cms, children }: { cms: TinaCMS; children: any }) => {
  const { collections, loading, error } = useGetCollections(cms)

  if (loading || error) {
    return null
  }

  return <>{children(collections, loading)}</>
}

export default GetCollections
