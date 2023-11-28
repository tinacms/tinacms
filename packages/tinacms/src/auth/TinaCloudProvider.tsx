import { ModalBuilder } from './AuthModal'
import React, { useEffect, useState } from 'react'
import {
  BaseTextField,
  TinaCMS,
  TinaProvider,
  MediaStore,
  BranchSwitcherPlugin,
  Branch,
  BranchDataProvider,
  useLocalStorage,
  DummyMediaStore,
  TinaMediaStore,
  StaticMedia,
} from '@tinacms/toolkit'

import {
  Client,
  LocalSearchClient,
  TinaCMSSearchClient,
  TinaIOConfig,
} from '../internalClient'
import { useTinaAuthRedirect } from './useTinaAuthRedirect'
import { CreateClientProps, createClient } from '../utils'
import { setEditing } from '@tinacms/sharedctx'
import { TinaAdminApi } from '../admin/api'

type ModalNames = null | 'authenticate' | 'error'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface TinaCloudMediaStoreClass {
  new (client: Client): MediaStore
}
export interface TinaCloudAuthWallProps {
  cms?: TinaCMS
  children: React.ReactNode
  loginScreen?: React.ReactNode
  tinaioConfig?: TinaIOConfig
  getModalActions?: (args: {
    closeModal: () => void
  }) => { name: string; action: () => Promise<void>; primary: boolean }[]
  mediaStore?:
    | TinaCloudMediaStoreClass
    | (() => Promise<TinaCloudMediaStoreClass>)
}

