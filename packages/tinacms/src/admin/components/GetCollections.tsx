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

import React, { useState, useEffect } from 'react'
import type { TinaCMS } from '@tinacms/toolkit'
import { TinaAdminApi } from '../api'
import type { Collection } from '../types'

export const useGetCollections = (cms: TinaCMS) => {
  const api = new TinaAdminApi(cms)
  const [info, setInfo] = useState<{
    collections: Collection[]
    loading: boolean
    error: boolean
  }>({ collections: [], loading: true, error: false })

  useEffect(() => {
    const fetchCollections = async () => {
      const response = await api.fetchCollections()
      setInfo({
        collections: response.getCollections,
        loading: false,
        error: false,
      })
    }

    fetchCollections()
  }, [cms])

  return info
}

const GetCollections = ({ cms, children }: { cms: TinaCMS; children: any }) => {
  const { collections, loading, error } = useGetCollections(cms)
  if (!collections) return null
  return <>{children(collections, loading, error)}</>
}

export default GetCollections
