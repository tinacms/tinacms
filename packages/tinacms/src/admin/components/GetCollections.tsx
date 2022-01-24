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
  const api = new TinaAdminApi(cms.api.tina)
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      const response = await api.fetchCollections()
      setCollections(response.getCollections)
    }

    fetchCollections()
  }, [cms])

  return collections
}

const GetCollections = ({ cms, children }: { cms: TinaCMS; children: any }) => {
  const collections = useGetCollections(cms)
  if (!collections) return null
  return <>{children(collections)}</>
}

export default GetCollections
