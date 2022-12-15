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

import React, { useState } from 'react'
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { Form, TinaCMS, useCMS } from '@tinacms/toolkit'

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

const MaybeRedirectToPreview = ({
  redirect,
  children,
}: {
  redirect: boolean
  children: JSX.Element
}) => {
  const navigate = useNavigate()
  React.useEffect(() => {
    if (redirect) {
      navigate('/~')
    }
  }, [redirect])

  return children
}

const SetPreviewFlag = ({
  preview,
  cms,
}: {
  preview?: JSX.Element
  cms: TinaCMS
}) => {
  React.useEffect(() => {
    if (preview) {
      cms.flags.set('tina-iframe', true)
    }
  }, [preview])
  return null
}

const PreviewInner = ({ preview, config }) => {
  // Hash router params
  const params = useParams()
  // Hash router navigate
  const navigate = useNavigate()
  const [url, setURL] = React.useState(`/${params['*']}`)
  const [reportedURL, setReportedURL] = useState<string | null>(null)
  const ref = React.useRef<HTMLIFrameElement>(null)
  const paramURL = `/${params['*']}`

  const urlGlobal = new URL(document.location)
  const paramsGlobal = new URLSearchParams(urlGlobal.search)

  const activeField = paramsGlobal.get('activeField')
  const cms = useCMS()
  const forms = cms.plugins.getType<Form>('form').all()
  const form = forms[0]
  const id = typeof form !== 'undefined' ? form?.id : ''

  React.useEffect(() => {
    if (id && activeField) {
      cms.events.dispatch({
        type: 'field:selected',
        value: `${form.id}#${activeField}`,
      })
    }
  }, [activeField, id])

  React.useEffect(() => {
    if (reportedURL !== paramURL && paramURL) {
      setURL(paramURL)
    }
  }, [paramURL])
  React.useEffect(() => {
    if ((reportedURL !== url || reportedURL !== paramURL) && reportedURL) {
      // Remove the activeField URL param before navigating
      if (paramsGlobal.get('activeField')) {
        paramsGlobal.delete('activeField')
        urlGlobal.search = paramsGlobal.toString()
        window.history.replaceState(null, null, urlGlobal.toString())
      }
      navigate(`/~${reportedURL}`)
    }
  }, [reportedURL])

  React.useEffect(() => {
    setInterval(() => {
      if (ref.current) {
        const url = new URL(ref.current.contentWindow?.location.href || '')
        if (url.origin === 'null') {
          return
        }
        const href = url.href.replace(url.origin, '')
        setReportedURL(href)
      }
    }, 100)
  }, [ref.current])
  const Preview = preview
  return <Preview url={url} iframeRef={ref} {...config} />
}

export const TinaAdmin = ({
  preview,
  config,
}: {
  preview?: (props: object) => JSX.Element
  config: object
}) => {
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
        const isTinaAdminEnabled =
          cms.flags.get('tina-admin') === false ? false : true
        if (isTinaAdminEnabled) {
          return (
            <Router>
              {/* @ts-ignore */}
              <SetPreviewFlag preview={preview} cms={cms} />
              <Routes>
                {preview && (
                  <Route
                    path="/~/*"
                    element={<PreviewInner config={config} preview={preview} />}
                  />
                )}
                <Route
                  path="collections/:collectionName/new"
                  element={
                    <DefaultWrapper cms={cms}>
                      <CollectionCreatePage />
                    </DefaultWrapper>
                  }
                />
                <Route
                  path="collections/:collectionName/:templateName/new"
                  element={
                    <DefaultWrapper cms={cms}>
                      <CollectionCreatePage />
                    </DefaultWrapper>
                  }
                />
                <Route
                  path="collections/:collectionName/*"
                  element={
                    <DefaultWrapper cms={cms}>
                      <CollectionUpdatePage />
                    </DefaultWrapper>
                  }
                />
                <Route
                  path="collections/:collectionName"
                  element={
                    <DefaultWrapper cms={cms}>
                      <CollectionListPage />
                    </DefaultWrapper>
                  }
                />
                <Route
                  path="screens/:screenName"
                  element={
                    <DefaultWrapper cms={cms}>
                      <ScreenPage />
                    </DefaultWrapper>
                  }
                />
                <Route
                  path="/"
                  element={
                    <MaybeRedirectToPreview redirect={!!preview}>
                      <DefaultWrapper cms={cms}>
                        <DashboardPage />
                      </DefaultWrapper>
                    </MaybeRedirectToPreview>
                  }
                />
              </Routes>
            </Router>
          )
        } else {
          return (
            <Layout>
              <Router>
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

const DefaultWrapper = ({
  cms,
  children,
}: {
  cms: TinaCMS
  children: React.ReactNode
}) => {
  return (
    <Layout>
      <div className="flex items-stretch h-screen overflow-hidden">
        <Sidebar cms={cms} />
        <div className="flex-1 relative">{children}</div>
      </div>
    </Layout>
  )
}
