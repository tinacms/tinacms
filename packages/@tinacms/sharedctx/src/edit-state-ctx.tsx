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
