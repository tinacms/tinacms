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

import React, { useState, useEffect } from 'react'
import { useCMS } from 'tinacms'
import GithubErrorModal from '../github-error/GithubErrorModal'
import GithubAuthModal from './GithubAuthModal'
import { GithubEditingContext } from './GithubEditingContext'
import { useGithubEditing } from './useGithubEditing'
import { GithubClient } from '../github-client'

interface ProviderProps {
  children: any
  editMode: boolean
  enterEditMode: () => void
  exitEditMode: () => void
  error?: any
}

type AuthState = null | 'completeSetup' | 'authenticate' | 'createFork'

export const TinacmsGithubProvider = ({
  children,
  editMode,
  enterEditMode,
  exitEditMode,
  error: previewError,
}: ProviderProps) => {
  const [error, setError] = useState<any>(null)
  const cms = useCMS()
  const github: GithubClient = cms.api.github
  const [authorizingStatus, setAuthorizingStatus] = useState<AuthState>(null)

  const openCompleteSetupModal = () => {
    setAuthorizingStatus('completeSetup')
  }

  const openAuthModal = () => {
    setAuthorizingStatus('authenticate')
  }

  const openForkModal = () => {
    setAuthorizingStatus('createFork')
  }

  const tryEnterEditMode = async () => {
    const validSetup =
      authorizingStatus === 'completeSetup' ||
      (github.baseRepoFullName && github.clientId)
    const authenticated =
      authorizingStatus === 'authenticate' || (await github.getUser())
    const forkValid =
      authorizingStatus === 'createFork' || (await github.getBranch())

    if (!validSetup) {
      return openCompleteSetupModal()
    }

    if (!authenticated) {
      return openAuthModal()
    }

    if (!forkValid) {
      return openForkModal()
    }

    enterEditMode()
  }

  return (
    <GithubEditingContext.Provider
      value={{
        editMode,
        enterEditMode: tryEnterEditMode,
        exitEditMode,
        setError,
      }}
    >
      {error && <GithubErrorModal error={error} />}
      {authorizingStatus && (
        <GithubAuthModal
          onUpdateAuthState={tryEnterEditMode}
          authState={authorizingStatus}
          close={() => {
            setAuthorizingStatus(null)
          }}
        />
      )}
      <PreviewErrorBoundary previewError={previewError}>
        {children}
      </PreviewErrorBoundary>
    </GithubEditingContext.Provider>
  )
}

interface Props {
  previewError: any
  children: any
}
function PreviewErrorBoundary(props: Props) {
  const github = useGithubEditing()

  useEffect(() => {
    ;(async () => {
      if (props.previewError) {
        github.setError(props.previewError)
      }
    })()
  }, [props.previewError])

  if (props.previewError) {
    return null
  }

  // don't show content with initial content error
  // because the data is likely missing
  return props.children
}
