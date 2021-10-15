import { useEffect, useState } from 'react'

const useGetCollection = (cms, collectionName) => {
  const [collection, setCollection] = useState(undefined)

  useEffect(() => {
    const fetchCollection = async () => {
      const response = await cms.api.tina.request(
        `query($collection: String!){getCollection(collection: $collection) { label, name } }`,
        { variables: { collection: collectionName } }
      )
      setCollection(response.getCollection)
    }

    fetchCollection()
  }, [cms, collectionName])

  return collection
}

export default useGetCollection
