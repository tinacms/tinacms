/**

*/

import {
  EditProvider,
  TinaDataContext,
  isEditing,
  setEditing,
  useEditState as _useEditState,
} from '@tinacms/sharedctx'

import React, { useEffect, useState } from 'react'

/**
 * @deprecated since version 1.0.
 * Use "import { useEditState } from 'tinacms/dist/react'" instead.
 * See https://tina.io/blog/upgrading-to-iframe/ for full migration details
 */
const useEditState = _useEditState

export { isEditing, setEditing, useEditState }

/**
 * @deprecated since version 1.0.
 * Tina no longer requires wrapping your site in the TinaProvider
 * See https://tina.io/blog/upgrading-to-iframe/ for full migration details
 */
export const TinaEditProvider = ({
  showEditButton,
  ...props
}: {
  showEditButton?: boolean
  children: React.ReactNode
  editMode: React.ReactNode
}) => {
  return (
    <EditProvider>
      {showEditButton && <ToggleButton />}
      <TinaEditProviderInner {...props} />
    </EditProvider>
  )
}

/**
 * @deprecated since version 1.0.
 * Use "import { useTina } from 'tinacms/dist/react'" instead.
 * See https://tina.io/blog/upgrading-to-iframe/ for full migration details
 */
export function useTina<T extends object>({
  query,
  variables,
  data,
}: {
  query: string
  variables: object
  data: T
}): { data: T; isLoading: boolean } {
  React.useEffect(() => {
    console.warn(`
  "useTina" from 'tinacms/dist/edit-state' is now deprecated
  * Use "import { useTina } from 'tinacms/dist/react" instead.
  * See https://tina.io/blog/upgrading-to-iframe/ for full migration details
  `)
  }, [])

  const {
    setRequest,
    state,
    isDummyContainer,
    isLoading: contextLoading,
  } = React.useContext(TinaDataContext)

  const [waitForContextRerender, setWaitForContextRerender] = useState<boolean>(
    !isDummyContainer
  )

  const isLoading = contextLoading || waitForContextRerender

  React.useEffect(() => {
    setRequest({ query, variables })
  }, [JSON.stringify(variables), query])

  // A bit of a hack here
  // We need to wait 1 frame because the parent context will need to react to our
  // new query that we've just sent when this hook was initialized.
  // Otherwise, things get wonky when changing pages
  useEffect(() => {
    if (!isDummyContainer) {
      setTimeout(() => setWaitForContextRerender(false), 0)
    }

    return () => {
      setRequest(undefined) // unregister forms
    }
  }, [isDummyContainer])

  return {
    data: isDummyContainer || isLoading ? data : (state.payload as T),
    isLoading,
  }
}

const ToggleButton = () => {
  const { edit } = useEditState()

  const [isOnAdmin, setIsOnAdmin] = React.useState(false)

  React.useEffect(() => {
    if (window) {
      if (window.location?.pathname.startsWith('/admin')) {
        setIsOnAdmin(true)
      }
    }
  }, [setIsOnAdmin])

  return edit || isOnAdmin ? null : (
    <div
      style={{ position: 'fixed', bottom: '56px', left: '0px', zIndex: 200 }}
    >
      <a
        href="/admin"
        style={{
          borderRadius: '0 50px 50px 0',
          fontSize: '16px',
          fontFamily:
            "Inter, 'Helvetica Neue', 'Arial Nova', Helvetica, Arial, sans-serif",
          fontWeight: 'bold',
          textDecoration: 'none',
          background: 'rgb(34, 150, 254)',
          boxShadow:
            '0px 1px 3px rgb(0 0 0 / 10%), 0px 2px 6px rgb(0 0 0 / 20%)',
          color: 'white',
          padding: '14px 20px',
          border: 'none',
        }}
      >
        Edit with Tina
      </a>
    </div>
  )
}

const TinaEditProviderInner = ({ children, editMode }) => {
  const { edit } = useEditState()
  const [isBrowser, setIsBrowser] = React.useState(false)

  // Ensure Tina doesn't initialize server-side to prevent:
  // "Warning: Did not expect server HTML to contain a <div> in <div>."
  React.useEffect(() => {
    setIsBrowser(true)
  }, [])

  if (edit && isBrowser) {
    return editMode
  }

  return children
}