export const AuthWallInner = ({
  children,
  cms,
  loginScreen,
  getModalActions,
}: TinaCloudAuthWallProps) => {
  const client: Client = cms.api.tina
  // Whether we are using Tina Cloud for auth
  const isTinaCloud =
    !client.isLocalMode && !client.schema?.config?.config?.contentApiUrlOverride
  const loginStrategy = client.authProvider.getLoginStrategy()

  const [activeModal, setActiveModal] = useState<ModalNames>(null)
  const [errorMessage, setErrorMessage] = useState<
    { title: string; message: string } | undefined
  >()
  const [showChildren, setShowChildren] = useState<boolean>(false)
  const [authProps, setAuthProps] = useState<{
    username: string
    password: string
  }>({ username: '', password: '' })
  const [authenticated, setAuthenticated] = useState<boolean>(false)

  React.useEffect(() => {
    let mounted = true
    client.authProvider
      .isAuthenticated()
      .then((isAuthenticated) => {
        if (!mounted) return
        if (isAuthenticated) {
          client.authProvider
            .isAuthorized()
            .then(async (isAuthorized) => {
              if (!mounted) return
              if (isAuthorized) {
                const user = await client.authProvider.getUser()
                if (user.passwordChangeRequired) {
                  window.location.hash = '#/screens/change_password'
                }
                setShowChildren(true)
                cms.enable()
              } else {
                setErrorMessage({
                  title: 'Access Denied:',
                  message: 'Not Authorized To Edit',
                })
                setActiveModal('error')
              }
            })
            .catch((e) => {
              if (!mounted) return
              console.error(e)
              setErrorMessage({ title: 'Unexpected Error:', message: `${e}` })
              setActiveModal('error')
            })
        } else {
          // FIXME: might be some sort of race-condition when loading styles
          sleep(500).then(() => {
            setActiveModal('authenticate')
          })
        }
      })
      .catch((e) => {
        if (!mounted) return
        console.error(e)
        setErrorMessage({ title: 'Unexpected Error:', message: `${e}` })
        setActiveModal('error')
      })
    return () => {
      mounted = false
    }
  }, [authenticated])

  const onAuthenticated = async () => {
    setAuthenticated(true)
    setActiveModal(null)
    cms.events.dispatch({ type: 'cms:login' })
  }

  const otherModalActions = getModalActions
    ? getModalActions({
        closeModal: () => {
          setActiveModal(null)
        },
      })
    : []

  const handleAuthenticate = async () => {
    try {
      setAuthenticated(false)
      const token = await client.authProvider.authenticate(authProps)
      if (typeof client?.onLogin === 'function') {
        await client?.onLogin({ token })
      }
      return onAuthenticated()
    } catch (e) {
      console.error(e)
      setActiveModal('error')
      setErrorMessage({
        title: 'Authentication Error',
        message: `${e}`,
      })
    }
  }

  let modalTitle = 'Tina Cloud Authorization'
  if (
    activeModal === 'authenticate' &&
    loginStrategy === 'Redirect' &&
    !isTinaCloud
  ) {
    modalTitle = 'Enter into edit mode'
  } else if (
    activeModal === 'authenticate' &&
    loginStrategy === 'UsernamePassword'
  ) {
    modalTitle = 'Sign in to Tina'
  } else if (activeModal === 'error') {
    if (loginStrategy === 'Redirect' && !isTinaCloud) {
      modalTitle = 'Enter into edit mode'
    } else if (loginStrategy === 'UsernamePassword') {
      modalTitle = 'Sign in to Tina'
    }
  }

  return (
    <>
      {activeModal === 'authenticate' && loginStrategy === 'Redirect' && (
        <ModalBuilder
          title={modalTitle}
          message={
            isTinaCloud
              ? 'To save edits, Tina Cloud authorization is required. On save, changes will get committed using your account.'
              : 'To save edits, enter into edit mode. On save, changes will saved to the local filesystem.'
          }
          close={close}
          actions={[
            ...otherModalActions,
            {
              action: async () => {
                // This does not work it looks like we have somehow getting two contexts
                // console.log({ setEdit })
                // setEdit(false)
                // setActiveModal(null)

                // This is a temp fix
                setEditing(false) // set editing just sets the local storage
                window.location.reload()
              },
              name: 'Close',
              primary: false,
            },
            {
              name: isTinaCloud ? 'Continue to Tina Cloud' : 'Enter Edit Mode',
              action: handleAuthenticate,
              primary: true,
            },
          ]}
        ></ModalBuilder>
      )}
      {activeModal === 'authenticate' &&
        loginStrategy === 'UsernamePassword' && (
          <ModalBuilder
            title={modalTitle}
            message={''}
            close={close}
            actions={[
              ...otherModalActions,
              {
                name: 'Login',
                action: handleAuthenticate,
                primary: true,
              },
            ]}
          >
            <div className="flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
              <div className="max-w-md w-full space-y-6">
                <label className="block">
                  <span className="text-gray-700">Username</span>
                  <BaseTextField
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="Username"
                    value={authProps.username}
                    onChange={(e) =>
                      setAuthProps((prevState) => ({
                        ...prevState,
                        username: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-gray-700">Password</span>
                  <BaseTextField
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Password"
                    value={authProps.password}
                    onChange={(e) =>
                      setAuthProps((prevState) => ({
                        ...prevState,
                        password: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          </ModalBuilder>
        )}
      {activeModal === 'error' && errorMessage && (
        <ModalBuilder
          title={modalTitle}
          message={errorMessage.title}
          error={errorMessage.message}
          close={close}
          actions={[
            ...otherModalActions,
            {
              name: 'Retry',
              action: async () => {
                try {
                  setActiveModal(null)
                  setErrorMessage(undefined)
                  const { authProvider } = client
                  await authProvider.logout()
                  if (typeof client?.onLogout === 'function') {
                    await client.onLogout()
                    await new Promise((resolve) => setTimeout(resolve, 500))
                  }
                  window.location.href = new URL(window.location.href).pathname
                } catch (e) {
                  console.error(e)
                  setActiveModal('error')
                  setErrorMessage({
                    title: 'Unexpected Error:',
                    message: `${e}`,
                  })
                }
              },
              primary: true,
            },
          ]}
        />
      )}
      {showChildren ? children : loginScreen ? loginScreen : null}
    </>
  )
}

/**
 * Provides the ability to setup your CMS and media while also providing an authentication wall so Tina is not enabled without a valid user session.
 *
 * Note: this will not restrict access for local filesystem clients
 */
export const TinaCloudProvider = (
  props: TinaCloudAuthWallProps &
    CreateClientProps & {
      cmsCallback?: (cms: TinaCMS) => TinaCMS
      staticMedia: StaticMedia
    }
) => {
  const baseBranch = props.branch || 'main'
  const [currentBranch, setCurrentBranch] = useLocalStorage(
    'tinacms-current-branch',
    baseBranch
  )
  useTinaAuthRedirect()
  const cms = React.useMemo(
    () =>
      props.cms ||
      new TinaCMS({
        enabled: true,
        sidebar: true,
        isLocalClient: props.isLocalClient,
        isSelfHosted: props.isSelfHosted,
        clientId: props.clientId,
      }),
    [props.cms]
  )
  if (!cms.api.tina) {
    cms.registerApi('tina', createClient({ ...props, branch: currentBranch }))
  } else {
    cms.api.tina.setBranch(currentBranch)
  }

  useEffect(() => {
    let searchClient
    // if local and search is configured then we always use the local client
    // if not local, then determine if search is enabled and use the client from the config
    if (props.isLocalClient) {
      searchClient = new LocalSearchClient(cms.api.tina)
    } else {
      const hasTinaSearch = Boolean(props.schema.config?.search?.tina)
      if (hasTinaSearch) {
        searchClient = new TinaCMSSearchClient(
          cms.api.tina,
          props.schema.config?.search?.tina
        )
      } else {
        searchClient = props.schema.config?.search?.searchClient
      }
    }

    if (searchClient) {
      cms.registerApi('search', searchClient)
    }
  }, [props])

  if (!cms.api.admin) {
    cms.registerApi('admin', new TinaAdminApi(cms))
  }

  const setupMedia = async (staticMedia: StaticMedia) => {
    const hasTinaMedia = Boolean(props.schema.config?.media?.tina)

    /*
     Has tina media (set up in the schema)
    */
    if (hasTinaMedia) {
      cms.media.store = new TinaMediaStore(cms, staticMedia)
    } else if (
      /*
     Has tina custom media (set up in the schema or define schema)
      */
      props.schema.config?.media?.loadCustomStore ||
      props.mediaStore
    ) {
      // Check to see if the media was store was passed in?
      const mediaStoreFromProps =
        props.schema.config?.media?.loadCustomStore || props.mediaStore
      if (mediaStoreFromProps.prototype?.persist) {
        // @ts-ignore
        cms.media.store = new mediaStoreFromProps(cms.api.tina)
      } else {
        // This means that an async function was passed in so we will use that to get the class

        // @ts-ignore
        const MediaClass = await mediaStoreFromProps()
        cms.media.store = new MediaClass(cms.api.tina)
      }
    } else {
      /** Default MediaStore */
      cms.media.store = new DummyMediaStore()
    }
  }
  const client: Client = cms.api.tina
  // Weather or not we are using Tina Cloud for auth
  const isTinaCloud =
    !client.isLocalMode && !client.schema?.config?.config?.contentApiUrlOverride
  const SessionProvider = client.authProvider.getSessionProvider()

  const handleListBranches = async (): Promise<Branch[]> => {
    const branches = await cms.api.tina.listBranches({
      includeIndexStatus: true,
    })

    if (!Array.isArray(branches)) {
      return []
    }
    // @ts-ignore
    return branches
  }
  const handleCreateBranch = async (data) => {
    const newBranch = await cms.api.tina.createBranch(data)

    return newBranch
  }

  setupMedia(props.staticMedia).catch((e) => {
    console.error(e)
  })

  const [branchingEnabled, setBranchingEnabled] = React.useState(() =>
    cms.flags.get('branch-switcher')
  )
  React.useEffect(() => {
    cms.events.subscribe('flag:set', ({ key, value }) => {
      if (key === 'branch-switcher') {
        setBranchingEnabled(value)
      }
    })
  }, [cms.events])

  React.useEffect(() => {
    let branchSwitcher
    if (branchingEnabled) {
      branchSwitcher = new BranchSwitcherPlugin({
        listBranches: handleListBranches,
        createBranch: handleCreateBranch,
        chooseBranch: setCurrentBranch,
      })
      cms.plugins.add(branchSwitcher)
    }
    return () => {
      if (branchingEnabled && branchSwitcher) {
        cms.plugins.remove(branchSwitcher)
      }
    }
  }, [branchingEnabled, props.branch])

  React.useEffect(() => {
    if (props.cmsCallback) {
      props.cmsCallback(cms)
    }
  }, [])

  React.useEffect(() => {
    const setupEditorialWorkflow = () => {
      client.getProject().then((project) => {
        if (project?.features?.includes('editorial-workflow')) {
          cms.flags.set('branch-switcher', true)
          client.usingEditorialWorkflow = true
          client.protectedBranches = project.protectedBranches
        }
      })
    }
    if (isTinaCloud) {
      setupEditorialWorkflow()
    }
    // If the user logs in after the cms is initialized
    const unsubscribe = cms.events.subscribe('cms:login', () => {
      if (isTinaCloud) {
        setupEditorialWorkflow()
      }
    })
    return unsubscribe
  }, [isTinaCloud, cms])

  return (
    <SessionProvider basePath="/api/tina/auth">
      <BranchDataProvider
        currentBranch={currentBranch}
        setCurrentBranch={(b) => {
          setCurrentBranch(b)
        }}
      >
        <TinaProvider cms={cms}>
          <AuthWallInner {...props} cms={cms} />
        </TinaProvider>
      </BranchDataProvider>
    </SessionProvider>
  )
}

/**
 * @deprecated Please use `TinaCloudProvider` instead
 */
export const TinaCloudAuthWall = TinaCloudProvider
