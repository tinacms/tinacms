import {
  Button,
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
  TinaCMS,
  useCMS,
} from '@tinacms/toolkit';
import React, { useState, useEffect } from 'react';
import {
  Route,
  HashRouter as Router,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';

import GetCMS from './components/GetCMS';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';

import CollectionCreatePage from './pages/CollectionCreatePage';
import CollectionDuplicatePage from './pages/CollectionDuplicatePage';
import CollectionListPage from './pages/CollectionListPage';
import CollectionUpdatePage from './pages/CollectionUpdatePage';
import DashboardPage from './pages/DashboardPage';
import ScreenPage from './pages/ScreenPage';

import { Client } from '../internalClient';
import { TinaAdminApi } from './api';

const Redirect = () => {
  React.useEffect(() => {
    if (window) {
      window.location.assign('/');
    }
  }, []);

  return null;
};

const MaybeRedirectToPreview = ({
  redirect,
  children,
}: {
  redirect: boolean;
  children: JSX.Element;
}) => {
  const cms = useCMS();
  const navigate = useNavigate();
  React.useEffect(() => {
    const basePath = cms.flags.get('tina-basepath');
    if (redirect) {
      navigate(`/~${basePath ? `/${basePath}` : ''}`);
    }
  }, [redirect]);

  return children;
};

const SetPreviewFlag = ({
  preview,
  cms,
}: {
  preview?: JSX.Element;
  cms: TinaCMS;
}) => {
  React.useEffect(() => {
    if (preview) {
      cms.flags.set('tina-iframe', true);
    }
  }, [preview]);
  return null;
};

const PreviewInner = ({ preview, config }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [url, setURL] = React.useState(`/${params['*']}`);
  const [reportedURL, setReportedURL] = useState<string | null>(null);
  const ref = React.useRef<HTMLIFrameElement>(null);
  const paramURL = `/${params['*']}`;

  React.useEffect(() => {
    if (reportedURL !== paramURL && paramURL) {
      setURL(paramURL);
    }
  }, [paramURL]);
  React.useEffect(() => {
    if ((reportedURL !== url || reportedURL !== paramURL) && reportedURL) {
      navigate(`/~${reportedURL}`);
    }
  }, [reportedURL]);

  React.useEffect(() => {
    setInterval(() => {
      if (ref.current) {
        const url = new URL(ref.current.contentWindow?.location.href || '');
        if (url.origin === 'null') {
          return;
        }
        const href = url.href.replace(url.origin, '');
        setReportedURL(href);
      }
    }, 100);
  }, [ref.current]);
  const Preview = preview;
  return <Preview url={url} iframeRef={ref} {...config} />;
};

const CheckSchema = ({
  schemaJson,
  children,
}: {
  schemaJson?: unknown;
  children: JSX.Element;
}) => {
  const cms = useCMS();
  const api = new TinaAdminApi(cms);
  const url = api.api.contentApiUrl;
  const [schemaMissingError, setSchemaMissingError] = React.useState(false);
  const currentBranch = decodeURIComponent(cms.api.tina.branch);

  useEffect(() => {
    if (schemaJson && cms) {
      api
        .checkGraphqlSchema({
          localSchema: schemaJson,
        })
        .then((x) => {
          if (x === false) {
            cms.alerts.error(
              'GraphQL Schema Mismatch. Editing may not work. If you just switched branches, try going back to the previous branch'
            );
          }
        })
        .catch((e) => {
          // TODO: HACK- Check on an error id, rather than message string
          if (e.message.includes('has not been indexed by TinaCloud')) {
            setSchemaMissingError(true);
          } else {
            cms.alerts.error(`Unexpected error checking schema: ${e}`);
            throw e;
          }
        });
    }
  }, [cms, JSON.stringify(schemaJson || {}), url]);
  return (
    <>
      {schemaMissingError ? (
        <Modal>
          <PopupModal>
            <ModalHeader>Branch Not Found</ModalHeader>
            <ModalBody padded={true}>
              <div className='tina-prose'>
                The current branch (
                <span className='font-bold'>{currentBranch}</span>) has either
                been merged or deleted.
              </div>
            </ModalBody>
            <ModalActions>
              <div className='flex-1'></div>
              <Button
                style={{ flexGrow: 1 }}
                className='w-full'
                variant='primary'
                onClick={() => {
                  window.localStorage.removeItem('tinacms-current-branch');
                  window.location.reload();
                }}
              >
                Switch back to default branch
              </Button>
            </ModalActions>
          </PopupModal>
        </Modal>
      ) : (
        children
      )}
    </>
  );
};

export const TinaAdmin = ({
  preview,
  Playground,
  config,
  schemaJson,
}: {
  schemaJson?: any;
  preview?: (props: object) => JSX.Element;
  Playground?: (props: object) => JSX.Element;
  config: object;
}) => {
  const isSSR = typeof window === 'undefined';
  if (isSSR) {
    return null;
  }

  return (
    <GetCMS>
      {(cms: TinaCMS) => {
        const isTinaAdminEnabled =
          cms.flags.get('tina-admin') === false ? false : true;
        if (isTinaAdminEnabled) {
          const tinaClient: Client = cms.api?.tina;
          const collectionWithRouter =
            tinaClient?.schema?.config?.collections.find((x) => {
              return typeof x?.ui?.router === 'function';
            });
          const hasRouter = Boolean(collectionWithRouter);
          return (
            <>
              <CheckSchema schemaJson={schemaJson}>
                <Router>
                  {/* @ts-ignore */}
                  <SetPreviewFlag preview={preview} cms={cms} />
                  <Routes>
                    {preview && (
                      <Route
                        path='/~/*'
                        element={
                          <PreviewInner config={config} preview={preview} />
                        }
                      />
                    )}
                    <Route
                      path='graphql'
                      element={
                        <PlainLayout>
                          <Playground />
                        </PlainLayout>
                      }
                    />
                    <Route
                      path='collections/new/:collectionName'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionCreatePage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='collections/duplicate/:collectionName/~/*'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionDuplicatePage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='collections/duplicate/:collectionName/*'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionDuplicatePage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='collections/new/:collectionName/:templateName'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionCreatePage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='collections/new/:collectionName/:templateName/~/*'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionCreatePage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='collections/new/:collectionName/~/*'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionCreatePage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='collections/edit/:collectionName/*'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionUpdatePage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='collections/:collectionName/*'
                      element={
                        <DefaultWrapper cms={cms}>
                          <CollectionListPage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='screens/:screenName'
                      element={
                        <DefaultWrapper cms={cms}>
                          <ScreenPage />
                        </DefaultWrapper>
                      }
                    />
                    <Route
                      path='/'
                      element={
                        <MaybeRedirectToPreview
                          redirect={!!preview && hasRouter}
                        >
                          <DefaultWrapper cms={cms}>
                            <DashboardPage />
                          </DefaultWrapper>
                        </MaybeRedirectToPreview>
                      }
                    />
                  </Routes>
                </Router>
              </CheckSchema>
            </>
          );
        } else {
          return (
            <Layout>
              <Router>
                <Routes>
                  <Route path='/' element={<Redirect />} />
                </Routes>
              </Router>
            </Layout>
          );
        }
      }}
    </GetCMS>
  );
};

const DefaultWrapper = ({
  cms,
  children,
}: {
  cms: TinaCMS;
  children: React.ReactNode;
}) => {
  return (
    <Layout>
      <div className='flex items-stretch h-dvh overflow-hidden'>
        <Sidebar cms={cms} />
        <div className='w-full relative'>{children}</div>
      </div>
    </Layout>
  );
};

/**
 * FIXME: This still hides modal popups most of the time
 */
const PlainLayout = ({ children }: { children: any }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: '#F6F6F9',
        fontFamily: "'Inter', sans-serif",
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  );
};
