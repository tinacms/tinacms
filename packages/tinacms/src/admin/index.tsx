import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

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
                    <ul>
                      <li>
                        <strong>Tina Admin</strong>
                      </li>
                      <li>
                        <Link to={`/admin`}>&raquo; Dashboard</Link>
                      </li>
                      <li>
                        <strong>Collections</strong>
                      </li>
                      {collections.map((collection) => {
                        return (
                          <li key={`${collection.name}-link`}>
                            <Link to={`/admin/collections/${collection.name}`}>
                              &raquo; {collection.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                    <br />
                    <hr />
                    <br />
                    <Switch>
                      <Route path={`/admin/collections/:collectionName/create`}>
                        <CollectionCreatePage />
                      </Route>
                      <Route path={`/admin/collections/:collectionName`}>
                        <CollectionListPage />
                      </Route>
                      <Route path={`/admin`}>
                        <DashboardPage />
                      </Route>
                    </Switch>
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
