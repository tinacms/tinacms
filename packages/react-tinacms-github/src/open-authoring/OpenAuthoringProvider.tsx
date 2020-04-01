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
import { getForkName, getHeadBranch } from './repository'
import { useCMS } from 'tinacms'
import OpenAuthoringErrorModal from '../github-error/OpenAuthoringErrorModal'
import OpenAuthoringAuthModal from './OpenAuthoringAuthModal'
import { withOpenAuthoringErrorHandler } from '../errors/withOpenAuthoringErrorHandler'

export interface OpenAuthoringContext {
  enterEditMode: () => void
  exitEditMode: () => void
  setError: (err) => void
}

export const OpenAuthoringContext = React.createContext<OpenAuthoringContext | null>(
  null
)

export function useOpenAuthoring() {
  const openAuthoringContext = React.useContext(OpenAuthoringContext)

  if (!openAuthoringContext) {
    throw new Error('useOpenAuthoring must be within an OpenAuthoringContext')
  }

  return openAuthoringContext
}

interface ProviderProps {
  children: any
  authenticate: () => Promise<void>
  enterEditMode: () => void
  exitEditMode: () => void
  error?: any
}

interface AuthState {
  authenticated: true
  forkValid: true
}

export const OpenAuthoringProvider = ({
  children,
  enterEditMode,
  exitEditMode,
  authenticate,
  error: previewError,
}: ProviderProps) => {
  const [error, setError] = useState(null)
  const cms = useCMS()
  const [authorizingStatus, setAuthorizingStatus] = useState<AuthState>(null)

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

  return (
    <OpenAuthoringContext.Provider
      value={{
        enterEditMode: tryEnterEditMode,
        exitEditMode,
        setError,
      }}
    >
      {error && <OpenAuthoringErrorModal error={error} />}
      {authorizingStatus && (
        <OpenAuthoringAuthModal
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
    </OpenAuthoringContext.Provider>
  )
}

const PreviewErrorBoundary: any = withOpenAuthoringErrorHandler(p => p.children)
