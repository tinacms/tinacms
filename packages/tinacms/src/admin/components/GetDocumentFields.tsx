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

interface GetDocumentFields {
  [collectionName: string]: { collection: Object; fields: Object[] }
}
export interface Info {
  collection: Object | undefined
  fields: Object[] | undefined
  mutationInfo: {
    includeCollection: boolean
    includeTemplate: boolean
  }
}

export const useGetDocumentFields = (cms: TinaCMS, collectionName: string) => {
  const [info, setInfo] = useState<Info>({
    collection: undefined,
    fields: undefined,
    mutationInfo: undefined,
  })

  useEffect(() => {
    const fetchDocumentFields = async () => {
      const response: GetDocumentFields = await cms.api.tina.request(
        `query { getDocumentFields }`,
        {}
      )

      const documentFields = response.getDocumentFields
      const collection: Object = documentFields[collectionName].collection
      const fields: Object[] = documentFields[collectionName].fields
      const mutationInfo: {
        includeCollection: boolean
        includeTemplate: boolean
      } = documentFields[collectionName].mutationInfo

      setInfo({
        collection,
        fields,
        mutationInfo,
      })
    }

    fetchDocumentFields()
  }, [cms, collectionName])

  return info
}

const GetDocumentFields = ({
  cms,
  collectionName,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  children: any
}) => {
  const { collection, fields, mutationInfo } = useGetDocumentFields(
    cms,
    collectionName
  )
  if (!collection || !fields || !mutationInfo) {
    return null
  }
  return <>{children(collection, fields, mutationInfo)}</>
}

export default GetDocumentFields
