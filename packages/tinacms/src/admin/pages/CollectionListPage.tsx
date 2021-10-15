import React from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'

const CollectionListPage = () => {
  const location = useLocation()
  const { collectionName } = useParams()

  return (
    <div className="w-full flex justify-between pt-4">
      <h3 className="text-4xl">{collectionName}</h3>
      <Link to={`${location.pathname}/create`} passHref>
        <a className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-5 font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue focus:border-blue-700 active:bg-blue-700 transition duration-150 ease-in-out">
          Create New
        </a>
      </Link>
    </div>
  )
}

export default CollectionListPage
