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

import React, { useState, useEffect, useCallback } from 'react'
import { getForkName, getHeadBranch } from './repository'
import { useCMS } from 'tinacms'
import GithubErrorModal from '../github-error/GithubErrorModal'
import GithubAuthModal from './GithubAuthModal'
import { GithubEditingContext } from './GithubEditingContext'
import { useGithubEditing } from './useGithubEditing'
import { authenticate as githubAuthenticate } from '../github-auth'

interface ProviderProps {
  children: any
  clientId: string
  authCallbackRoute: string
  enterEditMode: () => void
  exitEditMode: () => void
  error?: any
}

interface AuthState {
  authenticated: true
  forkValid: true
}

export const TinacmsGithubProvider = ({
  children,
  enterEditMode,
  exitEditMode,
  authCallbackRoute,
  clientId,
  error: previewError,
}: ProviderProps) => {
  const [error, setError] = useState<any>(null)
  const cms = useCMS()
  const [authorizingStatus, setAuthorizingStatus] = useState<AuthState | null>(
    null
  )

  const tryEnterEditMode = async () => {
    const authenticated =
      authorizingStatus?.authenticated || (await cms.api.github.getUser())
    const forkValid =
      authorizingStatus?.forkValid ||
      (await cms.api.github.getBranch(getForkName(), getHeadBranch()))

    if (authenticated && forkValid) {
      enterEditMode()
    } else {
      setAuthorizingStatus({
        authenticated,
        forkValid,
      })
    }
  }

  const authenticate = useCallback(() => {
    return githubAuthenticate(clientId, authCallbackRoute)
  }, [clientId, authCallbackRoute])

  return (
    <GithubEditingContext.Provider
      value={{
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
          authenticate={authenticate}
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
