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

import { ModalBuilder } from './AuthModal'
import React, { useState } from 'react'
import { TinaCMS, TinaProvider, MediaStore } from '@tinacms/toolkit'

import { Client } from '../client'
import { useTinaAuthRedirect } from './useTinaAuthRedirect'
import { CreateClientProps, createClient } from '../utils'
import { useEditState } from '../edit-state'

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
  getModalActions?: (args: {
    closeModal: () => void
  }) => { name: string; action: () => Promise<void>; primary: boolean }[]
  mediaStore?: TinaCloudMediaStoreClass | Promise<TinaCloudMediaStoreClass>
}

export const AuthWallInner = ({
  children,
  cms,
  loginScreen,
  getModalActions,
}: TinaCloudAuthWallProps) => {
  const client: Client = cms.api.tina

  const [activeModal, setActiveModal] = useState<ModalNames>(null)
  const [showChildren, setShowChildren] = useState<boolean>(false)
  const { setEdit } = useEditState()

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
          title="Tina Cloud Authorization"
          message="To save edits, Tina Cloud authorization is required. On save, changes will get commited using your account."
          close={close}
          actions={[
            ...otherModalActions,
            {
              action: async () => {
                setActiveModal(null)
                setEdit(false)
              },
              name: 'Close',
              primary: false,
            },
            {
              name: 'Continue to Tina Cloud',
              action: async () => {
                await client.authenticate()
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
  useTinaAuthRedirect()
  const cms = React.useMemo(
    () =>
      props.cms ||
      new TinaCMS({
        enabled: true,
        sidebar: true,
      }),
    [props.cms]
  )
  if (!cms.api.tina) {
    cms.api.tina = createClient(props)
  }
  const setupMedia = async () => {
    if (props.mediaStore) {
      cms.media.store = new (await props.mediaStore)(cms.api.tina)
    }
  }
  setupMedia()
  if (props.cmsCallback) {
    props.cmsCallback(cms)
  }

  return (
    <TinaProvider cms={cms}>
      <AuthWallInner {...props} cms={cms} />
    </TinaProvider>
  )
}

/**
 * @deprecated Please use `TinaCloudProvider` instead
 */
export const TinaCloudAuthWall = TinaCloudProvider
