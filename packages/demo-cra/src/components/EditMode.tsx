import React, { createContext, useContext, useState } from 'react'

export type EditModeContextValue = any
export type EditModeMutateContextValue = any

const EditModeContext: React.Context<EditModeContextValue> = createContext(null)
const EditModeMutateContext: React.Context<EditModeMutateContextValue> = createContext(
  null
)

function EditModeProvider({
  value,
  children,
}: {
  value: boolean
  children: any
}) {
  const [editMode, setEditMode] = useState(value)
  return (
    <EditModeContext.Provider value={editMode}>
      <EditModeMutateContext.Provider value={setEditMode}>
        {children}
      </EditModeMutateContext.Provider>
    </EditModeContext.Provider>
  )
}

function useEditMode() {
  return [useContext(EditModeContext), useContext(EditModeMutateContext)]
}

export { EditModeProvider, useEditMode }
