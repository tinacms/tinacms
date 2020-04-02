import React from 'react'

export interface OpenAuthoringProps {
  enterEditMode: () => void
  exitEditMode: () => void
  setError: (err: any) => void
}

export const OpenAuthoringContext = React.createContext<OpenAuthoringProps | null>(
  null
)
