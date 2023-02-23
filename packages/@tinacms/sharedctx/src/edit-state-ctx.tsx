/**

*/

import React, { ReactNode, useContext, useState } from 'react'

const LOCALSTORAGEKEY = 'tina.isEditing'

// need this to see if our site is being rendered on the server
const isSSR = typeof window === 'undefined'

export const isEditing = (): boolean => {
  if (!isSSR) {
    // localStorage may be intentionally disabled for site visitors,
    // in that case Tina can't be used so just return false
    const isEdit =
      window.localStorage && window.localStorage.getItem(LOCALSTORAGEKEY)
    return isEdit && isEdit === 'true'
  }
  // assume not editing if SSR
  return false
}

export const setEditing = (isEditing: boolean) => {
  if (!isSSR) {
    window.localStorage.setItem(LOCALSTORAGEKEY, isEditing ? 'true' : 'false')
  }
}

export const EditContext = React.createContext({
  edit: isEditing(),
  setEdit: undefined as (_edit: boolean) => void,
  formsRegistering: false,
  setFormsRegistering: undefined as (_value: boolean) => void,
})

export const TinaDataContext = React.createContext<{
  state: {
    payload: object
  }
  setRequest: (_props: { query: string; variables: object }) => void
  isLoading: boolean
  isDummyContainer?: boolean
}>({
  state: {
    payload: {},
  },
  setRequest: () => {},
  isLoading: false,
  isDummyContainer: true,
})

/*
  We will wrap our app in this so we will always be able to get the editmode state with `useEditMode`
*/
export const EditProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [edit, setEditState] = useState(
    // grabs the correct initial edit state from localstorage
    isEditing()
  )
  const [formsRegistering, setFormsRegistering] = useState(false)
  const setEdit = (edit: boolean) => {
    // set React state and localstorage
    setEditState(edit)
    setEditing(edit)
  }
  return (
    <EditContext.Provider
      value={{ edit, setEdit, formsRegistering, setFormsRegistering }}
    >
      {children}
    </EditContext.Provider>
  )
}

export const useEditState = () => {
  const { edit, setEdit } = useContext(EditContext)
  if (!setEdit) {
    throw new Error(
      'Unable to find `TinaProvider`; did you forget to add the TinaCMS container to your app root?  See our setup docs: https://tina.io/docs/introduction/tina-init/#adding-tina'
    )
  }
  return { edit, setEdit }
}
