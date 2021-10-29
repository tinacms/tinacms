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

interface Document {
  node: {
    sys: {
      breadcrumbs: string[]
      path: string
      basename: string
      relativePath: string
      filename: string
      extension: string
    }
  }
}
export interface Collection {
  label: string
  name: string
  format: string
  documents: {
    totalCount: number
    edges: Document[]
  }
}

export const useGetCollection = (
  cms: TinaCMS,
  collectionName: string,
  includeDocuments: boolean = true
) => {
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined
  )

  useEffect(() => {
    const fetchCollection = async () => {
      const response: { getCollection: Collection } =
        await cms.api.tina.request(
          `
          query($collection: String!, $includeDocuments: Boolean!){
            getCollection(collection: $collection){
              name
              label
              format
              documents @include(if: $includeDocuments) {
                totalCount
                edges {
                  node {
                    ... on Document {
                      sys {
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
          { variables: { collection: collectionName, includeDocuments } }
        )
      setCollection(response.getCollection)
    }

    fetchCollection()
  }, [cms, collectionName])

  return collection
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
  const collection = useGetCollection(cms, collectionName, includeDocuments)
  if (!collection) {
    return null
  }
  return <>{children(collection)}</>
}

export default GetCollection
