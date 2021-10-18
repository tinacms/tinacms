import { useEffect, useState } from 'react'
import type { TinaCMS } from '@tinacms/toolkit'

export interface Collection {
  label: string
  name: string
}

const useGetCollection = (cms: TinaCMS, collectionName: string) => {
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined
  )

  useEffect(() => {
    const fetchCollection = async () => {
      const response: { getCollection: { label: string; name: string } } =
        await cms.api.tina.request(
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
