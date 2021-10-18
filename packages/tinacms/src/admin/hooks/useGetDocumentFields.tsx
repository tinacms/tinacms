import { useState, useEffect } from 'react'
import type { TinaCMS } from '@tinacms/toolkit'

interface GetDocumentFields {
  [collectionName: string]: { collection: Object; fields: Object[] }
}
export interface Info {
  collection: Object | undefined
  fields: Object[] | undefined
}

const useGetDocumentFields = (cms: TinaCMS, collectionName: string) => {
  const [info, setInfo] = useState<Info>({
    collection: undefined,
    fields: undefined,
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

      setInfo({
        collection,
        fields,
      })
    }

    fetchDocumentFields()
  }, [cms, collectionName])

  return info
}

export default useGetDocumentFields
