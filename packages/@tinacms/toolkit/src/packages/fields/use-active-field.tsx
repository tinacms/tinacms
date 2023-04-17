import React, { useContext } from 'react'

const ActiveFieldContext = React.createContext({
  activeFieldName: null,
  setActiveFieldName: (value: string) => {},
})

export const ActiveFieldContextProvider = ActiveFieldContext.Provider

export const useActiveFieldContext = () => {
  const context = useContext(ActiveFieldContext)

  return context
}

export const useActiveFieldCallback = (name: string, callback: () => void) => {
  const context = useContext(ActiveFieldContext)
  React.useEffect(() => {
    if (context.activeFieldName === name) {
      callback()
    }
  }, [context.activeFieldName, name])
}
