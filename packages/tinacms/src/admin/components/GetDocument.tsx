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
import type { DocumentForm } from '../types'
import LoadingPage from './LoadingPage'

export const useGetDocument = (
  cms: TinaCMS,
  collectionName: string,
  relativePath: string
) => {
  const api = new TinaAdminApi(cms)
  const [document, setDocument] = useState<DocumentForm>(undefined)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchDocument = async () => {
      const response = await api.fetchDocument(collectionName, relativePath)

      setDocument(response.getDocument)
      setLoading(false)
    }

    setLoading(true)
    fetchDocument()
  }, [cms, collectionName, relativePath])

  return { document, loading }
}

const GetDocument = ({
  cms,
  collectionName,
  relativePath,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  relativePath: string
  children: any
}) => {
  const { document, loading } = useGetDocument(
    cms,
    collectionName,
    relativePath
  )
  if (!document || loading) {
    return <LoadingPage />
  }
  return <>{children(document, loading)}</>
}

export default GetDocument
