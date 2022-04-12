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
import type { TinaSchema } from '@tinacms/schema-tools'
import type { TinaCMS } from '@tinacms/toolkit'
import { TinaAdminApi } from '../api'
import LoadingPage from './LoadingPage'

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
  const api = new TinaAdminApi(cms)
  const [info, setInfo] = useState<Info>({
    collection: undefined,
    template: undefined,
    fields: undefined,
    mutationInfo: undefined,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  const schema: TinaSchema | undefined = cms.api.tina.schema

  useEffect(() => {
    const fetchDocumentFields = async () => {
      if (await api.isAuthenticated()) {
        try {
          const collection = schema.getCollection(collectionName)
          const mutationInfo: {
            includeCollection: boolean
            includeTemplate: boolean
          } = {
            includeCollection: true,
            includeTemplate: !!collection.templates,
          }
          let fields: Object[] = undefined
          let template: { name: string; label: string } = undefined

          /***
           * Collection `collectionName` has template `templateName`...
           */
          if (
            templateName &&
            collection.templates &&
            collection.templates[templateName]
          ) {
            template = collection.templates[templateName].template
            fields = collection.templates[templateName].fields
          } else {
            if (typeof collection.fields === 'string') {
              throw new Error(`Global templates not supported`)
            }
            fields = collection.fields
          }

          setInfo({
            collection,
            template,
            fields,
            mutationInfo,
          })
        } catch (error) {
          cms.alerts.error(
            `[${error.name}] GetDocumentFields failed: ${error.message}`,
            30 * 1000 // 30 seconds
          )
          console.error(error)
          setInfo({
            collection: undefined,
            template: undefined,
            fields: undefined,
            mutationInfo: undefined,
          })
          setError(error)
        }

        setLoading(false)
      }
    }

    setLoading(true)
    fetchDocumentFields()
  }, [cms, collectionName])

  return { ...info, loading, error }
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
  const { collection, template, fields, mutationInfo, loading, error } =
    useGetDocumentFields(cms, collectionName, templateName)

  if (error) {
    return null
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <>{children({ collection, template, fields, mutationInfo, loading })}</>
  )
}

export default GetDocumentFields
