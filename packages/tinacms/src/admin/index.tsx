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
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import GetCMS from './components/GetCMS'

import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import DashboardPage from './pages/DashboardPage'
import CollectionListPage from './pages/CollectionListPage'
import CollectionCreatePage from './pages/CollectionCreatePage'
import CollectionUpdatePage from './pages/CollectionUpdatePage'

import useEmbedTailwind from './hooks/useEmbedTailwind'
import { isEditing } from '../edit-state'

export const TinaAdmin = () => {
  useEmbedTailwind()

  const isSSR = typeof window === 'undefined'
  if (isSSR) {
    return null
  }

  /**
   * TODO:
   * Ideally, this line should be `const { edit } = useEditState()` if we weren't having context issues with `EditStateProvider`.
   * https://github.com/tinacms/tinacms/issues/2081
   */
  const isEdit = isEditing()

  if (!isEdit) {
    return (
      <Layout>
        <LoginPage />
      </Layout>
    )
  }

  return (
    <GetCMS>
      {(cms: any) => {
        const isTinaAdminEnabled = cms.flags.get('tina-admin')

        if (isTinaAdminEnabled) {
          return (
            <Layout>
              <Router>
                <div className="flex items-stretch h-screen overflow-hidden">
                  <Sidebar cms={cms} />
                  <div className="flex-1">
                    <Switch>
                      <Route path={`/admin/collections/:collectionName/new`}>
                        <CollectionCreatePage />
                      </Route>
                      <Route
                        path={`/admin/collections/:collectionName/:templateName/new`}
                      >
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
          )
        } else {
          return (
            <Layout>
              <Router>
                <Switch>
                  <Route
                    path={[`/admin/logout`, `/admin/exit`, `/admin/exit-admin`]}
                  >
                    <LogoutPage />
                  </Route>
                  <Route path={`/admin`}>
                    {() => {
                      window.location.href = '/'
                    }}
                  </Route>
                </Switch>
              </Router>
            </Layout>
          )
        }
      }}
    </GetCMS>
  )
}
