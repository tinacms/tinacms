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
            <div className="w-full flex justify-between items-end">
              <h3 className="text-4xl">{collection.label}</h3>
              <Link to={`${location.pathname}/create`} passHref>
                <a className="inline-flex items-center px-6 py-3 border border-transparent text-base leading-5 font-medium rounded-full text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue focus:border-blue-700 active:bg-blue-700 transition duration-150 ease-in-out">
                  Create New
                </a>
              </Link>
            </div>
          )}
        </GetCollection>
      )}
    </GetCMS>
  )
}

export default CollectionListPage
