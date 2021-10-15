import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { ImFilesEmpty } from 'react-icons/im'

import useGetCollections from './hooks/useGetCollections'
import useEmbedTailwind from './hooks/useEmbedTailwind'

import GetCMS from './components/GetCMS'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import CollectionCreatePage from './pages/CollectionCreatePage'
import CollectionListPage from './pages/CollectionListPage'

const GetCollections = ({ cms, children }) => {
  const collections = useGetCollections(cms)
  if (!collections) return null
  return <>{children(collections)}</>
}

export const TinaAdmin = () => {
  useEmbedTailwind()

  const isSSR = typeof window === 'undefined'
  if (isSSR) {
    return null
  }

  return (
    <GetCMS>
      {(cms) => {
        return (
          <GetCollections cms={cms}>
            {(collections) => {
              return (
                <Layout>
                  <Router>
                    <div className="flex items-stretch h-screen overflow-hidden">
                      <div className="flex flex-col w-80 lg:w-96 flex-shrink-0 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h2 className="text-2xl tracking-wide">
                            <Link to={`/admin`}>Tina Admin</Link>
                          </h2>
                        </div>
                        <div className="px-6 py-7">
                          <h4 className="uppercase font-bold text-sm mb-3">
                            Collections
                          </h4>
                          <ul>
                            {collections.map((collection) => {
                              return (
                                <li
                                  key={`${collection.name}-link`}
                                  className="mb-2"
                                >
                                  <Link
                                    passHref
                                    to={`/admin/collections/${collection.name}`}
                                  >
                                    <a className="text-lg tracking-wide hover:Text-blue-500 flex items-center opacity-90 hover:opacity-100">
                                      <ImFilesEmpty className="mr-2 h-6 opacity-80 w-auto" />{' '}
                                      {collection.label}
                                    </a>
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                      <div className="px-6 py-10 flex-1 flex justify-center h-screen">
                        <div className="max-w-screen-md w-full h-screen">
                          <Switch>
                            <Route
                              path={`/admin/collections/:collectionName/create`}
                            >
                              <CollectionCreatePage />
                            </Route>
                            <Route path={`/admin/collections/:collectionName`}>
                              <CollectionListPage />
                            </Route>
                            <Route path={`/admin`}>
                              <DashboardPage />
                            </Route>
                          </Switch>
                        </div>
                      </div>
                    </div>
                  </Router>
                </Layout>
              )
            }}
          </GetCollections>
        )
      }}
    </GetCMS>
  )
}
