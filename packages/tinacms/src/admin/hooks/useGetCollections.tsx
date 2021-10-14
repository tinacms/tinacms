import { useState, useEffect } from 'react'

const useGetCollections = (cms) => {
  const [collections, setCollections] = useState([])

  useEffect(() => {
    const fetchCollections = async () => {
      const response = await cms.api.tina.request(
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
