import { useState, useEffect } from 'react'
import type { TinaCMS } from '@tinacms/toolkit'

export interface Collection {
  label: string
  name: string
}

const useGetCollections = (cms: TinaCMS) => {
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    const fetchCollections = async () => {
      const response: { getCollections: Collection[] } =
        await cms.api.tina.request(
          `query{ getCollections { label, name } }`,
          {}
        )
      setCollections(response.getCollections)
    }

    fetchCollections()
  }, [cms])

  return collections
}

export default useGetCollections
