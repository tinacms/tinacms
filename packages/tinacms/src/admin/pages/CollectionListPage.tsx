import React from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'

import useGetCollection from '../hooks/useGetCollection'
import GetCMS from '../components/GetCMS'

const GetCollection = ({ cms, collectionName, children }) => {
  const collection = useGetCollection(cms, collectionName)
  if (!collection) {
    return null
  }
  return <>{children(collection)}</>
}

const CollectionListPage = () => {
  const location = useLocation()
  const { collectionName } = useParams()

  return (
    <GetCMS>
      {(cms) => (
        <GetCollection cms={cms} collectionName={collectionName}>
          {(collection) => (
            <div>
              <h1>Collection List Page</h1>
              <h2>
                {collection.name} {collection.label}
              </h2>
              <br />
              <Link to={`${location.pathname}/create`}>&raquo; Create New</Link>
            </div>
          )}
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionListPage
