import React from 'react'

export const VisualEditingContext = React.createContext({
  visualEditing: false,
})

export const useVisualEditingContext = () => {
  return React.useContext(VisualEditingContext)
}
