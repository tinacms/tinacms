import React from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'

const CollectionListPage = () => {
  const location = useLocation()
  const { collectionName } = useParams()

  return (
    <div>
      <h1>Collection List Page</h1>
      <h2>{collectionName}</h2>
      <br />
      <Link to={`${location.pathname}/create`}>&raquo; Create New</Link>
    </div>
  )
}

export default CollectionListPage
