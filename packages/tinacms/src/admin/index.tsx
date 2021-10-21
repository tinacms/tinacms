/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from 'react-router-dom'
import { ImFilesEmpty } from 'react-icons/im'

import Layout from './components/Layout'
import GetCMS from './components/GetCMS'
import GetCollections from './components/GetCollections'

import DashboardPage from './pages/DashboardPage'
import CollectionListPage from './pages/CollectionListPage'
import CollectionCreatePage from './pages/CollectionCreatePage'
import CollectionUpdatePage from './pages/CollectionUpdatePage'

import useEmbedTailwind from './hooks/useEmbedTailwind'

export const TinaAdmin = () => {
  useEmbedTailwind()

  const isSSR = typeof window === 'undefined'
  if (isSSR) {
    return null
  }

  return (
    <GetCMS>
      {(cms) => (
        <GetCollections cms={cms}>
          {(collections) => (
            <Layout>
              <Router>
                <div className="flex items-stretch h-screen overflow-hidden">
                  <div className="flex flex-col w-64 md:w-80 lg:w-96 flex-shrink-0 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-2xl tracking-wide">
                        <Link to={`/admin`}>Tina Admin</Link>
                      </h2>
                    </div>
                    <div className="px-6 py-7">
                      <h4 className="uppercase font-bold text-sm mb-4">
                        Collections
                      </h4>
                      <ul className="flex flex-col gap-4">
                        {collections.map((collection) => {
                          return (
                            <li key={`${collection.name}-link`}>
                              <NavLink
                                className={`text-lg tracking-wide hover:text-blue-600 flex items-center opacity-90 hover:opacity-100`}
                                activeClassName="text-blue-600"
                                to={`/admin/collections/${collection.name}`}
                              >
                                <ImFilesEmpty className="mr-2 h-6 opacity-80 w-auto" />{' '}
                                {collection.label}
                              </NavLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Switch>
                      <Route path={`/admin/collections/:collectionName/new`}>
                        <CollectionCreatePage />
                      </Route>
                      <Route
                        path={`/admin/collections/:collectionName/:filename`}
                      >
                        <CollectionUpdatePage />
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
              </Router>
            </Layout>
          )}
        </GetCollections>
      )}
    </GetCMS>
  )
}
