import { useState, useEffect } from 'react'

const useGetDocumentFields = (cms, collectionName) => {
  const [info, setInfo] = useState({
    collection: undefined,
    fields: undefined,
  })

  useEffect(() => {
    const fetchDocumentFields = async () => {
      const response = await cms.api.tina.request(
        `query { getDocumentFields }`,
        {}
      )
      const documentFields = response.getDocumentFields
      const collection = documentFields[collectionName].collection
      const fields = documentFields[collectionName].fields

      setInfo({
        collection,
        fields,
      })
    }

    fetchDocumentFields()
  }, [collectionName])

  return info
}

export default useGetDocumentFields
