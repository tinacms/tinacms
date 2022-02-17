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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import type { TinaCMS } from '@tinacms/toolkit'

import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import GetCMS from './components/GetCMS'

import LoginPage from './pages/LoginPage'
import LogoutPage from './pages/LogoutPage'
import DashboardPage from './pages/DashboardPage'
import CollectionListPage from './pages/CollectionListPage'
import CollectionCreatePage from './pages/CollectionCreatePage'
import CollectionUpdatePage from './pages/CollectionUpdatePage'
import ScreenPage from './pages/ScreenPage'

import { useEditState } from '@tinacms/sharedctx'

const Redirect = () => {
  React.useEffect(() => {
    if (window) {
      window.location.assign('/')
    }
  }, [])

  return null
}

export const TinaAdmin = () => {
  const isSSR = typeof window === 'undefined'
  const { edit } = useEditState()

  if (isSSR) {
    return null
  }

  if (!edit) {
    return (
      <Layout>
        <LoginPage />
      </Layout>
    )
  }

  return (
    <GetCMS>
      {(cms: TinaCMS) => {
        const isTinaAdminEnabled = cms.flags.get('tina-admin')

        if (isTinaAdminEnabled) {
          return (
            <Layout>
              <Router basename={'/admin'}>
                <div className="flex items-stretch h-screen overflow-hidden">
                  <Sidebar cms={cms} />
                  <div className="flex-1 relative">
                    <Routes>
                      <Route
                        path="collections/:collectionName/new"
                        element={<CollectionCreatePage />}
                      />
                      <Route
                        path="collections/:collectionName/:templateName/new"
                        element={<CollectionCreatePage />}
                      />
                      <Route
                        path="collections/:collectionName/:filename"
                        element={<CollectionUpdatePage />}
                      />
                      <Route
                        path="collections/:collectionName"
                        element={<CollectionListPage />}
                      />
                      <Route
                        path="screens/:screenName"
                        element={<ScreenPage />}
                      />
                      <Route path="/" element={<DashboardPage />} />
                    </Routes>
                  </div>
                </div>
              </Router>
            </Layout>
          )
        } else {
          return (
            <Layout>
              <Router basename={'/admin'}>
                <Routes>
                  <Route path="logout" element={<LogoutPage />} />
                  <Route path="/" element={<Redirect />} />
                </Routes>
              </Router>
            </Layout>
          )
        }
      }}
    </GetCMS>
  )
}
