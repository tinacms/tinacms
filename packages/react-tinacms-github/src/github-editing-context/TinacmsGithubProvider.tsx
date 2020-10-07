/**

Copyright 2019 Forestry.io Inc

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
import { TinaCMS, useCMS } from 'tinacms'
import GithubErrorModal, { GithubError } from '../github-error/GithubErrorModal'
import { CreateForkModal, GithubAuthenticationModal } from './GithubAuthModal'
import { GithubClient } from '../github-client'
import { CHECKOUT_BRANCH, ERROR } from '../events'
import { useCMSEvent } from 'tinacms'

interface ProviderProps {
  children: any
  onLogin: () => void
  onLogout: () => void
  error?: any
}

type ModalNames = null | 'authenticate' | 'createFork'

export const TinacmsGithubProvider = ({
  children,
  onLogin,
  onLogout,
  error: previewError,
}: ProviderProps) => {
  const [error, setError] = useState<GithubError>(previewError)
  const cms = useCMS()
  const github: GithubClient = cms.api.github
  const [activeModal, setActiveModal] = useState<ModalNames>(null)

  const onClose = async () => {
    setActiveModal(null)
    if (!(await github.isAuthorized())) {
      cms.disable()
    }
  }

  const beginAuth = async () => {
    if (await github.isAuthenticated()) {
      onAuthSuccess()
    } else {
      setActiveModal('authenticate')
    }
  }

  const onAuthSuccess = async () => {
    if (await github.isAuthorized()) {
      github.checkout(github.branchName, github.baseRepoFullName)
      setActiveModal(null)
    } else {
      setActiveModal('createFork')
    }
  }

  useCMSEvent(TinaCMS.ENABLED.type, beginAuth, [])
  useCMSEvent(TinaCMS.DISABLED.type, onLogout, [])
  useCMSEvent(CHECKOUT_BRANCH, onLogin, [])
  useCMSEvent(ERROR, ({ error }: any) => setError(error), [])

  return (
    <>
      {error && <GithubErrorModal error={error} />}
      {!error && activeModal === 'authenticate' && (
        <GithubAuthenticationModal
          close={onClose}
          onAuthSuccess={onAuthSuccess}
        />
      )}
      {!error && activeModal === 'createFork' && (
        <CreateForkModal close={onClose} onForkCreated={onLogin} />
      )}
      {!previewError && children}
    </>
  )
}
