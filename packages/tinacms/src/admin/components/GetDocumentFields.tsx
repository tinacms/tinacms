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

export interface Info {
  collection: Object | undefined
  template: Object | undefined
  fields: Object[] | undefined
  mutationInfo: {
    includeCollection: boolean
    includeTemplate: boolean
  }
}

export const useGetDocumentFields = (
  cms: TinaCMS,
  collectionName: string,
  templateName: string
) => {
  const api = new TinaAdminApi(cms.api.tina)
  const [info, setInfo] = useState<Info>({
    collection: undefined,
    template: undefined,
    fields: undefined,
    mutationInfo: undefined,
  })

  useEffect(() => {
    const fetchDocumentFields = async () => {
      const response = await api.fetchDocumentFields()
      const documentFields = response.getDocumentFields
      const collection: Object = documentFields[collectionName].collection
      const mutationInfo: {
        includeCollection: boolean
        includeTemplate: boolean
      } = documentFields[collectionName].mutationInfo
      let fields: Object[] = undefined
      let template: { name: string; label: string } = undefined

      /***
       * Collection `collectionName` has template `templateName`...
       */
      if (
        templateName &&
        documentFields[collectionName].templates &&
        documentFields[collectionName].templates[templateName]
      ) {
        template =
          documentFields[collectionName].templates[templateName].template
        fields = documentFields[collectionName].templates[templateName].fields
      } else {
        fields = documentFields[collectionName].fields
      }

      setInfo({
        collection,
        template,
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
  templateName,
  children,
}: {
  cms: TinaCMS
  collectionName: string
  templateName?: string
  children: any
}) => {
  const { collection, template, fields, mutationInfo } = useGetDocumentFields(
    cms,
    collectionName,
    templateName
  )

  if (!collection) {
    return null
  }
  return <>{children({ collection, template, fields, mutationInfo })}</>
}

export default GetDocumentFields
