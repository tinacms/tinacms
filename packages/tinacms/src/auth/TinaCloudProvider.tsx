/**

*/

import { ModalBuilder } from './AuthModal'
import React, { useEffect, useState } from 'react'
import {
  TinaCMS,
  TinaProvider,
  MediaStore,
  BranchSwitcherPlugin,
  Branch,
  BranchDataProvider,
  useLocalStorage,
  DummyMediaStore,
  TinaMediaStore,
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

type ModalNames = null | 'authenticate'

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
  // Weather or not we are using Tina Cloud for auth
  const isTinaCloud =
    !client.isLocalMode &&
    !client.schema?.config?.config?.admin?.auth?.customAuth

  const [activeModal, setActiveModal] = useState<ModalNames>(null)
  const [showChildren, setShowChildren] = useState<boolean>(false)

  React.useEffect(() => {
    client.isAuthenticated().then((isAuthenticated) => {
      if (isAuthenticated) {
        setShowChildren(true)
        cms.enable()
      } else {
        // FIXME: might be some sort of race-condition when loading styles
        sleep(500).then(() => {
          setActiveModal('authenticate')
        })
      }
    })
  }, [])

  const onAuthSuccess = async () => {
    if (await client.isAuthenticated()) {
      setShowChildren(true)
      setActiveModal(null)
    } else {
      throw new Error('No access to repo') // TODO - display modal here
    }
  }

  const otherModalActions = getModalActions
    ? getModalActions({
        closeModal: () => {
          setActiveModal(null)
        },
      })
    : []

  return (
    <>
      {activeModal === 'authenticate' && (
        <ModalBuilder
          title={
            isTinaCloud ? 'Tina Cloud Authorization' : 'Enter into edit mode'
          }
          message={
            isTinaCloud
              ? 'To save edits, Tina Cloud authorization is required. On save, changes will get commited using your account.'
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
              action: async () => {
                const token = await client.authenticate()
                if (typeof client?.onLogin === 'function') {
                  await client?.onLogin({ token })
                }
                onAuthSuccess()
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
    CreateClientProps & { cmsCallback?: (cms: TinaCMS) => TinaCMS }
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
        searchClient = new TinaCMSSearchClient(cms.api.tina)
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

  const setupMedia = async () => {
    const hasTinaMedia = Boolean(props.schema.config?.media?.tina)

    /* 
     Has tina media (set up in the schema)
    */
    if (hasTinaMedia) {
      cms.media.store = new TinaMediaStore(cms)
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
    !client.isLocalMode &&
    !client.schema?.config?.config?.admin?.auth?.customAuth

  const handleListBranches = async (): Promise<Branch[]> => {
    const { owner, repo } = props
    const branches = await cms.api.tina.listBranches({ owner, repo })

    if (!Array.isArray(branches)) {
      return []
    }
    return branches
  }
  const handleCreateBranch = async (data) => {
    const newBranch = await cms.api.tina.createBranch(data)

    return newBranch
  }

  setupMedia()

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
    if (isTinaCloud) {
      client.getProject().then((project) => {
        if (project?.features?.includes('editorial-workflow')) {
          cms.flags.set('branch-switcher', true)
          client.usingEditorialWorkflow = true
          client.protectedBranches = project.protectedBranches
        }
      })
    }
    // refresh if the user logs in
  }, [isTinaCloud, client.token])

  return (
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
  )
}

/**
 * @deprecated Please use `TinaCloudProvider` instead
 */
export const TinaCloudAuthWall = TinaCloudProvider
