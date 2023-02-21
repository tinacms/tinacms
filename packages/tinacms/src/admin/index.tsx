/**

*/

import React, { useState } from 'react'
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { TinaCMS } from '@tinacms/toolkit'

import Layout from './components/Layout'
import Sidebar from './components/Sidebar'
import GetCMS from './components/GetCMS'

import LoginPage from './pages/LoginPage'
import LogoutPage, { LogoutRedirect } from './pages/LogoutPage'
import DashboardPage from './pages/DashboardPage'
import CollectionListPage from './pages/CollectionListPage'
import CollectionCreatePage from './pages/CollectionCreatePage'
import CollectionUpdatePage from './pages/CollectionUpdatePage'
import ScreenPage from './pages/ScreenPage'

import { useEditState } from '@tinacms/sharedctx'
import { Client } from '../internalClient'

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
  const params = useParams()
  const navigate = useNavigate()
  const [url, setURL] = React.useState(`/${params['*']}`)
  const [reportedURL, setReportedURL] = useState<string | null>(null)
  const ref = React.useRef<HTMLIFrameElement>(null)
  const paramURL = `/${params['*']}`

  React.useEffect(() => {
    if (reportedURL !== paramURL && paramURL) {
      setURL(paramURL)
    }
  }, [paramURL])
  React.useEffect(() => {
    if ((reportedURL !== url || reportedURL !== paramURL) && reportedURL) {
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
          const tinaClient: Client = cms.api?.tina
          const collectionWithRouter =
            tinaClient?.schema?.config?.collections.find((x) => {
              return typeof x?.ui?.router === 'function'
            })
          const hasRouter = Boolean(collectionWithRouter)
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
                  path="logout"
                  element={
                    <DefaultWrapper cms={cms}>
                      <LogoutRedirect />
                    </DefaultWrapper>
                  }
                />
                <Route
                  path="/"
                  element={
                    <MaybeRedirectToPreview redirect={!!preview && hasRouter}>
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
